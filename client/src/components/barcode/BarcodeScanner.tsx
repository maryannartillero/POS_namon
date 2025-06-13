import React, { useRef, useState, useEffect } from 'react';
import { Camera, CameraOff, Scan } from 'lucide-react';

interface BarcodeScannerProps {
  onScan: (result: string) => void;
  onError?: (error: string) => void;
  className?: string;
}

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({
  onScan,
  onError,
  className = ''
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [manualInput, setManualInput] = useState('');

  const startScanning = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' } // Use back camera if available
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
        setIsScanning(true);
      }
    } catch (error) {
      const errorMessage = 'Camera access denied or not available';
      onError?.(errorMessage);
      console.error('Error accessing camera:', error);
    }
  };

  const stopScanning = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsScanning(false);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualInput.trim()) {
      onScan(manualInput.trim());
      setManualInput('');
    }
  };

  useEffect(() => {
    return () => {
      stopScanning();
    };
  }, []);

  return (
    <div className={`barcode-scanner ${className}`}>
      <div className="scanner-container">
        {isScanning ? (
          <div className="camera-view">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-64 bg-black rounded-lg"
            />
            <canvas ref={canvasRef} className="hidden" />
            <div className="scanner-overlay">
              <div className="scan-line"></div>
              <p className="text-white text-center mt-2">
                Position barcode within the frame
              </p>
            </div>
            <button
              onClick={stopScanning}
              className="btn btn-danger mt-2"
            >
              <CameraOff size={16} />
              Stop Scanning
            </button>
          </div>
        ) : (
          <div className="scanner-placeholder">
            <div className="text-center p-8 border-2 border-dashed border-gray-300 rounded-lg">
              <Scan size={48} className="mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600 mb-4">Scan barcode with camera</p>
              <button
                onClick={startScanning}
                className="btn btn-primary"
              >
                <Camera size={16} />
                Start Camera
              </button>
            </div>
          </div>
        )}

        {/* Manual Input Alternative */}
        <div className="manual-input mt-4">
          <form onSubmit={handleManualSubmit} className="flex gap-2">
            <input
              type="text"
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              placeholder="Or enter barcode manually..."
              className="form-input flex-1"
            />
            <button
              type="submit"
              className="btn btn-secondary"
              disabled={!manualInput.trim()}
            >
              Submit
            </button>
          </form>
        </div>
      </div>

      <style>{`
        .scanner-overlay {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 200px;
          height: 100px;
          border: 2px solid #fff;
          border-radius: 8px;
          pointer-events: none;
        }

        .scan-line {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, #ff0000, transparent);
          animation: scan 2s linear infinite;
        }

        @keyframes scan {
          0% { transform: translateY(0); }
          100% { transform: translateY(96px); }
        }

        .camera-view {
          position: relative;
        }
      `}</style>
    </div>
  );
};

export default BarcodeScanner;