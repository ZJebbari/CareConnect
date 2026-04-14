using CareConnect.Common;
using CareConnect.Models.Database.results;
using CareConnect.Models.Dtos;
using Dapper;
using System.Data;

namespace CareConnect.Repositories
{
    public class PhysicianScheduleRepository(CareConnectContext _context, IDbSession _session) : BaseRepository(_session), IPhysicianScheduleRepository
    {
        public async Task<IEnumerable<PhysicianScheduleResult>> GetAllPhysicianSchedules()
        {
            var result = await Connection.QueryAsync<PhysicianScheduleResult>(
                "dbo.GetAllPhysicianSchedules",
                commandType: CommandType.StoredProcedure,
                transaction: _session.Transaction
            );

            return result;
        }

        public async Task<PhysicianScheduleResult?> GetPhysicianScheduleById(long physicianScheduleId)
        {
            var result = await Connection.QuerySingleOrDefaultAsync<PhysicianScheduleResult>(
                "dbo.GetPhysicianScheduleById",
                new { PhysicianScheduleId = physicianScheduleId },
                commandType: CommandType.StoredProcedure,
                transaction: _session.Transaction
            );

            return result;
        }

        public async Task<IEnumerable<PhysicianScheduleResult>> GetPhysicianSchedulesByPhysicianId(long physicianId, DateTime? asOfDate = null, bool activeOnly = true)
        {
            var result = await Connection.QueryAsync<PhysicianScheduleResult>(
                "dbo.GetPhysicianSchedulesByPhysicianId",
                new
                {
                    PhysicianId = physicianId,
                    AsOfDate = asOfDate,
                    ActiveOnly = activeOnly
                },
                commandType: CommandType.StoredProcedure,
                transaction: _session.Transaction
            );

            return result;
        }

        public async Task<PhysicianScheduleResult?> CreatePhysicianSchedule(PhysicianScheduleDto physicianSchedule)
        {
            var result = await Connection.QuerySingleOrDefaultAsync<PhysicianScheduleResult>(
                "dbo.CreatePhysicianSchedule",
                new
                {
                    PhysicianId = physicianSchedule.PhysicianId,
                    DayOfWeek = physicianSchedule.DayOfWeek,
                    StartTime = physicianSchedule.StartTime,
                    EndTime = physicianSchedule.EndTime,
                    SlotDurationMinutes = physicianSchedule.SlotDurationMinutes,
                    EffectiveStartDate = physicianSchedule.EffectiveStartDate,
                    EffectiveEndDate = physicianSchedule.EffectiveEndDate,
                    IsActive = physicianSchedule.IsActive
                },
                commandType: CommandType.StoredProcedure,
                transaction: _session.Transaction
            );

            return result;
        }

        public async Task<PhysicianScheduleResult?> UpdatePhysicianSchedule(PhysicianScheduleDto physicianSchedule)
        {
            var result = await Connection.QuerySingleOrDefaultAsync<PhysicianScheduleResult>(
                "dbo.UpdatePhysicianSchedule",
                new
                {
                    PhysicianScheduleId = physicianSchedule.PhysicianScheduleId,
                    PhysicianId = physicianSchedule.PhysicianId,
                    DayOfWeek = physicianSchedule.DayOfWeek,
                    StartTime = physicianSchedule.StartTime,
                    EndTime = physicianSchedule.EndTime,
                    SlotDurationMinutes = physicianSchedule.SlotDurationMinutes,
                    EffectiveStartDate = physicianSchedule.EffectiveStartDate,
                    EffectiveEndDate = physicianSchedule.EffectiveEndDate,
                    IsActive = physicianSchedule.IsActive
                },
                commandType: CommandType.StoredProcedure,
                transaction: _session.Transaction
            );

            return result;
        }

        public async Task<string> DeletePhysicianScheduleById(long physicianScheduleId)
        {
            await Connection.ExecuteAsync(
                "dbo.DeletePhysicianSchedule",
                new { PhysicianScheduleId = physicianScheduleId },
                commandType: CommandType.StoredProcedure,
                transaction: _session.Transaction
            );

            return "Physician schedule deleted successfully";
        }
    }
}