using CareConnect.Models.Database.results;
using CareConnect.Models.Dtos;

namespace CareConnect.Repositories
{
    public interface IPhysicianScheduleRepository
    {
        Task<IEnumerable<PhysicianScheduleResult>> GetAllPhysicianSchedules();
        Task<PhysicianScheduleResult?> GetPhysicianScheduleById(long physicianScheduleId);
        Task<IEnumerable<PhysicianScheduleResult>> GetPhysicianSchedulesByPhysicianId(long physicianId, DateTime? asOfDate = null, bool activeOnly = true);
        Task<PhysicianScheduleResult?> CreatePhysicianSchedule(PhysicianScheduleDto physicianSchedule);
        Task<PhysicianScheduleResult?> UpdatePhysicianSchedule(PhysicianScheduleDto physicianSchedule);
        Task<string> DeletePhysicianScheduleById(long physicianScheduleId);
    }
}