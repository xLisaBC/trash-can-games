import { Application } from 'pixi.js';
import { NetworkManager } from './NetworkManager';
import { GameMessage } from './Types';

export class Game {
  public app: Application;
  public network: NetworkManager;

  constructor(network: NetworkManager) {
    this.network = network;
    this.app = new Application();
    
    this.setupNetworkListeners();
  }

  async init(canvasContainer: HTMLElement): Promise<void> {
    await this.app.init({
      width: 800,
      height: 600,
      backgroundColor: 0x1a1a2e,
      antialias: true,
    });
    
    // PixiJS v8 creates its own canvas, append it to container
    canvasContainer.appendChild(this.app.canvas);
    this.app.canvas.style.borderRadius = '12px';

    console.log('[Game] PixiJS initialized');
    
    // Start game loop
    this.app.ticker.add(this.update.bind(this));
  }

  private setupNetworkListeners(): void {
    // Handle incoming chat messages
    this.network.on('chat', (payload) => {
      const { sender, text } = payload as { sender: string; text: string };
      console.log(`[Chat] ${sender}: ${text}`);
    });

    // Handle ping
    this.network.on('ping', (payload) => {
      const { timestamp } = payload as { timestamp: number };
      // Respond with pong
      this.network.send({
        type: 'pong',
        payload: { originalTimestamp: timestamp }
      });
    });

    // Handle pong
    this.network.on('pong', (payload) => {
      const { originalTimestamp } = payload as { originalTimestamp: number };
      const latency = Date.now() - originalTimestamp;
      console.log(`[Network] Latency: ${latency}ms`);
    });

    this.network.on('connected', () => {
      console.log('[Game] Peer connected!');
    });

    this.network.on('disconnected', () => {
      console.log('[Game] Peer disconnected!');
    });
  }

  // Send a chat message
  sendChat(text: string): void {
    this.network.send({
      type: 'chat',
      payload: {
        sender: this.network.playerName,
        text
      }
    });
  }

  // Send a ping to measure latency
  sendPing(): void {
    this.network.send({
      type: 'ping',
      payload: { timestamp: Date.now() }
    });
  }

  // Send any arbitrary message
  sendMessage(message: GameMessage): void {
    this.network.send(message);
  }

  private update(): void {
    // Game loop - empty for now
    // This runs every frame (~60fps)
  }
}