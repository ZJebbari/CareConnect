using CareConnect.Models.Database.results;
using CareConnect.Models.Dtos;

namespace CareConnect.Services
{
    public interface IPhysicianTimeOffService
    {
        Task<IEnumerable<PhysicianTimeOffResult>> GetAllPhysicianTimeOff();
        Task<PhysicianTimeOffResult?> GetPhysicianTimeOffById(long physicianTimeOffId);
        Task<IEnumerable<PhysicianTimeOffResult>> GetPhysicianTimeOffByPhysicianId(long physicianId, DateTime? rangeStart = null, DateTime? rangeEnd = null);
        Task<(bool Success, string Message, PhysicianTimeOffResult? TimeOff)> CreatePhysicianTimeOff(PhysicianTimeOffDto physicianTimeOff);
        Task<(bool Success, string Message, PhysicianTimeOffResult? TimeOff)> UpdatePhysicianTimeOff(PhysicianTimeOffDto physicianTimeOff);
        Task<string> DeletePhysicianTimeOffById(long physicianTimeOffId);
    }
}