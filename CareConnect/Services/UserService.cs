using CareConnect.Models.Database.results;
using CareConnect.Repositories;

namespace CareConnect.Services
{
    public class UserService(IUserRepository _userRepository) : IUserService
    {
        public Task<UserLoginResult?> ValidateUserAsync(string email, string password)
        {
            // later you can add password hashing, lockout, etc.
            return _userRepository.LoginAsync(email, password);
        }
    }
}
