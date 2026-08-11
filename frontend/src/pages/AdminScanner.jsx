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
              setMessage('Invalid QR Code format.');
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
      const response = await fetch(`https://college-event-portal-a0d1.onrender.com/api/events/${eventId}/checkin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ userId })
      });
      const data = await response.json();
      if (response.ok) {
        setMessage(data.message);
        setIsError(false);
      } else {
        setMessage(data.message);
        setIsError(true);
      }
    } catch (error) {
      setMessage('Cannot connect to server.');
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
    <div className="min-h-screen bg-[#fff8f6] py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden font-sans flex flex-col items-center selection:bg-orange-500/20">
      
      {/* --- AURORA AMBIENT BACKGROUND BLOBS --- */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-rose-300/40 rounded-full blur-[100px] pointer-events-none mix-blend-multiply"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-orange-300/40 rounded-full blur-[100px] pointer-events-none mix-blend-multiply"></div>
      
      <div className="max-w-2xl w-full relative z-10">
        
        {/* --- HEADER --- */}
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-stone-800 pb-1 tracking-tight">
              Gate Scanner
            </h1>
            <span className="inline-flex items-center gap-2 mt-2 text-[10px] font-black text-orange-600 bg-orange-50 border border-orange-100 px-3 py-1.5 rounded-full uppercase tracking-widest shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse"></span>
              Volunteer System
            </span>
          </div>
          <button 
            onClick={handleSafeNavigation} 
            className="group flex items-center gap-2 bg-white/60 hover:bg-white border border-white text-stone-600 px-5 py-2.5 rounded-xl font-bold transition-all duration-300 backdrop-blur-md transform hover:-translate-y-0.5 shadow-sm active:scale-95"
          >
            <span className="text-xl group-hover:-translate-x-1 transition-transform text-stone-400">←</span>
            Exit
          </button>
        </div>

        {/* --- MAIN AURORA GLASS CARD --- */}
        <div className="bg-white/60 backdrop-blur-xl p-6 sm:p-10 rounded-[2.5rem] shadow-xl shadow-rose-900/5 border border-white text-center flex flex-col items-center relative overflow-hidden">
          
          {/* Status Message Display */}
          {message && (
            <div className={`w-full p-5 mb-8 rounded-2xl text-lg sm:text-xl font-black border backdrop-blur-md transition-all transform animate-fade-in-up flex items-center justify-center gap-3 relative z-10 shadow-sm ${
              isError 
                ? 'bg-rose-50 text-rose-600 border-rose-200' 
                : 'bg-emerald-50 text-emerald-600 border-emerald-200'
            }`}>
              <span className="text-2xl">{isError ? '⚠️' : '✅'}</span>
              {message}
            </div>
          )}

          {isScanning && !scanResult ? (
            <div className="w-full flex flex-col items-center relative z-10">
              <p className="text-stone-500 font-bold uppercase tracking-widest text-xs mb-6 flex items-center gap-2">
                Scanning for tickets...
              </p>
              
              {/* Camera Frame */}
              <div className="relative w-full max-w-[400px] aspect-square rounded-[2rem] p-2 bg-white border border-white shadow-xl shadow-rose-900/5">
                {/* 
                  Note: The actual camera feed needs a dark background so it blends well when 
                  the camera is initializing or if aspect ratios don't match. 
                */}
                <div 
                  id="reader" 
                  className="w-full h-full rounded-[1.5rem] overflow-hidden bg-stone-900 flex items-center justify-center border border-stone-800"
                ></div>
                
                {/* Warm Sunset Scanning Corners */}
                <div className="absolute top-6 left-6 w-10 h-10 border-t-4 border-l-4 border-orange-400 rounded-tl-xl pointer-events-none drop-shadow-[0_0_8px_rgba(249,115,22,0.6)]"></div>
                <div className="absolute top-6 right-6 w-10 h-10 border-t-4 border-r-4 border-orange-400 rounded-tr-xl pointer-events-none drop-shadow-[0_0_8px_rgba(249,115,22,0.6)]"></div>
                <div className="absolute bottom-6 left-6 w-10 h-10 border-b-4 border-l-4 border-rose-400 rounded-bl-xl pointer-events-none drop-shadow-[0_0_8px_rgba(2fb,113,133,0.6)]"></div>
                <div className="absolute bottom-6 right-6 w-10 h-10 border-b-4 border-r-4 border-rose-400 rounded-br-xl pointer-events-none drop-shadow-[0_0_8px_rgba(2fb,113,133,0.6)]"></div>
              </div>
            </div>
          ) : (
            <div className="py-12 flex flex-col items-center w-full relative z-10">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm border border-orange-50">
                <span className="text-4xl block translate-y-1 drop-shadow-sm">🎫</span>
              </div>
              <p className="text-stone-800 mb-8 font-black text-xl tracking-tight">
                Ready for the next scan?
              </p>
              <button 
                onClick={handleScanAgain}
                className="w-full max-w-sm bg-gradient-to-r from-orange-400 to-rose-400 hover:from-orange-500 hover:to-rose-500 text-white font-black px-8 py-4 rounded-2xl transition-transform shadow-lg shadow-rose-500/25 active:scale-95 text-lg flex items-center justify-center gap-3"
              >
                <span className="text-2xl drop-shadow-md">📷</span> Scan Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminScanner;