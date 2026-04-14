using CareConnect.Models.Database.results;
using CareConnect.Repositories;

namespace CareConnect.Services
{
    public class AppointmentTypeService(IAppointmentTypeRepository _repository) : IAppointmentTypeService
    {
        public async Task<IEnumerable<AppointmentTypeResult>> GetAllAppointmentTypes()
        {
            return await _repository.GetAllAppointmentTypes();
        }
    }
}