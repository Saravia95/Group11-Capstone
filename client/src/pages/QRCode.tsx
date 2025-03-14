import React, { useEffect, useState } from 'react';
import QRCode from 'react-qr-code';
import { useAuthStore } from '../stores/authStore';
import Back from '../components/Back';
import { getQRCodeSvgString, downloadQRCodeAsPNG, printQRCode } from '../utils/qrCodeHelpers';
import { PRINT_TEMPLATE } from '../constants/printFormatter';
import { Helmet } from 'react-helmet-async';
import { BASE_URL } from '../constants/baseUrl';

const ManageQRCode: React.FC = () => {
  const { user } = useAuthStore();
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');

  useEffect(() => {
    if (user?.id) {
      const newUrl = `${BASE_URL}/verify-qr/${user.id}`;
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
      <Helmet title="QR Code | JukeVibes" />
      <Back to="/settings" />
      <h2 className="heading-2 mt-10 text-center">Access QR Code</h2>

      <div className="mt-10 flex flex-col items-center gap-10 rounded-2xl bg-white p-5 shadow">
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
