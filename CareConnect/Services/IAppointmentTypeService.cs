using CareConnect.Models.Database.results;

namespace CareConnect.Services
{
    public interface IAppointmentTypeService
    {
        Task<IEnumerable<AppointmentTypeResult>> GetAllAppointmentTypes();
    }
}