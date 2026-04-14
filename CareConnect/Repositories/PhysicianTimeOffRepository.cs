using CareConnect.Common;
using CareConnect.Models.Database.results;
using CareConnect.Models.Dtos;
using Dapper;
using System.Data;

namespace CareConnect.Repositories
{
    public class PhysicianTimeOffRepository(CareConnectContext _context, IDbSession _session) : BaseRepository(_session), IPhysicianTimeOffRepository
    {
        public async Task<IEnumerable<PhysicianTimeOffResult>> GetAllPhysicianTimeOff()
        {
            var result = await Connection.QueryAsync<PhysicianTimeOffResult>(
                "dbo.GetAllPhysicianTimeOff",
                commandType: CommandType.StoredProcedure,
                transaction: _session.Transaction
            );

            return result;
        }

        public async Task<PhysicianTimeOffResult?> GetPhysicianTimeOffById(long physicianTimeOffId)
        {
            var result = await Connection.QuerySingleOrDefaultAsync<PhysicianTimeOffResult>(
                "dbo.GetPhysicianTimeOffById",
                new { PhysicianTimeOffId = physicianTimeOffId },
                commandType: CommandType.StoredProcedure,
                transaction: _session.Transaction
            );

            return result;
        }

        public async Task<IEnumerable<PhysicianTimeOffResult>> GetPhysicianTimeOffByPhysicianId(long physicianId, DateTime? rangeStart = null, DateTime? rangeEnd = null)
        {
            var result = await Connection.QueryAsync<PhysicianTimeOffResult>(
                "dbo.GetPhysicianTimeOffByPhysicianId",
                new
                {
                    PhysicianId = physicianId,
                    RangeStart = rangeStart,
                    RangeEnd = rangeEnd
                },
                commandType: CommandType.StoredProcedure,
                transaction: _session.Transaction
            );

            return result;
        }

        public async Task<PhysicianTimeOffResult?> CreatePhysicianTimeOff(PhysicianTimeOffDto physicianTimeOff)
        {
            var result = await Connection.QuerySingleOrDefaultAsync<PhysicianTimeOffResult>(
                "dbo.CreatePhysicianTimeOff",
                new
                {
                    PhysicianId = physicianTimeOff.PhysicianId,
                    StartDateTime = physicianTimeOff.StartDateTime,
                    EndDateTime = physicianTimeOff.EndDateTime,
                    IsAllDay = physicianTimeOff.IsAllDay,
                    Reason = physicianTimeOff.Reason,
                    Notes = physicianTimeOff.Notes
                },
                commandType: CommandType.StoredProcedure,
                transaction: _session.Transaction
            );

            return result;
        }

        public async Task<PhysicianTimeOffResult?> UpdatePhysicianTimeOff(PhysicianTimeOffDto physicianTimeOff)
        {
            var result = await Connection.QuerySingleOrDefaultAsync<PhysicianTimeOffResult>(
                "dbo.UpdatePhysicianTimeOff",
                new
                {
                    PhysicianTimeOffId = physicianTimeOff.PhysicianTimeOffId,
                    PhysicianId = physicianTimeOff.PhysicianId,
                    StartDateTime = physicianTimeOff.StartDateTime,
                    EndDateTime = physicianTimeOff.EndDateTime,
                    IsAllDay = physicianTimeOff.IsAllDay,
                    Reason = physicianTimeOff.Reason,
                    Notes = physicianTimeOff.Notes
                },
                commandType: CommandType.StoredProcedure,
                transaction: _session.Transaction
            );

            return result;
        }

        public async Task<string> DeletePhysicianTimeOffById(long physicianTimeOffId)
        {
            await Connection.ExecuteAsync(
                "dbo.DeletePhysicianTimeOff",
                new { PhysicianTimeOffId = physicianTimeOffId },
                commandType: CommandType.StoredProcedure,
                transaction: _session.Transaction
            );

            return "Physician time off deleted successfully";
        }
    }
}