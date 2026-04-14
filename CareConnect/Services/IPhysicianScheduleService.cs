using CareConnect.Models.Database.results;
using CareConnect.Models.Dtos;

namespace CareConnect.Services
{
    public interface IPhysicianScheduleService
    {
        Task<IEnumerable<PhysicianScheduleResult>> GetAllPhysicianSchedules();
        Task<PhysicianScheduleResult?> GetPhysicianScheduleById(long physicianScheduleId);
        Task<IEnumerable<PhysicianScheduleResult>> GetPhysicianSchedulesByPhysicianId(long physicianId, DateTime? asOfDate = null, bool activeOnly = true);
        Task<(bool Success, string Message, PhysicianScheduleResult? Schedule)> CreatePhysicianSchedule(PhysicianScheduleDto physicianSchedule);
        Task<(bool Success, string Message, PhysicianScheduleResult? Schedule)> UpdatePhysicianSchedule(PhysicianScheduleDto physicianSchedule);
        Task<string> DeletePhysicianScheduleById(long physicianScheduleId);
    }
}