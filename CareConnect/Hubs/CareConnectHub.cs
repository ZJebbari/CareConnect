using Microsoft.AspNetCore.SignalR;

namespace CareConnect.Hubs
{
    public class CareConnectHub : Hub
    {
        // Client -> Server: can be called from Angular
        public async Task sendNotifaction(string message)
        {
            // Server -> All Clients
            await Clients.All.SendAsync("RecieveNotification", message);
        }

        public async Task UpdatePatient(long userID)
        {
            // Broodcast to all clients that patient was updated`
            await Clients.All.SendAsync("UpdatePatient", userID);
        }

        public async Task DeletePatient(long UserId)
        {
            await Clients.All.SendAsync("DeletePatient", UserId);
        }
    }
}
