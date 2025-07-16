using System.Data;

namespace CareConnect.Common
{
    public abstract class BaseRepository(IDbSession _dbSession)
    {
        protected IDbConnection Connection => _dbSession.Connection;
        protected IDbTransaction Transaction => _dbSession.Transaction;
    }
}
