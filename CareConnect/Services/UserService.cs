using CareConnect.Common;
using CareConnect.Models.Database.results;
using CareConnect.Repositories;

namespace CareConnect.Services
{
    public class UserService(IUserRepository _userRepository) : IUserService
    {
        /// <summary>
        /// Validates user credentials against the database.
        /// Retrieves user by email, then verifies password using BCrypt.
        /// </summary>
        /// <param name="email">User email address</param>
        /// <param name="password">Plain text password to verify</param>
        /// <returns>UserLoginResult if credentials valid, null otherwise</returns>
        public async Task<UserLoginResult?> ValidateUserAsync(string email, string password)
        {
            var authResult = await _userRepository.GetUserByEmailAsync(email);

            if (authResult == null)
            {
                return null;
            }

            if (PasswordHasher.IsBcryptHash(authResult.PasswordHash))
            {
                if (!PasswordHasher.VerifyPassword(password, authResult.PasswordHash))
                {
                    return null;
                }

                return _userRepository.ToLoginResult(authResult);
            }

            if (!PasswordHasher.VerifyLegacyPlainText(password, authResult.PasswordHash))
            {
                return null;
            }

            var upgradedHash = PasswordHasher.HashPassword(password);
            await _userRepository.UpdatePasswordHashAsync(authResult.UserId, upgradedHash);

            return _userRepository.ToLoginResult(authResult);
        }
    }
}

