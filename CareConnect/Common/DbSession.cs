using System.Data;
using Microsoft.Data.SqlClient;

namespace CareConnect.Common
{
    public class DbSession : IDbSession, IDisposable
    {
        private readonly IDbConnection _connection;
        private IDbTransaction? _transaction;
        private bool _disposed;

        public event Func<Task>? Committed;
        public event Action? Rollbacked;

        public DbSession(string connectionString)
        {
            _connection = new SqlConnection(connectionString);
            _connection.Open();
        }

        public IDbConnection Connection => _connection;
        public IDbTransaction Transaction => _transaction;

        public void BeginTransaction(IsolationLevel level = IsolationLevel.ReadCommitted)
        {
            _transaction ??= _connection.BeginTransaction(level);
        }

        public async Task CommitTransaction()
        {
            if (_transaction != null)
            {
                _transaction.Commit();
                _transaction.Dispose();
                _transaction = null;

                if (Committed != null)
                {
                    await Committed.Invoke();
                }
            }
        }

        public void RollbackTransaction()
        {
            _transaction?.Dispose();
            _transaction = null;
            _connection.Dispose();
            Rollbacked?.Invoke();
        }

        public void Dispose()
        {
            Dispose(true);
        }

        protected virtual void Dispose(bool disposing)
        {
            if (!_disposed)
            {
                if (disposing)
                {
                    try
                    {
                        _transaction?.Dispose();
                        _transaction = null;
                    }
                    finally
                    {
                        _connection.Dispose();
                    }
                }

                _disposed = true;
            }
        }
    }
}