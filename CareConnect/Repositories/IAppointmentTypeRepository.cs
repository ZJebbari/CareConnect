using CareConnect.Models.Database.results;

namespace CareConnect.Repositories
{
    public interface IAppointmentTypeRepository
    {
        Task<IEnumerable<AppointmentTypeResult>> GetAllAppointmentTypes();
    }
}