import { useState } from 'react'
import './App.css'
import { useEffect } from 'react';
import OwnerLogin from './components/OwnerLogin';
import { Routes, Route } from 'react-router';
import ListenerMain from './components/ListenerMain';
import OwnerMain from './components/OwnerMain';
import OwnerSongLibrary from './components/OwnerSongLibrary';
import ListenerSearch from './components/ListenerSearch';
import OwnerRegister from './components/OwnerRegister';
import OwnerSettings from './components/OwnerSettings';
import OwnerQRCode from './components/OwnerQRCode';
import OwnerSubscription from './components/OwnerSubscription';
import OwnerPreferences from './components/OwnerPreferences';
import OwnerChangePassword from './components/OwnerChangePassword';

function App() {

  const [serverMessage, setServerMessage] = useState<string>('');



  // Listen for a message from the server (as an example)
  useEffect(() => {
    
    setServerMessage('Connecting to server...');
   
  }, []);

  
  return (
    <>
     
      <div className="card">
      <h1>Jukebox</h1>
      <p>{serverMessage}</p>
    
      <Routes>
        <Route path="/owner-register" element={<OwnerRegister />} />
        <Route path="/owner-login" element={<OwnerLogin />} />
        <Route path="/owner-main" element={<OwnerMain />} />
        <Route path="/owner-settings" element={<OwnerSettings />} />
        <Route path="/owner-change-password" element={<OwnerChangePassword />} />
        <Route path="/owner-subscription" element={<OwnerSubscription />} />
        <Route path="/owner-preferences" element={<OwnerPreferences />} />
        <Route path="/owner-song-library" element={<OwnerSongLibrary />} />
        <Route path="/owner-qr-code" element={<OwnerQRCode/>} />
        <Route path="/listener-main" element={<ListenerMain />} />
        <Route path="/listener-search" element={<ListenerSearch />} />


        {/* Redirect to /login as a default */}
        <Route path="*" element={<OwnerLogin/>} />
      </Routes>
 </div>
      
       
    </>
  )
}

export default App

