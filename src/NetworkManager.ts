import Peer, { DataConnection } from 'peerjs';
import { GameMessage, ConnectionState } from './Types';

type EventCallback = (data: unknown) => void;

export class NetworkManager {
  private peer: Peer;
  private connection: DataConnection | null = null;
  private listeners: Map<string, EventCallback[]> = new Map();
  
  public isHost = false;
  public state: ConnectionState = 'disconnected';
  public peerId = '';
  public playerName = 'Anonymous';

  constructor() {
    this.peer = new Peer();
    
    this.peer.on('open', (id) => {
      this.peerId = id;
      console.log('[Network] Peer ready:', id);
      this.emit('ready', id);
    });

    this.peer.on('connection', (conn) => {
      this.handleConnection(conn);
    });

    this.peer.on('error', (err) => {
      console.error('[Network] Peer error:', err);
      this.emit('error', err);
    });
  }

  // Host a game - just wait for connections
  host(playerName: string): string {
    this.isHost = true;
    this.playerName = playerName;
    this.state = 'connecting';
    console.log('[Network] Hosting game, waiting for connections...');
    return this.peerId;
  }

  // Join an existing game
  join(roomCode: string, playerName: string): void {
    this.isHost = false;
    this.playerName = playerName;
    this.state = 'connecting';
    console.log('[Network] Joining room:', roomCode);
    
    const conn = this.peer.connect(roomCode, { reliable: true });
    this.handleConnection(conn);
  }

  // Handle new connection (both host and guest)
  private handleConnection(conn: DataConnection): void {
    this.connection = conn;

    conn.on('open', () => {
      this.state = 'connected';
      console.log('[Network] Connection established!');
      this.emit('connected', { isHost: this.isHost });
    });

    conn.on('data', (data) => {
      const message = data as GameMessage;
      console.log('[Network] Received:', message);
      this.emit('message', message);
      // Also emit specific message type
      this.emit(message.type, message.payload);
    });

    conn.on('close', () => {
      this.state = 'disconnected';
      this.connection = null;
      console.log('[Network] Connection closed');
      this.emit('disconnected', null);
    });

    conn.on('error', (err) => {
      console.error('[Network] Connection error:', err);
      this.emit('error', err);
    });
  }

  // Send a message to the peer
  send(message: GameMessage): void {
    if (!this.connection || this.state !== 'connected') {
      console.warn('[Network] Cannot send - not connected');
      return;
    }
    console.log('[Network] Sending:', message);
    this.connection.send(message);
  }

  // Simple event emitter
  on(event: string, callback: EventCallback): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  off(event: string, callback: EventCallback): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) callbacks.splice(index, 1);
    }
  }

  private emit(event: string, data: unknown): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(cb => cb(data));
    }
  }

  // Check if we're connected
  get connected(): boolean {
    return this.state === 'connected';
  }
}