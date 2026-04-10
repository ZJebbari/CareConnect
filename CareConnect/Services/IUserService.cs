using CareConnect.Models.Database.results;
using CareConnect.Models.Dtos;

namespace CareConnect.Services
{
    public interface IUserService
    {
        Task<UserLoginResult?> ValidateUserAsync(string email, string password);
        Task<(bool Success, string Message)> SetPasswordAsync(SetPasswordDto request);
    }
}
