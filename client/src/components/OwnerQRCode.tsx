import React from 'react';
import QRCode from 'react-qr-code';
import { useNavigate } from 'react-router';

const OwnerQRCode: React.FC = () => {
    const navigate = useNavigate();
    const qrValue = 'https://google.com'; 
    const navigateToOwnerSettings = () => {
      
        navigate('/owner-settings');
    };

    return (
        
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
          
          
          <button onClick={navigateToOwnerSettings}>Back</button>
          
            <h1>Owner QR Code</h1>
            
            <QRCode value={qrValue} size={256} />
        </div>
    );
};

export default OwnerQRCode;