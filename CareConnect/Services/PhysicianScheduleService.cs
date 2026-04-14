using CareConnect.Hubs;
using CareConnect.Models.Database.results;
using CareConnect.Models.Dtos;
using CareConnect.Repositories;
using Microsoft.AspNetCore.SignalR;

namespace CareConnect.Services
{
    public class PhysicianScheduleService(
        IPhysicianScheduleRepository _repository,
        IHubContext<SchedulingHub> _schedulingHubContext,
        IAppointmentSchedulingService _appointmentSchedulingService) : IPhysicianScheduleService
    {
        public async Task<IEnumerable<PhysicianScheduleResult>> GetAllPhysicianSchedules()
        {
            return await _repository.GetAllPhysicianSchedules();
        }

        public async Task<PhysicianScheduleResult?> GetPhysicianScheduleById(long physicianScheduleId)
        {
            if (physicianScheduleId <= 0)
            {
                return null;
            }

            return await _repository.GetPhysicianScheduleById(physicianScheduleId);
        }

        public async Task<IEnumerable<PhysicianScheduleResult>> GetPhysicianSchedulesByPhysicianId(long physicianId, DateTime? asOfDate = null, bool activeOnly = true)
        {
            if (physicianId <= 0)
            {
                return Enumerable.Empty<PhysicianScheduleResult>();
            }

            return await _repository.GetPhysicianSchedulesByPhysicianId(physicianId, asOfDate, activeOnly);
        }

        public async Task<(bool Success, string Message, PhysicianScheduleResult? Schedule)> CreatePhysicianSchedule(PhysicianScheduleDto physicianSchedule)
        {
            var validationMessage = ValidatePhysicianSchedule(physicianSchedule, isUpdate: false);
            if (validationMessage is not null)
            {
                return (false, validationMessage, null);
            }

            if (await HasScheduleOverlapAsync(physicianSchedule, isUpdate: false))
            {
                return (false, "Physician schedule overlaps an existing schedule.", null);
            }

            if (await HasAppointmentConflictForScheduleAsync(physicianSchedule))
            {
                return (false, "Physician schedule conflicts with existing appointments.", null);
            }

            var result = await _repository.CreatePhysicianSchedule(physicianSchedule);

            if (result is null)
            {
                return (false, "Failed to create physician schedule.", null);
            }

            await _schedulingHubContext.Clients.All.SendAsync(
                SchedulingHubEvents.PhysicianScheduleUpdated,
                new
                {
                    action = "created",
                    result.PhysicianScheduleId,
                    result.PhysicianId,
                    result.DayOfWeek,
                    result.StartTime,
                    result.EndTime,
                    result.EffectiveStartDate,
                    result.EffectiveEndDate,
                    result.IsActive
                });

            return (true, "Physician schedule created successfully.", result);
        }

        public async Task<(bool Success, string Message, PhysicianScheduleResult? Schedule)> UpdatePhysicianSchedule(PhysicianScheduleDto physicianSchedule)
        {
            var validationMessage = ValidatePhysicianSchedule(physicianSchedule, isUpdate: true);
            if (validationMessage is not null)
            {
                return (false, validationMessage, null);
            }

            if (await HasScheduleOverlapAsync(physicianSchedule, isUpdate: true))
            {
                return (false, "Physician schedule overlaps an existing schedule.", null);
            }

            if (await HasAppointmentConflictForScheduleAsync(physicianSchedule))
            {
                return (false, "Physician schedule conflicts with existing appointments.", null);
            }

            var result = await _repository.UpdatePhysicianSchedule(physicianSchedule);

            if (result is null)
            {
                return (false, "Failed to update physician schedule.", null);
            }

            await _schedulingHubContext.Clients.All.SendAsync(
                SchedulingHubEvents.PhysicianScheduleUpdated,
                new
                {
                    action = "updated",
                    result.PhysicianScheduleId,
                    result.PhysicianId,
                    result.DayOfWeek,
                    result.StartTime,
                    result.EndTime,
                    result.EffectiveStartDate,
                    result.EffectiveEndDate,
                    result.IsActive
                });

            return (true, "Physician schedule updated successfully.", result);
        }

        public async Task<string> DeletePhysicianScheduleById(long physicianScheduleId)
        {
            if (physicianScheduleId <= 0)
            {
                return "Physician schedule ID is required.";
            }

            var existingSchedule = await _repository.GetPhysicianScheduleById(physicianScheduleId);

            var result = await _repository.DeletePhysicianScheduleById(physicianScheduleId);

            if (result.Contains("successfully", StringComparison.OrdinalIgnoreCase))
            {
                await _schedulingHubContext.Clients.All.SendAsync(
                    SchedulingHubEvents.PhysicianScheduleUpdated,
                    new
                    {
                        action = "deleted",
                        PhysicianScheduleId = physicianScheduleId,
                        PhysicianId = existingSchedule?.PhysicianId,
                        DayOfWeek = existingSchedule?.DayOfWeek,
                        StartTime = existingSchedule?.StartTime,
                        EndTime = existingSchedule?.EndTime,
                        EffectiveStartDate = existingSchedule?.EffectiveStartDate,
                        EffectiveEndDate = existingSchedule?.EffectiveEndDate,
                        IsActive = existingSchedule?.IsActive
                    });
            }

            return result;
        }

        private async Task<bool> HasScheduleOverlapAsync(PhysicianScheduleDto physicianSchedule, bool isUpdate)
        {
            var existingSchedules = await _repository.GetPhysicianSchedulesByPhysicianId(
                physicianSchedule.PhysicianId,
                null,
                true
            );

            return existingSchedules.Any(existing =>
                existing.DayOfWeek == physicianSchedule.DayOfWeek
                && (!isUpdate || existing.PhysicianScheduleId != physicianSchedule.PhysicianScheduleId)
                && physicianSchedule.StartTime < existing.EndTime
                && physicianSchedule.EndTime > existing.StartTime
                && physicianSchedule.EffectiveStartDate <= (existing.EffectiveEndDate ?? DateTime.MaxValue.Date)
                && (physicianSchedule.EffectiveEndDate ?? DateTime.MaxValue.Date) >= existing.EffectiveStartDate);
        }

        private static string? ValidatePhysicianSchedule(PhysicianScheduleDto physicianSchedule, bool isUpdate)
        {
            if (isUpdate && physicianSchedule.PhysicianScheduleId <= 0)
            {
                return "Physician schedule ID is required.";
            }

            if (physicianSchedule.PhysicianId <= 0)
            {
                return "Physician ID is required.";
            }

            if (physicianSchedule.DayOfWeek < 1 || physicianSchedule.DayOfWeek > 7)
            {
                return "DayOfWeek must be between 1 and 7.";
            }

            if (physicianSchedule.StartTime >= physicianSchedule.EndTime)
            {
                return "Schedule start time must be earlier than end time.";
            }

            if (physicianSchedule.SlotDurationMinutes < 5 || physicianSchedule.SlotDurationMinutes > 240)
            {
                return "Slot duration must be between 5 and 240 minutes.";
            }

            if (physicianSchedule.EffectiveEndDate.HasValue
                && physicianSchedule.EffectiveStartDate.Date > physicianSchedule.EffectiveEndDate.Value.Date)
            {
                return "Effective start date must be on or before effective end date.";
            }

            return null;
        }

        private Task<bool> HasAppointmentConflictForScheduleAsync(PhysicianScheduleDto physicianSchedule)
        {
            return _appointmentSchedulingService.HasConflictingAppointmentsForScheduleAsync(physicianSchedule);
        }
    }
}