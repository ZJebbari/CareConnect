using CareConnect.Common;
using CareConnect.Models.Database.results;
using Dapper;
using System.Data;

namespace CareConnect.Repositories
{
    public class UserRepository(CareConnectContext _context, IDbSession _session): BaseRepository(_session), IUserRepository
    {
        public async Task<UserLoginResult?> LoginAsync(string email, string password)
        {
            var result = await Connection.QuerySingleOrDefaultAsync<UserLoginResult>(
                "usp_User_Login",
                new
                {
                    Email = email,
                    Password = password   // later -> hash
                },
                commandType: CommandType.StoredProcedure,
                transaction: _session.Transaction
            );

            return result;
        }
    }
}
