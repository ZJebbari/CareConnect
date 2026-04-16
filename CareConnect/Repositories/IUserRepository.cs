using CareConnect.Models.Database.results;
using CareConnect.Models.Dtos;

namespace CareConnect.Repositories
{
    public interface IUserRepository
    {
        /// <summary>
        /// Retrieves user by email with password hash for authentication.
        /// Password verification (BCrypt comparison) happens in UserService, not SQL.
        /// </summary>
        /// <param name="email">User email address</param>
        /// <returns>UserAuthResult with password hash, or null if user not found</returns>
        Task<UserAuthResult?> GetUserByEmailAsync(string email);

        /// <summary>
        /// Converts UserAuthResult to UserLoginResult (removes sensitive password data).
        /// </summary>
        UserLoginResult ToLoginResult(UserAuthResult authResult);

        Task UpdatePasswordHashAsync(int userId, string passwordHash);
        Task<PatientRegistrationResult?> RegisterPatientAsync(PatientRegistrationDto registration, string passwordHash);
        Task<PatientIdentityResult?> GetPatientByUserIdAsync(int userId);
    }
}

