import Peer, { DataConnection } from 'peerjs';

// Create peer (auto-generates ID, uses PeerJS cloud server)
const peer = new Peer();

peer.on('open', (id) => {
  console.log('My peer ID:', id); // Share this with other player
});

// Receive connections
peer.on('connection', (conn) => {
  conn.on('data', (data) => console.log('Received:', data));
  conn.on('open', () => conn.send({ type: 'hello' }));
});

// Connect to another peer
function connectTo(peerId: string) {
  const conn = peer.connect(peerId);
  conn.on('open', () => conn.send({ msg: 'Hi!' }));
  conn.on('data', (data) => console.log('Received:', data));
}

console.log('Game started!');