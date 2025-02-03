export const getQRCodeSvgString = (elementId: string): string | null => {
  const svgElement = document.getElementById(elementId) as SVGElement | null;
  return svgElement ? new XMLSerializer().serializeToString(svgElement) : null;
};

export const downloadQRCodeAsPNG = async (svgString: string, fileName: string) => {
  const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  try {
    const img = await loadImage(url);
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;

    const ctx = canvas.getContext('2d');
    ctx?.drawImage(img, 0, 0);

    const downloadLink = document.createElement('a');
    downloadLink.href = canvas.toDataURL('image/png');
    downloadLink.download = `${fileName}.png`;
    downloadLink.click();
  } finally {
    URL.revokeObjectURL(url);
  }
};

export const printQRCode = (svgString: string, template: string) => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  printWindow.document.open();
  printWindow.document.write(template.replace('{{SVG_CONTENT}}', svgString));
  printWindow.document.close();

  printWindow.onload = () => {
    printWindow.print();
    printWindow.close();
  };
};

const loadImage = (url: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
};
