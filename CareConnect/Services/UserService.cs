using CareConnect.Common;
using CareConnect.Models.Database.results;
using CareConnect.Models.Dtos;
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

        public async Task<(bool Success, string Message)> SetPasswordAsync(SetPasswordDto request)
        {
            if (string.IsNullOrWhiteSpace(request.Email)
                || string.IsNullOrWhiteSpace(request.CurrentPassword)
                || string.IsNullOrWhiteSpace(request.NewPassword))
            {
                return (false, "Email, current password, and new password are required.");
            }

            if (request.NewPassword.Length < 8)
            {
                return (false, "New password must be at least 8 characters.");
            }

            var user = await ValidateUserAsync(request.Email, request.CurrentPassword);
            if (user == null)
            {
                return (false, "Current credentials are invalid.");
            }

            var role = user.RoleName?.Trim().ToLowerInvariant();
            if (role != "admin" && role != "personnel" && role != "support")
            {
                return (false, "Password setup/reset is only available for admin and personnel accounts.");
            }

            if (string.Equals(request.CurrentPassword, request.NewPassword, StringComparison.Ordinal))
            {
                return (false, "New password must be different from current password.");
            }

            var newHash = PasswordHasher.HashPassword(request.NewPassword);
            await _userRepository.UpdatePasswordHashAsync(user.UserId, newHash);

            return (true, "Password updated successfully.");
        }
    }
}

