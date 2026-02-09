import { Game } from './Game';
import { NetworkManager } from './NetworkManager';

function main() {
  console.log('[Main] Initializing...');
  
  // Create core systems
  const network = new NetworkManager();
  const game = new Game(network);

  // DOM elements
  const menu = document.getElementById('menu')!;
  const gameDiv = document.getElementById('game')!;
  const infoPanel = document.getElementById('infoPanel')!;
  const playerNameInput = document.getElementById('playerName') as HTMLInputElement;
  const roomCodeInput = document.getElementById('roomCode') as HTMLInputElement;
  const roomCodeDisplay = document.getElementById('roomCodeDisplay')!;
  const hostBtn = document.getElementById('hostBtn')!;
  const joinBtn = document.getElementById('joinBtn')!;
  const copyBtn = document.getElementById('copyBtn')!;
  const canvasWrapper = document.getElementById('canvasWrapper')!;

  // Chat elements
  const chatPanel = document.getElementById('chatPanel')!;
  const chatLog = document.getElementById('chatLog')!;
  const chatInput = document.getElementById('chatInput') as HTMLInputElement;
  const sendBtn = document.getElementById('sendBtn')!;
  const pingBtn = document.getElementById('pingBtn')!;

  // Debug: verify elements exist
  console.log('[Main] Elements found:', {
    menu: !!menu,
    gameDiv: !!gameDiv,
    hostBtn: !!hostBtn,
    joinBtn: !!joinBtn,
    chatPanel: !!chatPanel
  });

  // Show game screen
  function showGameScreen() {
    console.log('[Main] Showing game screen...');
    menu.classList.add('hidden');
    gameDiv.classList.remove('hidden');
    chatPanel.classList.remove('hidden');
  }

  // Add message to chat log
  function addChatMessage(sender: string, text: string, isSystem = false) {
    const div = document.createElement('div');
    div.className = isSystem ? 'chat-system' : 'chat-message';
    div.innerHTML = isSystem ? text : `<strong>${sender}:</strong> ${text}`;
    chatLog.appendChild(div);
    chatLog.scrollTop = chatLog.scrollHeight;
  }

  // Network event listeners
  network.on('ready', (id) => {
    console.log('[Main] Network ready with ID:', id);
  });

  network.on('connected', () => {
    addChatMessage('', '🟢 Connected to peer!', true);
  });

  network.on('disconnected', () => {
    addChatMessage('', '🔴 Peer disconnected', true);
  });

  network.on('chat', (payload) => {
    const { sender, text } = payload as { sender: string; text: string };
    addChatMessage(sender, text);
  });

  network.on('pong', (payload) => {
    const { originalTimestamp } = payload as { originalTimestamp: number };
    const latency = Date.now() - originalTimestamp;
    addChatMessage('', `📡 Latency: ${latency}ms`, true);
  });

  // UI Event Listeners
  hostBtn.addEventListener('click', async () => {
    console.log('[Main] Host button clicked');
    const name = playerNameInput.value.trim() || 'Host';
    
    try {
      await game.init(canvasWrapper);
      console.log('[Main] Game initialized');
    } catch (err) {
      console.error('[Main] Game init failed:', err);
    }
    
    network.host(name);
    
    // Show UI immediately
    showGameScreen();
    infoPanel.classList.remove('hidden');
    roomCodeDisplay.textContent = network.peerId || 'Loading...';
    addChatMessage('', `Hosting as "${name}". Share the room code!`, true);
    
    // Update room code when peer is ready (if not already)
    if (!network.peerId) {
      network.on('ready', (id) => {
        roomCodeDisplay.textContent = id as string;
      });
    }
  });

  joinBtn.addEventListener('click', async () => {
    console.log('[Main] Join button clicked');
    const name = playerNameInput.value.trim() || 'Guest';
    const roomCode = roomCodeInput.value.trim();
    
    if (!roomCode) {
      alert('Enter a room code!');
      return;
    }
    
    try {
      await game.init(canvasWrapper);
      console.log('[Main] Game initialized');
    } catch (err) {
      console.error('[Main] Game init failed:', err);
    }
    
    network.join(roomCode, name);
    showGameScreen();
    addChatMessage('', `Joining as "${name}"...`, true);
  });

  copyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(network.peerId);
    copyBtn.textContent = 'Copied!';
    setTimeout(() => copyBtn.textContent = 'Copy', 2000);
  });

  // Chat functionality
  function sendChatMessage() {
    const text = chatInput.value.trim();
    if (!text) return;
    
    if (!network.connected) {
      addChatMessage('', '⚠️ Not connected yet', true);
      return;
    }
    
    game.sendChat(text);
    addChatMessage(network.playerName, text);
    chatInput.value = '';
  }

  sendBtn.addEventListener('click', sendChatMessage);
  chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendChatMessage();
  });

  pingBtn.addEventListener('click', () => {
    if (!network.connected) {
      addChatMessage('', '⚠️ Not connected yet', true);
      return;
    }
    game.sendPing();
    addChatMessage('', '📡 Ping sent...', true);
  });

  console.log('[Main] Trash Can Games ready!');
}

// Handle both cases: DOM already loaded OR not yet loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', main);
} else {
  main();
}