using CareConnect.Models.Database.results;

namespace CareConnect.Services
{
    public interface IUserService
    {
        Task<UserLoginResult?> ValidateUserAsync(string email, string password);
    }
}
