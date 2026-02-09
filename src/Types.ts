// Network message types
export interface NetworkMessage {
  type: string;
  payload?: unknown;
}

export interface ChatMessage extends NetworkMessage {
  type: 'chat';
  payload: {
    sender: string;
    text: string;
  };
}

export interface PingMessage extends NetworkMessage {
  type: 'ping';
  payload: {
    timestamp: number;
  };
}

export interface PongMessage extends NetworkMessage {
  type: 'pong';
  payload: {
    originalTimestamp: number;
  };
}

export type GameMessage = ChatMessage | PingMessage | PongMessage;

// Connection events
export type ConnectionState = 'disconnected' | 'connecting' | 'connected';