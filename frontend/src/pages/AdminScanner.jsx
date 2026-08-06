import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Html5Qrcode } from 'html5-qrcode';

const AdminScanner = () => {
  const [scanResult, setScanResult] = useState(null);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [isScanning, setIsScanning] = useState(true);
  
  const scannerRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isScanning) return;
    let html5QrCode;
    let isMounted = true;

    const initializeScanner = async () => {
      // MAGIC FIX: Give React's Strict Mode a tiny delay to release the hardware
      // before trying to grab it again. This prevents the blank screen!
      await new Promise(resolve => setTimeout(resolve, 150));
      
      if (!isMounted) return;

      const readerElement = document.getElementById('reader');
      if (readerElement) {
        readerElement.innerHTML = ''; 
      }

      html5QrCode = new Html5Qrcode("reader");
      scannerRef.current = html5QrCode;

      try {
        await html5QrCode.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          async (decodedText) => {
            if (html5QrCode.isScanning) {
              await html5QrCode.stop();
            }
            setScanResult(decodedText);
            
            try {
              const data = JSON.parse(decodedText);
              if (!data.eventId || !data.userId) throw new Error("Invalid format");
              await processCheckIn(data.eventId, data.userId);
            } catch (error) {
              setMessage('❌ Invalid QR Code format.');
              setIsError(true);
            }
          },
          (errorMessage) => {
             // Ignore background frame errors
          }
        );
      } catch (err) {
        console.warn("Camera start error:", err);
      }
    };

    initializeScanner();

    return () => {
      isMounted = false;
      if (html5QrCode) {
        if (html5QrCode.isScanning) {
          html5QrCode.stop().then(() => html5QrCode.clear()).catch(console.error);
        } else {
          html5QrCode.clear();
        }
      }
      killCameraTracks();
    };
  }, [isScanning]);

  const killCameraTracks = () => {
    const videoElements = document.querySelectorAll('video');
    videoElements.forEach((video) => {
      const stream = video.srcObject;
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    });
  };

  const processCheckIn = async (eventId, userId) => {
    setMessage('Processing check-in...');
    setIsError(false);
    const token = localStorage.getItem('token');

    try {
      // FIXED: URL updated to /checkin to match backend routes
      const response = await fetch(`http://localhost:5000/api/events/${eventId}/checkin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ userId })
      });
      const data = await response.json();
      if (response.ok) {
        setMessage('✅ ' + data.message);
        setIsError(false);
      } else {
        setMessage('❌ ' + data.message);
        setIsError(true);
      }
    } catch (error) {
      setMessage('❌ Cannot connect to server.');
      setIsError(true);
    }
  };

  const handleScanAgain = () => {
    setScanResult(null);
    setMessage('');
    setIsScanning(false);
    setTimeout(() => setIsScanning(true), 200); 
  };

  const handleSafeNavigation = async () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch (error) {
        console.error("Failed to clear scanner", error);
      }
    }
    killCameraTracks();
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 sm:p-10 transition-colors">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-8 border-b dark:border-gray-700 pb-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Ticket Scanner</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Volunteer Access Portal</p>
          </div>
          <button 
            onClick={handleSafeNavigation} 
            className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Exit Scanner
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 text-center">
          
          {message && (
            <div className={`p-4 mb-6 rounded-lg text-lg font-bold shadow-sm ${
              isError 
                ? 'bg-red-100 text-red-700 border-2 border-red-500 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800' 
                : 'bg-green-100 text-green-700 border-2 border-green-500 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800'
            }`}>
              {message}
            </div>
          )}

          {isScanning && !scanResult ? (
            <div>
              <p className="text-gray-500 dark:text-gray-400 mb-4 font-medium">
                Position the student's QR code in the frame
              </p>
              <div id="reader" className="mx-auto overflow-hidden rounded-xl border-4 border-gray-200 dark:border-gray-700 w-full sm:w-[400px] min-h-[300px] bg-black"></div>
            </div>
          ) : (
            <div className="py-10">
              <p className="text-gray-600 dark:text-gray-300 mb-6 font-medium text-lg">
                Ready for the next student?
              </p>
              <button 
                onClick={handleScanAgain}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-4 rounded-xl transition-colors shadow-lg transform hover:scale-105"
              >
                📷 Scan Next Ticket
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminScanner;