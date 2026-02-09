import Peer, { DataConnection } from 'peerjs';

// Create peer
const peer = new Peer();
let conn: DataConnection | null = null;

// DOM elements
const menu = document.getElementById('menu')!;
const game = document.getElementById('game')!;
const infoPanel = document.getElementById('infoPanel')!;
const playerNameInput = document.getElementById('playerName') as HTMLInputElement;
const roomCodeInput = document.getElementById('roomCode') as HTMLInputElement;
const roomCodeDisplay = document.getElementById('roomCodeDisplay')!;
const hostBtn = document.getElementById('hostBtn')!;
const joinBtn = document.getElementById('joinBtn')!;
const copyBtn = document.getElementById('copyBtn')!;

// When peer is ready
peer.on('open', (id) => {
  console.log('My peer ID:', id);
});

// Handle incoming connections (for host)
peer.on('connection', (connection) => {
  conn = connection;
  console.log('Someone connected!');
  
  conn.on('open', () => {
    console.log('Connection open with guest');
    conn!.send({ type: 'welcome', msg: `Hello from host: ${playerNameInput.value || 'Anonymous'}` });
  });
  
  conn.on('data', (data) => {
    console.log('Received:', data);
  });
});

// HOST GAME
hostBtn.addEventListener('click', () => {
  const name = playerNameInput.value || 'Anonymous';
  console.log(`${name} is hosting...`);
  
  // Show game screen with room code
  menu.classList.add('hidden');
  game.classList.remove('hidden');
  infoPanel.classList.remove('hidden');
  roomCodeDisplay.textContent = peer.id;
  
  console.log('Waiting for player to join with code:', peer.id);
});

// JOIN GAME
joinBtn.addEventListener('click', () => {
  const name = playerNameInput.value || 'Anonymous';
  const roomCode = roomCodeInput.value.trim();
  
  if (!roomCode) {
    alert('Enter a room code!');
    return;
  }
  
  console.log(`${name} joining room: ${roomCode}`);
  
  conn = peer.connect(roomCode);
  
  conn.on('open', () => {
    console.log('Connected to host!');
    conn!.send({ type: 'joined', msg: `${name} has joined!` });
    
    // Show game screen
    menu.classList.add('hidden');
    game.classList.remove('hidden');
  });
  
  conn.on('data', (data) => {
    console.log('Received:', data);
  });
  
  conn.on('error', (err) => {
    console.error('Connection error:', err);
    alert('Failed to connect!');
  });
});

// Copy room code
copyBtn.addEventListener('click', () => {
  navigator.clipboard.writeText(peer.id);
  copyBtn.textContent = 'Copied!';
  setTimeout(() => copyBtn.textContent = 'Copy', 2000);
});

console.log('Game started!');