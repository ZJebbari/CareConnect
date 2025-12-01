using CareConnect.Models.Database.results;

namespace CareConnect.Repositories
{
    public interface IUserRepository
    {
        Task<UserLoginResult> LoginAsync(string email, string password);
    }
}
