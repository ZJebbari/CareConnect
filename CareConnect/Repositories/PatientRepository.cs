using CareConnect.Common;
using CareConnect.Models.Database.results;
using CareConnect.Models.Dtos;
using Dapper;
using System.Data;

namespace CareConnect.Repositories
{
    public class PatientRepository (CareConnectContext _context, IDbSession _session) : BaseRepository(_session), IPatientRepository
    {
        public async Task<IEnumerable<PatientResult>> GetAllPatients()
        {
            var result = await Connection.QueryAsync<PatientResult>(
                "usp_Patient_GetAll",
                commandType: CommandType.StoredProcedure,
                transaction: _session.Transaction
            );

            return result;
        }

        public async Task<string> UpdatePatient(PatientDto patient)
        {
            var result = await Connection.QuerySingleAsync<string>(
                "usp_Patient_Update",
                new
                {
                    UserID = patient.UserId,
                    FullName = patient.FullName,
                    Email = patient.Email,
                    Phone = patient.Phone,
                    DateOfBirth = patient.DateOfBirth,
                    Address = patient.Address,
                    Gender = patient.Gender

                },
                 commandType: CommandType.StoredProcedure,
                transaction: _session.Transaction
                );
            return result;
        }

        public async Task<IEnumerable<PatientDto>> GetPatientByID(long patientID)
        {
            var result = await Connection.QueryAsync<PatientDto>(
                "GetPatientByID",
                new { PatientID = patientID },
                commandType: CommandType.StoredProcedure,
                transaction: _session.Transaction
                );
            return result;
        }

        public async Task<string> DeletePatientByUserID(long userID)
        {
            var result = await Connection.QueryAsync<string>(
                "dbo.usp_Patient_DeleteByUserID",
                new { UserID = userID },
                commandType: CommandType.StoredProcedure,
                transaction: _session.Transaction
            );

            return result.FirstOrDefault() ?? "No message returned from stored procedure.";
        }

        public async Task<string> CreatePatient(PatientDto parms)
        {
            var result = await Connection.QuerySingleAsync<PatientCreationResult>(
                "AddNewPatient",
                  new
                  {
                      parms.FullName,
                      parms.Email,
                      parms.Phone,
                      parms.DateOfBirth,
                      parms.Address,
                      parms.Gender
                  },
                commandType: CommandType.StoredProcedure,
                transaction: _session.Transaction
                );

            return result.Message;
        }

    }
}
