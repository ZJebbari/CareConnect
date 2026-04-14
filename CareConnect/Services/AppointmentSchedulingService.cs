using CareConnect.Models.Database.results;
using CareConnect.Models.Dtos;
using CareConnect.Repositories;
using CareConnect.Hubs;
using Microsoft.AspNetCore.SignalR;

namespace CareConnect.Services
{
    public class AppointmentSchedulingService(
        IAppointmentRepository _appointmentRepository,
        IPhysicianScheduleRepository _physicianScheduleRepository,
        IPhysicianTimeOffRepository _physicianTimeOffRepository,
        IHubContext<SchedulingHub> _schedulingHubContext) : IAppointmentSchedulingService
    {
        private static readonly TimeSpan AppointmentDuration = TimeSpan.FromHours(1);

        public async Task<(bool Success, string Message, Appointment? Appointment)> ScheduleAppointment(Appointment appointment)
        {
            var validationMessage = ValidateAppointmentRequest(appointment, isUpdate: false);
            if (validationMessage is not null)
            {
                return (false, validationMessage, null);
            }

            var availability = await ValidateAppointmentAvailabilityInternal(
                appointment.PhysicianId!.Value,
                appointment.AppointmentTime!.Value,
                null);
            if (!availability.Success)
            {
                return (false, availability.Message, null);
            }

            appointment.AppointmentStatus ??= true;
            appointment.CreatedAt ??= DateTime.UtcNow;
            appointment.UpdatedAt = null;

            var createdAppointment = await _appointmentRepository.CreateAppointment(appointment);
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

            appointment.AppointmentStatus ??= true;
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

            if (existingAppointment.AppointmentStatus.HasValue && !existingAppointment.AppointmentStatus.Value)
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

        public async Task<IEnumerable<DateTime>> GetAvailableAppointmentSlots(int physicianId, DateTime date)
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
                .ToList();

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

                    if (!overlapsTimeOff && !overlapsAppointment)
                    {
                        availableSlots.Add(slotStart);
                    }

                    slotStart = slotStart.Add(AppointmentDuration);
                }
            }

            return availableSlots;
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
                && (existingAppointment.AppointmentStatus is null || existingAppointment.AppointmentStatus.Value)
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
    }
}