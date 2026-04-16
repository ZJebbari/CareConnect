using CareConnect.Models.Database.results;
using CareConnect.Models.Dtos;
using CareConnect.Repositories;
using CareConnect.Hubs;
using Microsoft.AspNetCore.SignalR;
using Microsoft.AspNetCore.Http;
using CareConnect.Common;
using Microsoft.Data.SqlClient;

namespace CareConnect.Services
{
    public class AppointmentSchedulingService(
        IAppointmentRepository _appointmentRepository,
        IPhysicianScheduleRepository _physicianScheduleRepository,
        IPhysicianTimeOffRepository _physicianTimeOffRepository,
        IHubContext<SchedulingHub> _schedulingHubContext,
        IUserService _userService,
        IHttpContextAccessor _httpContextAccessor) : IAppointmentSchedulingService
    {
        private static readonly TimeSpan AppointmentDuration = TimeSpan.FromHours(1);

        public async Task<(bool Success, string Message, Appointment? Appointment)> ScheduleAppointment(Appointment appointment)
        {
            var currentUser = _httpContextAccessor.HttpContext?.User;
            if (currentUser?.Identity?.IsAuthenticated == true && currentUser.IsInRole("Patient"))
            {
                var userId = CurrentUserHelper.GetUserId(currentUser);
                if (!userId.HasValue)
                {
                    return (false, "Authenticated patient user could not be resolved.", null);
                }

                var resolvedPatientId = await _userService.ResolvePatientIdByUserIdAsync(userId.Value);
                if (!resolvedPatientId.HasValue)
                {
                    return (false, "Patient profile was not found for authenticated user.", null);
                }

                appointment.PatientId = resolvedPatientId.Value;
            }

            var validationMessage = ValidateAppointmentRequest(appointment, isUpdate: false);
            if (validationMessage is not null)
            {
                return (false, validationMessage, null);
            }

            Appointment? createdAppointment;
            try
            {
                createdAppointment = await _appointmentRepository.CreateAppointment(appointment);
            }
            catch (SqlException ex) when (TryMapBookingConflict(ex, out var conflictMessage))
            {
                return (false, conflictMessage, null);
            }

            if (createdAppointment is null)
            {
                return (false, "Failed to create appointment.", null);
            }

            await _schedulingHubContext.Clients.All.SendAsync(
                SchedulingHubEvents.AppointmentCreated,
                new
                {
                    createdAppointment.AppointmentId,
                    createdAppointment.PatientId,
                    createdAppointment.PhysicianId,
                    createdAppointment.TypeId,
                    createdAppointment.AppointmentStatus,
                    createdAppointment.AppointmentTime
                });

            return (true, "Appointment scheduled successfully.", createdAppointment);
        }

        public async Task<(bool Success, string Message, Appointment? Appointment)> UpdateAppointment(Appointment appointment)
        {
            var validationMessage = ValidateAppointmentRequest(appointment, isUpdate: true);
            if (validationMessage is not null)
            {
                return (false, validationMessage, null);
            }

            var existingAppointment = await _appointmentRepository.GetAppointmentById(appointment.AppointmentId);
            if (existingAppointment is null)
            {
                return (false, "Appointment was not found.", null);
            }

            var availability = await ValidateAppointmentAvailabilityInternal(
                appointment.PhysicianId!.Value,
                appointment.AppointmentTime!.Value,
                appointment.AppointmentId);
            if (!availability.Success)
            {
                return (false, availability.Message, null);
            }

            appointment.AppointmentStatus ??= 1;
            appointment.CreatedAt = existingAppointment.CreatedAt;
            appointment.UpdatedAt = DateTime.UtcNow;

            var updatedAppointment = await _appointmentRepository.UpdateAppointment(appointment);
            if (updatedAppointment is null)
            {
                return (false, "Failed to update appointment.", null);
            }

            await _schedulingHubContext.Clients.All.SendAsync(
                SchedulingHubEvents.AppointmentUpdated,
                new
                {
                    updatedAppointment.AppointmentId,
                    updatedAppointment.PatientId,
                    updatedAppointment.PhysicianId,
                    updatedAppointment.TypeId,
                    updatedAppointment.AppointmentStatus,
                    updatedAppointment.AppointmentTime
                });

            return (true, "Appointment updated successfully.", updatedAppointment);
        }

        public async Task<(bool Success, string Message, Appointment? Appointment)> CancelAppointment(int appointmentId)
        {
            if (appointmentId <= 0)
            {
                return (false, "Appointment ID is required.", null);
            }

            var existingAppointment = await _appointmentRepository.GetAppointmentById(appointmentId);
            if (existingAppointment is null)
            {
                return (false, "Appointment was not found.", null);
            }

            if (existingAppointment.AppointmentStatus == 2)
            {
                return (false, "Appointment is already cancelled.", existingAppointment);
            }

            var cancelledAppointment = await _appointmentRepository.CancelAppointment(appointmentId, DateTime.UtcNow);
            if (cancelledAppointment is null)
            {
                return (false, "Failed to cancel appointment.", null);
            }

            await _schedulingHubContext.Clients.All.SendAsync(
                SchedulingHubEvents.AppointmentCancelled,
                new
                {
                    cancelledAppointment.AppointmentId,
                    cancelledAppointment.PatientId,
                    cancelledAppointment.PhysicianId,
                    cancelledAppointment.TypeId,
                    cancelledAppointment.AppointmentStatus,
                    cancelledAppointment.AppointmentTime
                });

            return (true, "Appointment cancelled successfully.", cancelledAppointment);
        }

        public async Task<(bool Success, string Message)> ValidateAppointmentAvailability(int physicianId, DateTime appointmentTime)
        {
            return await ValidateAppointmentAvailabilityInternal(physicianId, appointmentTime, null);
        }

        public async Task<(bool Success, string Message, IEnumerable<PatientAppointmentResult> Appointments)> GetUpcomingAppointmentsForCurrentPatient()
        {
            var patientId = await ResolveCurrentPatientIdAsync();
            if (!patientId.HasValue)
            {
                return (false, "Patient profile was not found for authenticated user.", Enumerable.Empty<PatientAppointmentResult>());
            }

            var nowUtc = DateTime.UtcNow;
            var appointments = (await _appointmentRepository.GetPatientAppointments(
                    patientId.Value,
                    fromDateTime: nowUtc,
                    appointmentStatus: 1))
                .Where(appointment => appointment.AppointmentStatus == 1 && appointment.AppointmentTime >= nowUtc)
                .OrderBy(appointment => appointment.AppointmentTime)
                .ToList();

            return (true, "Upcoming appointments retrieved successfully.", appointments);
        }

        public async Task<(bool Success, string Message, Appointment? Appointment)> CancelCurrentPatientAppointment(int appointmentId)
        {
            if (appointmentId <= 0)
            {
                return (false, "Appointment ID is required.", null);
            }

            var patientId = await ResolveCurrentPatientIdAsync();
            if (!patientId.HasValue)
            {
                return (false, "Patient profile was not found for authenticated user.", null);
            }

            var appointment = await _appointmentRepository.GetAppointmentById(appointmentId);
            if (appointment is null)
            {
                return (false, "Appointment was not found.", null);
            }

            if (appointment.PatientId != patientId.Value)
            {
                return (false, "You are not authorized to cancel this appointment.", null);
            }

            if (!appointment.AppointmentTime.HasValue || appointment.AppointmentTime.Value <= DateTime.UtcNow)
            {
                return (false, "Only future appointments can be cancelled.", appointment);
            }

            if (appointment.AppointmentStatus != 1)
            {
                return (false, "Only scheduled appointments can be cancelled.", appointment);
            }

            return await CancelAppointment(appointmentId);
        }

        private async Task<(bool Success, string Message)> ValidateAppointmentAvailabilityInternal(
            int physicianId,
            DateTime appointmentTime,
            int? excludedAppointmentId)
        {
            if (physicianId <= 0)
            {
                return (false, "Physician ID is required.");
            }

            var appointmentEnd = appointmentTime.Add(AppointmentDuration);

            var scheduleCoverage = await IsWithinPhysicianScheduleAsync(physicianId, appointmentTime, appointmentEnd);
            if (!scheduleCoverage)
            {
                return (false, "Appointment is outside the physician schedule.");
            }

            var overlapsTimeOff = await IsDuringPhysicianTimeOffAsync(physicianId, appointmentTime, appointmentEnd);
            if (overlapsTimeOff)
            {
                return (false, "Appointment falls during physician time off.");
            }

            var overlapsAppointment = await HasOverlappingAppointmentAsync(
                physicianId,
                appointmentTime,
                appointmentEnd,
                excludedAppointmentId);
            if (overlapsAppointment)
            {
                return (false, "Appointment overlaps an existing appointment.");
            }

            return (true, "Physician is available.");
        }

        public async Task<IEnumerable<DateTime>> GetAvailableAppointmentSlots(int physicianId, DateTime date, int? patientId = null)
        {
            if (physicianId <= 0)
            {
                return Enumerable.Empty<DateTime>();
            }

            var scheduleDate = date.Date;
            var dayOfWeek = MapDayOfWeek(scheduleDate.DayOfWeek);

            var schedules = (await _physicianScheduleRepository.GetPhysicianSchedulesByPhysicianId(physicianId, scheduleDate, true))
                .Where(schedule => schedule.DayOfWeek == dayOfWeek)
                .ToList();

            if (schedules.Count == 0)
            {
                return Enumerable.Empty<DateTime>();
            }

            var timeOffEntries = (await _physicianTimeOffRepository.GetPhysicianTimeOffByPhysicianId(
                physicianId,
                scheduleDate,
                scheduleDate.AddDays(1)))
                .ToList();

            var appointments = (await _appointmentRepository.GetPhysicianAppointments(
                physicianId,
                scheduleDate,
                scheduleDate.AddDays(1)))
                .Where(appointment => appointment.AppointmentStatus == 1)
                .ToList();

            List<PatientBlockingWindowResult> patientBlockingWindows = [];
            if (patientId.HasValue && patientId.Value > 0)
            {
                patientBlockingWindows = (await _appointmentRepository.GetPatientBlockingWindowsByDate(patientId.Value, scheduleDate)).ToList();
            }

            var nowUtc = DateTime.UtcNow;

            var availableSlots = new List<DateTime>();

            foreach (var schedule in schedules)
            {
                var slotStart = scheduleDate.Add(schedule.StartTime);
                var scheduleEnd = scheduleDate.Add(schedule.EndTime);

                while (slotStart.Add(AppointmentDuration) <= scheduleEnd)
                {
                    var slotEnd = slotStart.Add(AppointmentDuration);

                    var overlapsTimeOff = timeOffEntries.Any(timeOff => Overlaps(slotStart, slotEnd, timeOff.StartDateTime, timeOff.EndDateTime));
                    var overlapsAppointment = appointments.Any(appointment =>
                        appointment.AppointmentTime.HasValue
                        && Overlaps(slotStart, slotEnd, appointment.AppointmentTime.Value, appointment.AppointmentTime.Value.Add(AppointmentDuration)));
                    var overlapsPatientConflictWindow = patientBlockingWindows.Any(window =>
                        slotStart < window.BlockWindowEndUtcExclusive
                        && slotEnd > window.BlockWindowStartUtc);
                    var isPastSlot = slotStart <= nowUtc;

                    if (!overlapsTimeOff && !overlapsAppointment && !overlapsPatientConflictWindow && !isPastSlot)
                    {
                        availableSlots.Add(slotStart);
                    }

                    slotStart = slotStart.Add(AppointmentDuration);
                }
            }

            return availableSlots;
        }

        public async Task<IEnumerable<DoctorDayAppointmentResult>> GetDoctorDayAppointments(int physicianId, DateTime date)
        {
            if (physicianId <= 0)
            {
                return Enumerable.Empty<DoctorDayAppointmentResult>();
            }

            var appointments = await _appointmentRepository.GetDoctorDayAppointments(physicianId, date.Date);

            return appointments
                .OrderBy(appointment => appointment.AppointmentTime)
                .ToList();
        }

        public async Task<bool> HasConflictingAppointmentsForScheduleAsync(PhysicianScheduleDto physicianSchedule)
        {
            if (physicianSchedule.PhysicianId <= 0)
            {
                return false;
            }

            var rangeStart = physicianSchedule.EffectiveStartDate.Date;
            DateTime? rangeEnd = physicianSchedule.EffectiveEndDate?.Date.AddDays(1);

            var appointments = await _appointmentRepository.GetPhysicianAppointments(
                physicianSchedule.PhysicianId,
                rangeStart,
                rangeEnd);

            foreach (var appointment in appointments)
            {
                if (!appointment.AppointmentTime.HasValue)
                {
                    continue;
                }

                var appointmentStart = appointment.AppointmentTime.Value;
                var appointmentEnd = appointmentStart.Add(AppointmentDuration);

                if (!IsScheduleApplicableToDate(physicianSchedule, appointmentStart.Date))
                {
                    continue;
                }

                if (MapDayOfWeek(appointmentStart.DayOfWeek) != physicianSchedule.DayOfWeek)
                {
                    continue;
                }

                var scheduleStart = appointmentStart.Date.Add(physicianSchedule.StartTime);
                var scheduleEnd = appointmentStart.Date.Add(physicianSchedule.EndTime);

                if (appointmentStart < scheduleStart || appointmentEnd > scheduleEnd)
                {
                    return true;
                }
            }

            return false;
        }

        public async Task<bool> HasConflictingAppointmentsForTimeOffAsync(PhysicianTimeOffDto physicianTimeOff)
        {
            if (physicianTimeOff.PhysicianId <= 0)
            {
                return false;
            }

            var appointments = await _appointmentRepository.GetPhysicianAppointments(
                physicianTimeOff.PhysicianId,
                physicianTimeOff.StartDateTime,
                physicianTimeOff.EndDateTime);

            return appointments.Any(appointment =>
                appointment.AppointmentTime.HasValue
                && Overlaps(
                    physicianTimeOff.StartDateTime,
                    physicianTimeOff.EndDateTime,
                    appointment.AppointmentTime.Value,
                    appointment.AppointmentTime.Value.Add(AppointmentDuration)));
        }

        private async Task<bool> IsWithinPhysicianScheduleAsync(int physicianId, DateTime appointmentStart, DateTime appointmentEnd)
        {
            var dayOfWeek = MapDayOfWeek(appointmentStart.DayOfWeek);

            var schedules = await _physicianScheduleRepository.GetPhysicianSchedulesByPhysicianId(
                physicianId,
                appointmentStart.Date,
                true);

            return schedules.Any(schedule =>
                schedule.DayOfWeek == dayOfWeek
                && appointmentStart.Date >= schedule.EffectiveStartDate.Date
                && (!schedule.EffectiveEndDate.HasValue || appointmentStart.Date <= schedule.EffectiveEndDate.Value.Date)
                && appointmentStart.TimeOfDay >= schedule.StartTime
                && appointmentEnd.TimeOfDay <= schedule.EndTime);
        }

        private async Task<bool> IsDuringPhysicianTimeOffAsync(int physicianId, DateTime appointmentStart, DateTime appointmentEnd)
        {
            var timeOffEntries = await _physicianTimeOffRepository.GetPhysicianTimeOffByPhysicianId(
                physicianId,
                appointmentStart,
                appointmentEnd);

            return timeOffEntries.Any(timeOff => Overlaps(appointmentStart, appointmentEnd, timeOff.StartDateTime, timeOff.EndDateTime));
        }

        private async Task<bool> HasOverlappingAppointmentAsync(
            int physicianId,
            DateTime appointmentStart,
            DateTime appointmentEnd,
            int? excludedAppointmentId)
        {
            var dayAppointments = await _appointmentRepository.GetPhysicianAppointments(
                physicianId,
                appointmentStart.Date,
                appointmentStart.Date.AddDays(1));

            return dayAppointments.Any(existingAppointment =>
                (!excludedAppointmentId.HasValue || existingAppointment.AppointmentId != excludedAppointmentId.Value)
                && existingAppointment.AppointmentStatus == 1
                &&
                existingAppointment.AppointmentTime.HasValue
                && Overlaps(
                    appointmentStart,
                    appointmentEnd,
                    existingAppointment.AppointmentTime.Value,
                    existingAppointment.AppointmentTime.Value.Add(AppointmentDuration)));
        }

        private static string? ValidateAppointmentRequest(Appointment appointment, bool isUpdate)
        {
            if (isUpdate && appointment.AppointmentId <= 0)
            {
                return "Appointment ID is required.";
            }

            if (!appointment.PatientId.HasValue || appointment.PatientId.Value <= 0)
            {
                return "Patient ID is required.";
            }

            if (!appointment.PhysicianId.HasValue || appointment.PhysicianId.Value <= 0)
            {
                return "Physician ID is required.";
            }

            if (!appointment.TypeId.HasValue || appointment.TypeId.Value <= 0)
            {
                return "Appointment type is required.";
            }

            if (!appointment.AppointmentTime.HasValue)
            {
                return "Appointment time is required.";
            }

            return null;
        }

        private static bool IsScheduleApplicableToDate(PhysicianScheduleDto physicianSchedule, DateTime date)
        {
            return date >= physicianSchedule.EffectiveStartDate.Date
                && (!physicianSchedule.EffectiveEndDate.HasValue || date <= physicianSchedule.EffectiveEndDate.Value.Date);
        }

        private static int MapDayOfWeek(DayOfWeek dayOfWeek)
        {
            return dayOfWeek == DayOfWeek.Sunday ? 7 : (int)dayOfWeek;
        }

        private static bool Overlaps(DateTime firstStart, DateTime firstEnd, DateTime secondStart, DateTime secondEnd)
        {
            return firstStart < secondEnd && firstEnd > secondStart;
        }

        private async Task<int?> ResolveCurrentPatientIdAsync()
        {
            var currentUser = _httpContextAccessor.HttpContext?.User;
            if (currentUser?.Identity?.IsAuthenticated != true)
            {
                return null;
            }

            var userId = CurrentUserHelper.GetUserId(currentUser);
            if (!userId.HasValue)
            {
                return null;
            }

            return await _userService.ResolvePatientIdByUserIdAsync(userId.Value);
        }

        private static bool TryMapBookingConflict(SqlException ex, out string message)
        {
            var rawMessage = ex.Message ?? string.Empty;

            if (ex.Number == 2601 || ex.Number == 2627 || rawMessage.Contains("BOOKING_DENIED_DOCTOR_SLOT_TAKEN", StringComparison.OrdinalIgnoreCase))
            {
                message = "Selected time slot is no longer available for this doctor.";
                return true;
            }

            if (rawMessage.Contains("BOOKING_DENIED_PATIENT_SAME_DOCTOR_SAME_DAY", StringComparison.OrdinalIgnoreCase))
            {
                message = "Patient already has a scheduled appointment with this doctor on the selected day.";
                return true;
            }

            if (rawMessage.Contains("BOOKING_DENIED_PATIENT_TIME_CONFLICT_60_MIN", StringComparison.OrdinalIgnoreCase))
            {
                message = "Patient has another scheduled appointment within 60 minutes of the selected time.";
                return true;
            }

            message = string.Empty;
            return false;
        }
    }
}