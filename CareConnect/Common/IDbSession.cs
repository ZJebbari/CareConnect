using System.Data;

namespace CareConnect.Common
{
    public interface IDbSession
    {
        IDbConnection Connection { get; }
        IDbTransaction Transaction { get; }
        event Func<Task>? Committed;
        event Action? Rollbacked;
        void BeginTransaction(IsolationLevel isolationLevel = IsolationLevel.ReadCommitted);
        Task CommitTransaction();
        void RollbackTransaction();
    }
}
