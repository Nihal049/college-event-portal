import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
    department: ''
  });
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setIsSubmitting(true);

    try {
      const response = await fetch('https://college-event-portal-a0d1.onrender.com/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Registration successful. Initializing profile...');
        setIsError(false);
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setMessage(data.message || 'Registration failed');
        setIsError(true);
        setIsSubmitting(false);
      }
    } catch (error) {
      setMessage('Cannot connect to server.');
      setIsError(true);
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
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-sm border bg-white text-orange-600 border-orange-100 mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse"></span>
              New User Reg
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-stone-800 pb-1 leading-tight tracking-tight">
              Create Profile
            </h1>
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

          <form className="space-y-5 relative z-10" onSubmit={handleSubmit}>
            
            {/* Full Name */}
            <div>
              <label className="block text-[10px] font-black text-stone-500 uppercase tracking-widest mb-2 ml-1">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none opacity-50">
                  <span className="text-stone-400 text-lg">👤</span>
                </div>
                <input
                  name="name"
                  type="text"
                  required
                  className="block w-full pl-12 pr-4 py-3.5 bg-white/50 border border-white rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all font-bold text-stone-800 outline-none placeholder-stone-400 shadow-inner"
                  placeholder="Name as per college records"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Email Input */}
            <div>
              <label className="block text-[10px] font-black text-stone-500 uppercase tracking-widest mb-2 ml-1">
                Email Address
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
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-[10px] font-black text-stone-500 uppercase tracking-widest mb-2 ml-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none opacity-50">
                  <span className="text-stone-400 text-lg">🔒</span>
                </div>
                <input
                  name="password"
                  type="password"
                  required
                  className="block w-full pl-12 pr-4 py-3.5 bg-white/50 border border-white rounded-xl focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all font-bold text-stone-800 outline-none placeholder-stone-400 shadow-inner"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Role & Department Row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black text-stone-500 uppercase tracking-widest mb-2 ml-1">
                  Access Level
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none opacity-50">
                    <span className="text-stone-400 text-sm">🎓</span>
                  </div>
                  <select
                    name="role"
                    className="block w-full pl-9 pr-4 py-3.5 bg-white/50 border border-white rounded-xl focus:ring-2 focus:ring-orange-400 transition-all font-bold text-stone-800 outline-none appearance-none cursor-pointer shadow-inner"
                    value={formData.role}
                    onChange={handleChange}
                  >
                    <option value="student">Student</option>
                    <option value="volunteer">Volunteer</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-stone-500 uppercase tracking-widest mb-2 ml-1">
                  Department
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none opacity-50">
                    <span className="text-stone-400 text-sm">🏢</span>
                  </div>
                  <input
                    name="department"
                    type="text"
                    className="block w-full pl-9 pr-4 py-3.5 bg-white/50 border border-white rounded-xl focus:ring-2 focus:ring-orange-400 transition-all font-bold text-stone-800 outline-none placeholder-stone-400 uppercase shadow-inner"
                    placeholder="E.G. CSE"
                    value={formData.department}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
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
                    Processing...
                  </span>
                ) : (
                  'Create Account'
                )}
              </button>
            </div>
          </form>

          {/* Login Link */}
          <div className="mt-8 pt-6 border-t border-white/50 text-center relative z-10">
            <p className="text-sm font-medium text-stone-500">
              Already have an account?{' '}
              <Link to="/login" className="font-black text-orange-600 hover:text-orange-500 transition-colors ml-1">
                Login Here
              </Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Register;