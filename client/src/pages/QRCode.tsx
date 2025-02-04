import React, { useEffect, useState } from 'react';
import QRCode from 'react-qr-code';
import { useAuthStore } from '../stores/authStore';
import Back from '../components/Back';
import { getQRCodeSvgString, downloadQRCodeAsPNG, printQRCode } from '../utils/qrCodeHelpers';
import { PRINT_TEMPLATE } from '../constants/printFormatter';

const ManageQRCode: React.FC = () => {
  const { user } = useAuthStore();
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');

  useEffect(() => {
    if (user?.id) {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5173';
      const newUrl = `${baseUrl}/verify-qr/${user.id}`;
      console.log('QR Code URL:', newUrl);
      setQrCodeUrl(newUrl);
    }
  }, [user]);

  const handleDownload = async () => {
    const svgString = getQRCodeSvgString('qr-code');
    if (svgString && user?.email) {
      const fileName = `${user.email.split('@')[0]}-qr-code`;
      await downloadQRCodeAsPNG(svgString, fileName);
    }
  };

  const handlePrint = () => {
    const svgString = getQRCodeSvgString('qr-code');
    if (svgString) {
      printQRCode(svgString, PRINT_TEMPLATE);
    }
  };

  return (
    <div className="container-sm">
      <Back to="/settings" />
      <h2 className="title">Access QR Code</h2>

      <div className="bg-white shadow mt-10 flex flex-col gap-10 items-center p-5 rounded-2xl">
        <p className="text-center text-sm text-black">
          Share this QR code with your customers to allow them to access the app
        </p>

        {qrCodeUrl && (
          <QRCode id="qr-code" value={qrCodeUrl} size={256} className="qr-code-element" />
        )}

        <div className="flex justify-center gap-5">
          <button className="button" onClick={handlePrint}>
            Print
          </button>
          <button className="button" onClick={handleDownload}>
            Download
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManageQRCode;
