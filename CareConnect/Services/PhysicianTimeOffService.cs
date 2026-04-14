using CareConnect.Hubs;
using CareConnect.Models.Database.results;
using CareConnect.Models.Dtos;
using CareConnect.Repositories;
using Microsoft.AspNetCore.SignalR;

namespace CareConnect.Services
{
    public class PhysicianTimeOffService(
        IPhysicianTimeOffRepository _repository,
        IHubContext<SchedulingHub> _schedulingHubContext,
        IAppointmentSchedulingService _appointmentSchedulingService) : IPhysicianTimeOffService
    {
        public async Task<IEnumerable<PhysicianTimeOffResult>> GetAllPhysicianTimeOff()
        {
            return await _repository.GetAllPhysicianTimeOff();
        }

        public async Task<PhysicianTimeOffResult?> GetPhysicianTimeOffById(long physicianTimeOffId)
        {
            if (physicianTimeOffId <= 0)
            {
                return null;
            }

            return await _repository.GetPhysicianTimeOffById(physicianTimeOffId);
        }

        public async Task<IEnumerable<PhysicianTimeOffResult>> GetPhysicianTimeOffByPhysicianId(long physicianId, DateTime? rangeStart = null, DateTime? rangeEnd = null)
        {
            if (physicianId <= 0)
            {
                return Enumerable.Empty<PhysicianTimeOffResult>();
            }

            return await _repository.GetPhysicianTimeOffByPhysicianId(physicianId, rangeStart, rangeEnd);
        }

        public async Task<(bool Success, string Message, PhysicianTimeOffResult? TimeOff)> CreatePhysicianTimeOff(PhysicianTimeOffDto physicianTimeOff)
        {
            var validationMessage = ValidatePhysicianTimeOff(physicianTimeOff, isUpdate: false);
            if (validationMessage is not null)
            {
                return (false, validationMessage, null);
            }

            if (await HasTimeOffOverlapAsync(physicianTimeOff, isUpdate: false))
            {
                return (false, "Physician time off overlaps an existing entry.", null);
            }

            if (await HasAppointmentConflictForTimeOffAsync(physicianTimeOff))
            {
                return (false, "Physician time off conflicts with existing appointments.", null);
            }

            var result = await _repository.CreatePhysicianTimeOff(physicianTimeOff);

            if (result is null)
            {
                return (false, "Failed to create physician time off.", null);
            }

            await _schedulingHubContext.Clients.All.SendAsync(
                SchedulingHubEvents.PhysicianTimeOffUpdated,
                new
                {
                    action = "created",
                    result.PhysicianTimeOffId,
                    result.PhysicianId,
                    result.StartDateTime,
                    result.EndDateTime,
                    result.IsAllDay,
                    result.Reason,
                    result.Notes
                });

            return (true, "Physician time off created successfully.", result);
        }

        public async Task<(bool Success, string Message, PhysicianTimeOffResult? TimeOff)> UpdatePhysicianTimeOff(PhysicianTimeOffDto physicianTimeOff)
        {
            var validationMessage = ValidatePhysicianTimeOff(physicianTimeOff, isUpdate: true);
            if (validationMessage is not null)
            {
                return (false, validationMessage, null);
            }

            if (await HasTimeOffOverlapAsync(physicianTimeOff, isUpdate: true))
            {
                return (false, "Physician time off overlaps an existing entry.", null);
            }

            if (await HasAppointmentConflictForTimeOffAsync(physicianTimeOff))
            {
                return (false, "Physician time off conflicts with existing appointments.", null);
            }

            var result = await _repository.UpdatePhysicianTimeOff(physicianTimeOff);

            if (result is null)
            {
                return (false, "Failed to update physician time off.", null);
            }

            await _schedulingHubContext.Clients.All.SendAsync(
                SchedulingHubEvents.PhysicianTimeOffUpdated,
                new
                {
                    action = "updated",
                    result.PhysicianTimeOffId,
                    result.PhysicianId,
                    result.StartDateTime,
                    result.EndDateTime,
                    result.IsAllDay,
                    result.Reason,
                    result.Notes
                });

            return (true, "Physician time off updated successfully.", result);
        }

        public async Task<string> DeletePhysicianTimeOffById(long physicianTimeOffId)
        {
            if (physicianTimeOffId <= 0)
            {
                return "Physician time off ID is required.";
            }

            var existingTimeOff = await _repository.GetPhysicianTimeOffById(physicianTimeOffId);

            var result = await _repository.DeletePhysicianTimeOffById(physicianTimeOffId);

            if (result.Contains("successfully", StringComparison.OrdinalIgnoreCase))
            {
                await _schedulingHubContext.Clients.All.SendAsync(
                    SchedulingHubEvents.PhysicianTimeOffUpdated,
                    new
                    {
                        action = "deleted",
                        PhysicianTimeOffId = physicianTimeOffId,
                        PhysicianId = existingTimeOff?.PhysicianId,
                        StartDateTime = existingTimeOff?.StartDateTime,
                        EndDateTime = existingTimeOff?.EndDateTime,
                        IsAllDay = existingTimeOff?.IsAllDay,
                        Reason = existingTimeOff?.Reason,
                        Notes = existingTimeOff?.Notes
                    });
            }

            return result;
        }

        private async Task<bool> HasTimeOffOverlapAsync(PhysicianTimeOffDto physicianTimeOff, bool isUpdate)
        {
            var existingTimeOff = await _repository.GetPhysicianTimeOffByPhysicianId(
                physicianTimeOff.PhysicianId,
                physicianTimeOff.StartDateTime,
                physicianTimeOff.EndDateTime
            );

            return existingTimeOff.Any(existing =>
                (!isUpdate || existing.PhysicianTimeOffId != physicianTimeOff.PhysicianTimeOffId)
                && physicianTimeOff.StartDateTime < existing.EndDateTime
                && physicianTimeOff.EndDateTime > existing.StartDateTime);
        }

        private static string? ValidatePhysicianTimeOff(PhysicianTimeOffDto physicianTimeOff, bool isUpdate)
        {
            if (isUpdate && physicianTimeOff.PhysicianTimeOffId <= 0)
            {
                return "Physician time off ID is required.";
            }

            if (physicianTimeOff.PhysicianId <= 0)
            {
                return "Physician ID is required.";
            }

            if (physicianTimeOff.StartDateTime >= physicianTimeOff.EndDateTime)
            {
                return "Time off start must be earlier than end.";
            }

            return null;
        }

        private Task<bool> HasAppointmentConflictForTimeOffAsync(PhysicianTimeOffDto physicianTimeOff)
        {
            return _appointmentSchedulingService.HasConflictingAppointmentsForTimeOffAsync(physicianTimeOff);
        }
    }
}