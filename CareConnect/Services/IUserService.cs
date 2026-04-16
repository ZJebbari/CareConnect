using CareConnect.Models.Database.results;
using CareConnect.Models.Dtos;

namespace CareConnect.Services
{
    public interface IUserService
    {
        Task<UserLoginResult?> ValidateUserAsync(string email, string password);
        Task<(bool Success, string Message)> SetPasswordAsync(SetPasswordDto request);
        Task<(bool Success, string Message, PatientRegistrationResult? Data)> RegisterPatientAsync(PatientRegistrationDto request);
        Task<int?> ResolvePatientIdByUserIdAsync(int userId);
    }
}
