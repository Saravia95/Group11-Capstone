import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import socket from './socket';  // Import the centralized socket
import { useEffect } from 'react';

function App() {
  const [count, setCount] = useState(0)
  const [serverMessage, setServerMessage] = useState<string>('');

  // Listen for a message from the server (as an example)
  useEffect(() => {
    socket.on('serverMessage', (message: string) => {
      setServerMessage(message);
      socket.emit('clientMessage', 'Hello from the client!');
    });

    // Clean up the socket connection when component unmounts
    return () => {
      socket.off('serverMessage');
    };
  }, []);

  
  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
      <h1>Welcome to the Jukebox App!</h1>
      <p>Server says: {serverMessage}</p>
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App

