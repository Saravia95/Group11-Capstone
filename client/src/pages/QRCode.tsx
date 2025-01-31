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

    // Convert the SVG element into a string
    const svgString = new XMLSerializer().serializeToString(svgElement);
    // Create a Blob object from the SVG string
    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    // Generate a URL for the Blob
    const url = URL.createObjectURL(blob);

    // Create a canvas element for rendering the SVG as an image
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    // Create an Image object to load the SVG Blob URL
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      // Draw the image on the canvas
      ctx?.drawImage(img, 0, 0);
      // Create a download link element
      const a = document.createElement('a');
      // Set the href to the canvas data URL (as PNG)
      a.href = canvas.toDataURL('image/png');
      // Set the filename for the downloaded image
      a.download = `${user?.email}-qr-code.png`;
      // Programmatically trigger the download
      a.click();

      // Revoke the Blob URL to free up memory
      URL.revokeObjectURL(url);
    };
    // Set the image source to the Blob URL
    img.src = url;
  };

  const handlePrint = () => {
    const svgElement = document.getElementById('qr-code') as HTMLCanvasElement;
    if (!svgElement) return;

    // Convert the SVG element into a string
    const svgString = new XMLSerializer().serializeToString(svgElement);
    // Open a new browser window or tab
    const printWindow = window.open('', '_blank');

    if (printWindow) {
      // Open the document for writing
      printWindow.document.open();
      // Write the SVG string into the new document with proper HTML structure
      printWindow.document.write(htmlFormatter(svgString));
      // Close the document to render its contents
      printWindow.document.close();

      // Once the document has loaded, trigger the print dialog
      printWindow.onload = () => {
        printWindow.print();
        // Close the print window after printing
        printWindow.close();
      };
    }
  };

  const htmlFormatter = (svgString: string) => `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Print QR Code</title>
            <style>
              body {
                font-family: 'Arial', sans-serif;
                margin: 0;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                height: 100vh;
              }
              .box {
                border: 3px solid #000;
                padding: 10px 40px 40px 40px;
                border-radius: 10px;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
              }
            </style>
          </head>
          <body>
            <h1>&#9835; JukeVibes</h1>
            <div class="box">
              <p>Scan this QR code to access the app</p>
              <div>${svgString}</div>
            <div>
          </body>
        </html>
      `;

  return (
    <div className="container-sm">
      <h2 className="title">Access QR Code</h2>
      <div className="bg-white shadow mt-10 flex flex-col gap-10 items-center p-5 rounded-2xl">
        <p className="text-center text-sm text-black">
          Share this QR code with your customers to allow them to access the app
        </p>
        <QRCode id="qr-code" value={url} size={256} />
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
