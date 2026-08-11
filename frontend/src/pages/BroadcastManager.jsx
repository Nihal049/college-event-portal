import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const BroadcastManager = () => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  // Warm Light-Mode SweetAlert Config (Aurora Style)
  const swalConfig = {
    background: '#ffffff',
    color: '#292524',
    customClass: { popup: 'rounded-[2rem] shadow-2xl border border-rose-50 font-sans' }
  };

  const handleBroadcast = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const token = localStorage.getItem('token');

    try {
      const response = await fetch('https://college-event-portal-a0d1.onrender.com/api/events/broadcast', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title, message })
      });

      const data = await response.json();

      if (response.ok) {
        Swal.fire({
          ...swalConfig,
          title: 'Signal Transmitted!',
          text: 'Announcement broadcasted successfully to all connected users.',
          icon: 'success',
          confirmButtonColor: '#f43f5e' // Rose color
        });
        setTitle('');
        setMessage('');
      } else {
        Swal.fire({
          ...swalConfig,
          title: 'Transmission Failed',
          text: data.message || 'Error sending broadcast.',
          icon: 'error',
          confirmButtonColor: '#f43f5e'
        });
      }
    } catch (error) {
      Swal.fire({
        ...swalConfig,
        title: 'Connection Error',
        text: 'Cannot connect to server.',
        icon: 'error',
        confirmButtonColor: '#f43f5e'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fff8f6] py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden font-sans selection:bg-rose-500/20">
      
      {/* --- AURORA AMBIENT BACKGROUND BLOBS --- */}
      <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-rose-300/40 rounded-full blur-[120px] pointer-events-none mix-blend-multiply"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-orange-300/40 rounded-full blur-[120px] pointer-events-none mix-blend-multiply"></div>
      
      <div className="max-w-2xl w-full relative z-10">
        
        {/* --- MAIN AURORA GLASS CARD --- */}
        <div className="bg-white/60 backdrop-blur-xl p-8 sm:p-12 rounded-[2.5rem] shadow-xl shadow-rose-900/5 border border-white relative overflow-hidden">
          
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 border-b border-white/60 pb-6 relative z-10 gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-sm border bg-rose-50 text-rose-600 border-rose-100 mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
                Level 1 Clearance
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-stone-800 leading-tight tracking-tight">
                Global Broadcast
              </h1>
            </div>
            <Link to="/dashboard" className="group flex items-center gap-2 bg-white/80 hover:bg-white border border-white text-stone-600 px-5 py-2.5 rounded-xl font-bold transition-all duration-300 shadow-sm transform hover:-translate-y-0.5 active:scale-95">
              <span className="text-xl group-hover:-translate-x-1 transition-transform text-stone-400">←</span>
              Abort
            </Link>
          </div>

          <form onSubmit={handleBroadcast} className="space-y-8 relative z-10">
            
            {/* Title Input */}
            <div>
              <label className="block text-[10px] font-black text-stone-500 uppercase tracking-widest mb-2 ml-1">
                Alert Designation (Title)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none opacity-50">
                  <span className="text-stone-400 text-lg">📢</span>
                </div>
                <input
                  type="text"
                  required
                  className="block w-full pl-12 pr-4 py-4 bg-white/50 border border-white rounded-xl focus:ring-2 focus:ring-rose-400 focus:border-transparent transition-all font-bold text-stone-800 outline-none placeholder-stone-400 shadow-inner"
                  placeholder="e.g. SYSTEM OVERRIDE: Venue Change to Hall B"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
            </div>

            {/* Message Input */}
            <div>
              <label className="block text-[10px] font-black text-stone-500 uppercase tracking-widest mb-2 ml-1">
                Transmission Payload (Message)
              </label>
              <div className="relative">
                <div className="absolute top-4 left-0 pl-4 flex items-start pointer-events-none opacity-50">
                  <span className="text-stone-400 text-lg">💬</span>
                </div>
                <textarea
                  required
                  rows="5"
                  className="block w-full pl-12 pr-4 py-4 bg-white/50 border border-white rounded-xl focus:ring-2 focus:ring-rose-400 focus:border-transparent transition-all font-medium text-stone-800 outline-none placeholder-stone-400 resize-none leading-relaxed shadow-inner"
                  placeholder="Type your urgent broadcast message here. This will instantly override all connected client dashboards..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                ></textarea>
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="pt-4 border-t border-white/60 mt-8">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full flex justify-center items-center py-4.5 rounded-xl text-white font-black text-sm uppercase tracking-widest shadow-lg transform transition-all ${
                  isSubmitting 
                    ? 'bg-stone-200 cursor-not-allowed text-stone-400 shadow-none' 
                    : 'bg-gradient-to-r from-orange-400 to-rose-500 hover:from-orange-500 hover:to-rose-600 shadow-rose-500/25 hover:-translate-y-0.5 active:scale-95'
                }`}
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-3">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Transmitting Signal...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <span className="text-xl">🚀</span> Broadcast Instant Alert
                  </span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BroadcastManager;