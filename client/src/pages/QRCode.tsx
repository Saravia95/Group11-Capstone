import React, { useEffect, useState } from 'react';
import QRCode from 'react-qr-code';
import { useAuthStore } from '../stores/authStore';

const ManageQRCode: React.FC = () => {
  const { user } = useAuthStore();
  const [url, setUrl] = useState<string>('');

  useEffect(() => {
    setUrl(`http://localhost:5173/verify-qr/${user?.id}`);
    console.log(`http://localhost:5173/verify-qr/${user?.id}`);
  }, [user]);

  const handleDownload = () => {
    const svgElement = document.getElementById('qr-code') as HTMLCanvasElement;

    if (!svgElement) return;

    const svgString = new XMLSerializer().serializeToString(svgElement);

    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;

      ctx?.drawImage(img, 0, 0);

      const a = document.createElement('a');
      a.href = canvas.toDataURL('image/png');
      a.download = 'downloaded-image.png';
      a.click();

      URL.revokeObjectURL(url);
    };

    img.src = url;
  };

  return (
    <div className="container-sm">
      <h2 className="title">Access QR Code</h2>
      <div className="bg-white shadow mt-10 flex flex-col gap-10 items-center p-5 rounded-2xl">
        <p className="text-center text-sm text-black">
          Share this QR code with your customers to allow them to access the app
        </p>
        <QRCode id="qr-code" value={url} size={256} />
        <div className="flex justify-center gap-5">
          <button className="button">Print</button>
          <button className="button" onClick={handleDownload}>
            Download
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManageQRCode;
