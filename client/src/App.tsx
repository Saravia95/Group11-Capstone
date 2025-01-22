import { useState } from 'react'
import './App.css'
import socket from './socket';  // Import the centralized socket
import { useEffect } from 'react';
import OwnerLogin from './components/OwnerLogin';
import { Routes, Route } from 'react-router';
import ListenerLogin from './components/ListenerLogin';
import OwnerMain from './components/OwnerMain';
import OwnerSongLibrary from './components/OwnerSongLibrary';
import NowPlaying from './components/NowPlaying';

function App() {

  const [serverMessage, setServerMessage] = useState<string>('');
  const [socketMessage, setSocketMessage] = useState<string>('');


  // Listen for a message from the server (as an example)
  useEffect(() => {
    socket.on('serverMessage', (message: string) => {
      setServerMessage(message);
      socket.emit('clientMessage', 'Hello from the client!');
    });
    socket.on('socketMessage', (message: string) => {
      setSocketMessage(message);
    
    });

    // Clean up the socket connection when component unmounts
    return () => {
      socket.off('serverMessage');
    };
  }, []);

  
  return (
    <>
     
      <div className="card">
      <h1>Jukebox</h1>
      <p>{serverMessage}</p>
      <p>{socketMessage}</p>
      
      <NowPlaying/>

      <Routes>
        <Route path="/owner-login" element={<OwnerLogin />} />
        <Route path="/listener-login" element={<ListenerLogin />} />
        <Route path="/owner-main" element={<OwnerMain />} />
        <Route path="/owner-song-library" element={<OwnerSongLibrary />} />

        {/* Redirect to /login as a default */}
        <Route path="*" element={<ListenerLogin />} />
      </Routes>
 </div>
      
       
    </>
  )
}

export default App

