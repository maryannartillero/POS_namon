import React, { useRef } from 'react';
import { Barcode, Download, Printer } from 'lucide-react';

interface BarcodeGeneratorProps {
  value: string;
  format?: 'CODE128' | 'CODE39' | 'EAN13' | 'UPC';
  width?: number;
  height?: number;
  displayValue?: boolean;
  fontSize?: number;
  className?: string;
}

const BarcodeGenerator: React.FC<BarcodeGeneratorProps> = ({
  value,
  format = 'CODE128',
  width = 2,
  height = 100,
  displayValue = true,
  fontSize = 20,
  className = ''
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Simple barcode generation (for demonstration)
  // In a real application, you'd use a proper barcode library like JsBarcode
  const generateBarcode = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = value.length * 10 + 40;
    canvas.height = height + (displayValue ? 30 : 10);

    // Clear canvas
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw barcode bars (simplified)
    ctx.fillStyle = 'black';
    let x = 20;
    
    for (let i = 0; i < value.length; i++) {
      const charCode = value.charCodeAt(i);
      const barWidth = (charCode % 3) + 1;
      
      // Draw bar
      ctx.fillRect(x, 10, barWidth * width, height - 20);
      x += barWidth * width + 2;
      
      // Draw space
      x += 2;
    }

    // Draw text if enabled
    if (displayValue) {
      ctx.fillStyle = 'black';
      ctx.font = `${fontSize}px monospace`;
      ctx.textAlign = 'center';
      ctx.fillText(value, canvas.width / 2, canvas.height - 5);
    }
  };

  React.useEffect(() => {
    if (value) {
      generateBarcode();
    }
  }, [value, format, width, height, displayValue, fontSize]);

  const downloadBarcode = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `barcode-${value}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  const printBarcode = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const img = canvas.toDataURL();
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Barcode - ${value}</title>
          <style>
            body { 
              margin: 0; 
              padding: 20px; 
              display: flex; 
              justify-content: center; 
              align-items: center; 
              min-height: 100vh;
              font-family: Arial, sans-serif;
            }
            .barcode-container {
              text-align: center;
            }
            img {
              max-width: 100%;
              height: auto;
            }
            .info {
              margin-top: 20px;
              font-size: 14px;
              color: #666;
            }
          </style>
        </head>
        <body>
          <div class="barcode-container">
            <img src="${img}" alt="Barcode ${value}" />
            <div class="info">
              <p>Format: ${format}</p>
              <p>Value: ${value}</p>
              <p>Generated: ${new Date().toLocaleString()}</p>
            </div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  if (!value) {
    return (
      <div className={`barcode-placeholder ${className}`}>
        <div className="text-center p-4 border-2 border-dashed border-gray-300 rounded-lg">
          <Barcode size={48} className="mx-auto mb-2 text-gray-400" />
          <p className="text-gray-500">Enter a value to generate barcode</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`barcode-generator ${className}`}>
      <div className="barcode-container bg-white p-4 border rounded-lg">
        <canvas
          ref={canvasRef}
          className="mx-auto block border"
          style={{ maxWidth: '100%' }}
        />
        
        <div className="barcode-actions mt-4 flex justify-center gap-2">
          <button
            onClick={downloadBarcode}
            className="btn btn-sm btn-secondary"
            title="Download Barcode"
          >
            <Download size={16} />
          </button>
          <button
            onClick={printBarcode}
            className="btn btn-sm btn-primary"
            title="Print Barcode"
          >
            <Printer size={16} />
          </button>
        </div>
        
        <div className="barcode-info mt-2 text-center text-sm text-gray-600">
          <p>Format: {format}</p>
          <p>Value: {value}</p>
        </div>
      </div>
    </div>
  );
};

export default BarcodeGenerator;