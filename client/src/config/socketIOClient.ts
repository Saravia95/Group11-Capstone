import { io, Socket } from 'socket.io-client';

interface SocketClient {
  disconnect: () => void;
  emit: (event: string, ...data: any[]) => void; // Rest parameters for variable args
  on: (event: string, callback: (...args: any[]) => void) => void;
  isConnected: () => boolean;
}

const createSocketClient = (url: string): SocketClient => {
  const socket: Socket = io(url, {
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 5,
  });
  socket.on('connect', () => {
    console.log('Connected to Socket.IO server:', socket?.id);
  });

  socket.on('disconnect', (reason) => {
    console.log('Disconnected from Socket.IO server:', reason);
  });

  socket.on('connect_error', (error) => {
    console.error('Socket.IO connection error:', error);
  });

  const disconnect = () => {
    if (socket) {
      socket.disconnect();
      //socket = null;
      console.log('Socket.IO client disconnected');
    }
  };

  const emit = (event: string, ...data: any[]) => {
    if (socket && socket.connected) {
      socket.emit(event, ...data); // Spread the rest args to socket.emit
    } else {
      console.warn(`Cannot emit '${event}': Socket is not connected`);
    }
  };

  const on = (event: string, callback: (...args: any[]) => void) => {
    if (socket) {
      socket.on(event, callback);
    } else {
      console.warn(`Cannot listen to '${event}': Socket is not initialized`);
    }
  };

  const isConnected = (): boolean => {
    return socket !== null && socket.connected;
  };

  return {
    disconnect,
    emit,
    on,
    isConnected,
  };
};

// Export a singleton instance (adjust URL as needed)
const socketClient = createSocketClient(import.meta.env.VITE_SOCKET_URL); // Replace with your server URL
export default socketClient;
