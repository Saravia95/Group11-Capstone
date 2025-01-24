import React, {  } from 'react';
import { useNavigate } from 'react-router';

const OwnerSettings: React.FC = () => {
    const navigate = useNavigate();
    // const [password, setPassword] = useState('');
    // //const [subscription, setSubscription] = useState('');
    // const [preferences, setPreferences] = useState('');
   // const [qrCode, setQRCode] = useState('');

    // const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    //     setPassword(e.target.value);
    // };


    // const handlePreferencesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    //     setPreferences(e.target.value);
    // };

    const navigateToOwnerPasswordChange = () => {
       navigate('/owner-change-password');
    };
   
    const navigateToOwnerSubscription = () => {
        // Implement logout functionality here
        navigate('/owner-subscription');
    };
   
    const navigateToOwnerPreferences = () => {
        // Implement logout functionality here
        navigate('/owner-preferences');
    };

    const navigateToOwnerQRCode = () => {
        navigate('/owner-qr-code');
    };

    const navigateToOwnerMain = () => {
        navigate('/owner-main');
    };
    
    const handleLogout = () => {
        // Implement logout functionality here
        navigate('/owner-login');

    };



    return (
        <div>
            <h1>Owner Settings</h1>
            <button onClick={navigateToOwnerMain} style={{ margin: '10px', padding: '10px 20px' }}>Back</button>
            <button onClick={navigateToOwnerPasswordChange} style={{ margin: '10px', padding: '10px 20px' }}>Change Password</button>
            <button onClick={navigateToOwnerSubscription} style={{ margin: '10px', padding: '10px 20px' }}>Manage Subscription</button>
            <button onClick={navigateToOwnerPreferences} style={{ margin: '10px', padding: '10px 20px' }}>Preferences</button>
            <button onClick={navigateToOwnerQRCode} style={{ margin: '10px', padding: '10px 20px' }}>QR Code</button>
            <button onClick={handleLogout}>Logout</button>
        </div>
    );
};

export default OwnerSettings;