using CareConnect.Common;
using CareConnect.Models.Database.results;
using Dapper;
using System.Data;

namespace CareConnect.Repositories
{
    public class UserRepository(CareConnectContext _context, IDbSession _session): BaseRepository(_session), IUserRepository
    {
        /// <summary>
        /// Retrieves user by email including password hash for authentication.
        /// Password verification (BCrypt comparison) happens in C#, not SQL.
        /// </summary>
        public async Task<UserAuthResult?> GetUserByEmailAsync(string email)
        {
            var result = await Connection.QuerySingleOrDefaultAsync<UserAuthResult>(
                @"
                    SELECT 
                        u.UserID as UserId,
                        u.FullName,
                        u.Email,
                        u.Phone,
                        u.RoleID as RoleId,
                        r.Name as RoleName,
                        u.Password as PasswordHash
                    FROM dbo.Users u
                    INNER JOIN dbo.Roles r ON r.RoleID = u.RoleID
                    WHERE u.Email = @Email
                ",
                new { Email = email },
                commandType: CommandType.Text,
                transaction: _session.Transaction
            );

            return result;
        }

        /// <summary>
        /// Converts UserAuthResult to UserLoginResult, removing sensitive password data.
        /// </summary>
        public UserLoginResult ToLoginResult(UserAuthResult authResult)
        {
            return new UserLoginResult
            {
                UserId = authResult.UserId,
                FullName = authResult.FullName,
                Email = authResult.Email,
                Phone = authResult.Phone,
                RoleId = authResult.RoleId,
                RoleName = authResult.RoleName
            };
        }

        public async Task UpdatePasswordHashAsync(int userId, string passwordHash)
        {
            await Connection.ExecuteAsync(
                @"UPDATE dbo.Users SET Password = @PasswordHash WHERE UserID = @UserID",
                new { UserID = userId, PasswordHash = passwordHash },
                commandType: CommandType.Text,
                transaction: _session.Transaction
            );
        }
    }
}
