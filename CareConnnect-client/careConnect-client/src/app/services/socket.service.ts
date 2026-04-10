import { Injectable, inject, signal } from '@angular/core';
import { AuthService } from './auth.service';
import * as signalR from '@microsoft/signalr';

@Injectable({
  providedIn: 'root',
})
export class SocketService {
  private hubConnection!: signalR.HubConnection;

  public notification = signal<string | null>(null);
  public updatedPatient = signal<number | null>(null);
  public deletedPatient = signal<number | null>(null);
  public updatedPhysician = signal<number | null>(null);
  public deletedPhysician = signal<number | null>(null);
  public createdPersonnel = signal<boolean>(false);
  public updatedPersonnel = signal<number | null>(null);
  public deletedPersonnel = signal<number | null>(null);

  private auth = inject(AuthService);

  constructor() {
    this.startConnection();
    this.registerEvents();
  }

  private startConnection() {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl('https://localhost:7079/careconnectHub', {
        withCredentials: false,
        accessTokenFactory: () => this.auth.getToken() ?? ''  // Pass JWT token
      } as signalR.IHttpConnectionOptions)
      .withAutomaticReconnect()
      .build();

    this.hubConnection
      .start()
      .then(() => console.log('Socket connected'))
      .catch((err) => console.error('Socket connection error:', err));
  }

  private registerEvents() {
    this.hubConnection.on('ReceiveNotification', (message: string) => {
      this.notification.set(message);
    });

    this.hubConnection.on('UpdatePatient', (userId: number) => {
      this.updatedPatient.set(userId);
    });

    this.hubConnection.on('DeletePatient', (userID: number) => {
      this.deletedPatient.set(userID);
    });

    this.hubConnection.on('UpdatePhysician', (userId: number) => {
      this.updatedPhysician.set(userId);
    });

    this.hubConnection.on('DeletePhysician', (userID: number) => {
      this.deletedPhysician.set(userID);
    });

    this.hubConnection.on('CreatePersonnel', () => {
      this.createdPersonnel.set(true);
    });

    this.hubConnection.on('UpdatePersonnel', (userId: number) => {
      this.updatedPersonnel.set(userId);
    });

    this.hubConnection.on('DeletePersonnel', (userID: number) => {
      this.deletedPersonnel.set(userID);
    });
  }

  public sendNotification(message: string) {
    return this.hubConnection.invoke('SendNotification', message);
  }

  public clearUpdatedPatient() {
    this.updatedPatient.set(null);
  }

  public clearDeletedPatient() {
    this.deletedPatient.set(null);
  }

  public clearUpdatedPhysician() {
    this.updatedPhysician.set(null);
  }

  public clearDeletedPhysician() {
    this.deletedPhysician.set(null);
  }

  public clearCreatedPersonnel() {
    this.createdPersonnel.set(false);
  }

  public clearUpdatedPersonnel() {
    this.updatedPersonnel.set(null);
  }

  public clearDeletedPersonnel() {
    this.deletedPersonnel.set(null);
  }

  public clearNotification() {
    this.notification.set(null);
  }
}
