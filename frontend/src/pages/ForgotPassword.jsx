import { useState } from 'react';
import { Link } from 'react-router-dom';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setIsSubmitting(true);

    try {
      const response = await fetch('https://college-event-portal-a0d1.onrender.com/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      
      const data = await response.json();

      if (response.ok) {
        setMessage('Success! Reset link sent to your email.');
        setIsError(false);
      } else {
        setMessage(data.message || 'Failed to send reset link');
        setIsError(true);
      }
    } catch (error) {
      setMessage('Cannot connect to server. Please try again later.');
      setIsError(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fff8f6] py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden font-sans selection:bg-orange-500/20">
      
      {/* --- AURORA AMBIENT BACKGROUND BLOBS --- */}
      <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-rose-300/40 rounded-full blur-[120px] pointer-events-none mix-blend-multiply"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-orange-300/40 rounded-full blur-[120px] pointer-events-none mix-blend-multiply"></div>
      
      <div className="max-w-md w-full relative z-10">
        
        {/* --- MAIN AURORA GLASS CARD --- */}
        <div className="bg-white/60 backdrop-blur-xl p-8 sm:p-10 rounded-[2.5rem] shadow-xl shadow-rose-900/5 border border-white relative overflow-hidden group">
          
          {/* Header Section */}
          <div className="mb-8 text-center relative z-10">
            <div className="w-16 h-16 bg-white border border-orange-50 text-stone-800 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-sm transform -rotate-6 group-hover:rotate-0 transition-transform duration-500">
              <span className="text-3xl filter drop-shadow-sm">🔐</span>
            </div>
            <h1 className="text-3xl font-black text-stone-800 pb-1 leading-tight tracking-tight">
              Account Recovery
            </h1>
            <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mt-2">
              Enter your email to reset access
            </p>
          </div>

          {/* Alert Message */}
          {message && (
            <div className={`p-4 rounded-2xl text-sm text-center font-bold mb-6 transition-all border backdrop-blur-md relative z-10 shadow-sm ${
              isError 
                ? 'bg-rose-50 text-rose-600 border-rose-200' 
                : 'bg-emerald-50 text-emerald-600 border-emerald-200'
            }`}>
              {message}
            </div>
          )}

          <form className="space-y-6 relative z-10" onSubmit={handleSubmit}>
            
            {/* Email Input */}
            <div>
              <label className="block text-[10px] font-black text-stone-500 uppercase tracking-widest mb-2 ml-1">
                Registered Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none opacity-50">
                  <span className="text-stone-400 text-lg">✉️</span>
                </div>
                <input
                  name="email"
                  type="email"
                  required
                  className="block w-full pl-12 pr-4 py-3.5 bg-white/50 border border-white rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all font-bold text-stone-800 outline-none placeholder-stone-400 shadow-inner"
                  placeholder="student@college.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full flex justify-center items-center py-4 rounded-xl text-white font-black text-sm uppercase tracking-widest shadow-lg transform transition-all ${
                  isSubmitting 
                    ? 'bg-stone-200 border border-stone-200 text-stone-400 cursor-not-allowed shadow-none' 
                    : 'bg-gradient-to-r from-orange-400 to-rose-400 hover:from-orange-500 hover:to-rose-500 shadow-rose-500/25 hover:-translate-y-0.5 active:scale-95'
                }`}
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-3">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Transmitting...
                  </span>
                ) : (
                  'Send Reset Link'
                )}
              </button>
            </div>
          </form>

          {/* Login Link */}
          <div className="mt-8 pt-6 border-t border-white/50 text-center relative z-10">
            <Link to="/login" className="text-sm font-black text-stone-500 hover:text-orange-500 transition-colors flex items-center justify-center gap-2">
              <span className="text-orange-400 font-bold">←</span> Back to Login
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;