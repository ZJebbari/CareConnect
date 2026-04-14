using CareConnect.Models.Database.results;
using CareConnect.Models.Dtos;

namespace CareConnect.Repositories
{
    public interface IPhysicianTimeOffRepository
    {
        Task<IEnumerable<PhysicianTimeOffResult>> GetAllPhysicianTimeOff();
        Task<PhysicianTimeOffResult?> GetPhysicianTimeOffById(long physicianTimeOffId);
        Task<IEnumerable<PhysicianTimeOffResult>> GetPhysicianTimeOffByPhysicianId(long physicianId, DateTime? rangeStart = null, DateTime? rangeEnd = null);
        Task<PhysicianTimeOffResult?> CreatePhysicianTimeOff(PhysicianTimeOffDto physicianTimeOff);
        Task<PhysicianTimeOffResult?> UpdatePhysicianTimeOff(PhysicianTimeOffDto physicianTimeOff);
        Task<string> DeletePhysicianTimeOffById(long physicianTimeOffId);
    }
}