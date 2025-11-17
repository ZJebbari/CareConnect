import { Injectable, signal } from "@angular/core";
import * as signalR from '@microsoft/signalr';

@Injectable({
  providedIn: "root",
})
export class SocketService {
  private hubConnection!: signalR.HubConnection;

  // Signals that your app can read from the server
  public notification = signal<string | null>(null);
  public updatedPatient = signal<number | null>(null);
  public deletedPatient = signal<number | null>(null);

  constructor() {
    this.startConnection();
    this.registerEvents();
  }

  private startConnection() {
    this.hubConnection = new signalR.HubConnectionBuilder()
      // ✅ FIXED: hub URL must match MapHub<CareConnectHub>("/careconnectHub")
      .withUrl("https://localhost:7079/careconnectHub")
      .withAutomaticReconnect()
      .build();

    this.hubConnection
      .start()
      .then(() => console.log('%c🔌 Socket Connected', 'color: green'))
      .catch((err) => console.error('Socket connection error:', err));
  }

  private registerEvents() {
    // ✅ Must match Clients.All.SendAsync("ReceiveNotification", ...)
    this.hubConnection.on('ReceiveNotification', (message: string) => {
      this.notification.set(message);
    });

    // ✅ Must match Clients.All.SendAsync("UpdatePatient", ...)
    this.hubConnection.on('UpdatePatient', (userId: number) => {
      this.updatedPatient.set(userId);
    });

    // ✅ Must match Clients.All.SendAsync("DeletePatient", ...)
    this.hubConnection.on('DeletePatient', (userID: number) => {
      this.deletedPatient.set(userID);
    })
  }

  // Client -> Server Calls

  // ✅ Calls hub method SendNotification (C#) → "sendNotification" in JS
  public sendNotification(message: string) {
    return this.hubConnection.invoke('SendNotification', message);
    // or 'sendNotification' (camelCase) – both usually work
  }

  // You actually don't need this for now since backend already fires UpdatePatient via IHubContext,
  // but it's okay to keep for future if you want to trigger from client.
  public notifyPatientUpdate(userId: number) {
    return this.hubConnection.invoke('UpdatePatient', userId);
  }

  public notifyPatientDelete(userId: number) {
    return this.hubConnection.invoke('DeletePatient', userId);
  }

  public clearUpdatedPatient() {
    this.updatedPatient.set(null);
  }

  public clearDeletedPatient() {
    this.deletedPatient.set(null);
  }

  public clearNotification() {
    this.notification.set(null);
  }
}
