import React from 'react';
import QRCode from 'react-qr-code';

const OwnerQRCode: React.FC = () => {
    const qrValue = 'https://google.com'; 

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
            <h1>Owner QR Code</h1>
            <QRCode value={qrValue} size={256} />
        </div>
    );
};

export default OwnerQRCode;