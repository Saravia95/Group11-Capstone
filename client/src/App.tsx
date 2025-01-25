import { useState } from 'react';
import './App.css';
import { useEffect } from 'react';
import OwnerLogin from './pages/owner/OwnerLogin';
import { Routes, Route } from 'react-router';
import ListenerMain from './pages/customer/ListenerMain';
import OwnerMain from './pages/owner/OwnerMain';
import OwnerSongLibrary from './pages/owner/OwnerSongLibrary';
import ListenerSearch from './pages/customer/ListenerSearch';
import OwnerRegister from './pages/owner/OwnerRegister';
import OwnerSettings from './pages/owner/OwnerSettings';
import OwnerQRCode from './pages/owner/OwnerQRCode';
import OwnerSubscription from './pages/owner/OwnerSubscription';
import OwnerPreferences from './pages/owner/OwnerPreferences';
import OwnerChangePassword from './pages/owner/OwnerChangePassword';
import OwnerRegisterConfirmation from './pages/owner/OwnerRegisterConfirmation';

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
          <Route path="/owner-register-confirmation" element={<OwnerRegisterConfirmation />} />
          <Route path="/owner-login" element={<OwnerLogin />} />
          <Route path="/owner-main" element={<OwnerMain />} />
          <Route path="/owner-settings" element={<OwnerSettings />} />
          <Route path="/owner-change-password" element={<OwnerChangePassword />} />
          <Route path="/owner-subscription" element={<OwnerSubscription />} />
          <Route path="/owner-preferences" element={<OwnerPreferences />} />
          <Route path="/owner-song-library" element={<OwnerSongLibrary />} />
          <Route path="/owner-qr-code" element={<OwnerQRCode />} />
          <Route path="/listener-main" element={<ListenerMain />} />
          <Route path="/listener-search" element={<ListenerSearch />} />

          {/* Redirect to /login as a default */}
          <Route path="*" element={<OwnerLogin />} />
        </Routes>
      </div>
    </>
  );
}

export default App;
