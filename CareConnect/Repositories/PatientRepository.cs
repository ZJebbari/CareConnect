using CareConnect.Common;
using CareConnect.Models.Database.results;
using CareConnect.Models.Dtos;
using Dapper;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Data;
using System.Transactions;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory.Database;

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
                "DeletePatientByUserID",
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
                      parms.Password,
                      parms.Phone,
                      parms.RoleID,
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
