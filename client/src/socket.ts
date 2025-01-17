import { io, Socket } from 'socket.io-client';

// Access the socket URL from environment variables
const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';  // Default to localhost

// Create a socket instance and connect
const socket: Socket = io(socketUrl);

// Optional: Add event listeners or socket-related functions here
socket.on('connect', () => {
  console.log(`Connected to the server with ID: ${socket.id}`);

});

export default socket;
