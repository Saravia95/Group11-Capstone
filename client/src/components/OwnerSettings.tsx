import React, { useState } from 'react';
import { useNavigate } from 'react-router';

const OwnerSettings: React.FC = () => {
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [subscription, setSubscription] = useState('');
    const [preferences, setPreferences] = useState('');
    const [qrCode, setQrCode] = useState('');

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPassword(e.target.value);
    };

    const handleSubscriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSubscription(e.target.value);
    };

    const handlePreferencesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPreferences(e.target.value);
    };

    const handleQrCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setQrCode(e.target.value);
    };

    const handleLogout = () => {
        // Implement logout functionality here
    };


    const navigateToOwnerSubscription = () => {
        // Implement logout functionality here
        navigate('/owner-subscription');
    };


    return (
        <div>
            <h1>Owner Settings</h1>
          
                <div>
                    <label>
                        Change Password:
                        <input type="password" value={password} onChange={handlePasswordChange} />
                    </label>
                </div>
                <div>
                <button onClick={navigateToOwnerSubscription} style={{ margin: '10px', padding: '10px 20px' }}>Manage Subscription</button>
                </div>
                <div>
                    <label>
                        Preferences:
                        <input type="text" value={preferences} onChange={handlePreferencesChange} />
                    </label>
                </div>
                <div>
                    <label>
                        QR Code:
                        <input type="text" value={qrCode} onChange={handleQrCodeChange} />
                    </label>
                </div>
                <button type="submit">Save Changes</button>
           
            <button onClick={handleLogout}>Logout</button>
        </div>
    );
};

export default OwnerSettings;