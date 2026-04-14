using CareConnect.Common;
using CareConnect.Models.Database.results;
using Dapper;
using System.Data;

namespace CareConnect.Repositories
{
    public class AppointmentTypeRepository(CareConnectContext _context, IDbSession _session) : BaseRepository(_session), IAppointmentTypeRepository
    {
        public async Task<IEnumerable<AppointmentTypeResult>> GetAllAppointmentTypes()
        {
            var result = await Connection.QueryAsync<AppointmentTypeResult>(
                "dbo.GetAllAppointmentTypes",
                commandType: CommandType.StoredProcedure,
                transaction: _session.Transaction
            );

            return result;
        }
    }
}