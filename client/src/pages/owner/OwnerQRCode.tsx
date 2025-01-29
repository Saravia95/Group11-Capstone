import React, { useEffect, useState } from 'react';
import QRCode from 'react-qr-code';
import { useAuthStore } from '../../stores/authStore';

const OwnerQRCode: React.FC = () => {
  const { user } = useAuthStore();
  const [url, setUrl] = useState<string>('');

  useEffect(() => {
    setUrl(`http://localhost:5173/verify-qr/${user?.id}`);
    console.log(`http://localhost:5173/verify-qr/${user?.id}`);
  }, [user]);

  return (
    <div className="container-sm">
      <h2 className="title">Access QR Code</h2>
      <div className="bg-white shadow mt-10 flex flex-col gap-10 items-center p-5 rounded-2xl">
        <p className="text-center text-sm text-black">
          Share this QR code with your customers to allow them to access the app
        </p>
        <QRCode value={url} size={256} />
        <div className="flex justify-center gap-5">
          <button className="button">Print</button>
          <button className="button">Download</button>
        </div>
      </div>
    </div>
  );
};

export default OwnerQRCode;
