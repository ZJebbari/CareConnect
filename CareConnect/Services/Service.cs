
using CareConnect.Hubs;
using CareConnect.Models.Database.results;
using CareConnect.Repositories;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.IdentityModel.Tokens;

namespace CareConnect.Services
{
    public class Service(IRepository _repository, IHubContext<CareConnectHub> _hubContext) : IService
    {

        public async Task<IEnumerable<PatientResult>> GetAllPatients()
        {
            return await _repository.GetAllPatients();
        }

        public async Task<string> UpdatePatient(PatientDto patient)
        {
            var result =  await _repository.UpdatePatient(patient);

            if (patient.UserId != 0)
            {
                await _hubContext.Clients.All.SendAsync("UpdatePatient", patient.UserId);
            }

            return result;
        }

        public async Task<IEnumerable<PatientDto>> GetPatientByID(long patientID)
        {
            return await _repository.GetPatientByID(patientID);
        }

        public async Task<string> DeletePatientByUserID(long patientID)
        {
            var result = await _repository.DeletePatientByUserID(patientID);

            if (patientID != 0)
            {
                await _hubContext.Clients.All.SendAsync("DeletePatient", patientID);
            }

            return result;
        }

        public async Task<string> CreatePatient([FromForm] PatientDto patient)
        {
            return await _repository.CreatePatient(patient);
        }
    }
}
