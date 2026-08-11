import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [profileData, setProfileData] = useState({ name: '', email: '', rollNumber: '' });
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '' });

  // Warm Light-Mode SweetAlert Config (Aurora Style)
  const swalConfig = {
    background: '#ffffff',
    color: '#292524',
    customClass: { popup: 'rounded-[2rem] shadow-2xl border border-orange-50 font-sans' }
  };
  
  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      try {
        const response = await fetch('https://college-event-portal-a0d1.onrender.com/api/auth/profile', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (response.ok) {
          setUser(data);
          setProfileData({ name: data.name, email: data.email, rollNumber: data.rollNumber || '' });
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };
    fetchProfile();
  }, []);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    try {
      const response = await fetch('https://college-event-portal-a0d1.onrender.com/api/auth/update-profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profileData)
      });

      const data = await response.json();

      if (response.ok) {
        Swal.fire({
          ...swalConfig,
          title: 'Success!',
          text: 'Profile updated successfully!',
          icon: 'success',
          confirmButtonColor: '#f97316' // Orange-500
        });
        setUser(data);
      } else {
        Swal.fire({
          ...swalConfig,
          title: 'Oops!',
          text: data.message || 'Failed to update profile',
          icon: 'error',
          confirmButtonColor: '#f43f5e' // Rose-500
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
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    try {
      const response = await fetch('https://college-event-portal-a0d1.onrender.com/api/auth/update-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(passwords)
      });

      const data = await response.json();

      if (response.ok) {
        Swal.fire({
          ...swalConfig,
          title: 'Secured!',
          text: 'Password updated successfully!',
          icon: 'success',
          confirmButtonColor: '#f97316' 
        });
        setPasswords({ currentPassword: '', newPassword: '' });
      } else {
        Swal.fire({
          ...swalConfig,
          title: 'Error',
          text: data.message || 'Failed to update password',
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
    }
  };

  // Helper function to get initials for the Avatar
  const getInitials = (name) => {
    if (!name) return 'U';
    const names = name.split(' ');
    if (names.length >= 2) return (names[0][0] + names[1][0]).toUpperCase();
    return names[0][0].toUpperCase();
  };

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#fff8f6]">
        <div className="w-16 h-16 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin mb-4"></div>
        <p className="text-orange-500 font-black tracking-widest uppercase text-sm animate-pulse shadow-sm">Decrypting Profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fff8f6] py-12 px-4 sm:px-6 lg:px-8 font-sans relative overflow-hidden selection:bg-orange-500/20 text-stone-800">
      
      {/* --- AURORA AMBIENT BACKGROUND BLOBS --- */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-rose-300/40 rounded-full blur-[100px] pointer-events-none mix-blend-multiply"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-orange-300/40 rounded-full blur-[100px] pointer-events-none mix-blend-multiply"></div>

      <div className="max-w-3xl mx-auto relative z-10">
        
        {/* --- AURORA HEADER CARD --- */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6 bg-white/60 backdrop-blur-xl p-6 md:p-8 rounded-[2rem] shadow-xl shadow-rose-900/5 border border-white">
          <div>
            <h1 className="text-4xl font-black text-stone-800 tracking-tight pb-1">
              Account Profile
            </h1>
            <p className="text-stone-500 font-medium text-sm">Edit your personal information and details</p>
          </div>
          <Link 
            to="/dashboard"
            className="group flex items-center gap-2 bg-white/80 hover:bg-white text-stone-600 px-6 py-3 rounded-xl font-bold transition-all duration-300 transform hover:-translate-y-0.5 shadow-sm border border-stone-100 active:scale-95"
          >
            <span className="text-xl group-hover:-translate-x-1 transition-transform text-stone-400">←</span>
            Back to Hub
          </Link>
        </div>

        {/* --- EDIT BIODATA SECTION (FROSTED GLASS) --- */}
        <div className="bg-white/60 backdrop-blur-xl p-8 sm:p-10 rounded-[2.5rem] shadow-xl shadow-rose-900/5 hover:shadow-2xl hover:shadow-rose-900/10 transition-all duration-500 border border-white mb-8 relative overflow-hidden group">
          
          {/* Inner Glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-300/20 rounded-full blur-3xl opacity-50 -mr-20 -mt-20 pointer-events-none transition-opacity group-hover:opacity-100"></div>

          {/* Avatar and Role Header */}
          <div className="relative z-10 flex flex-col sm:flex-row items-center gap-6 mb-10 pb-8 border-b border-stone-200/60">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-400 to-rose-400 flex items-center justify-center text-white text-3xl font-black shadow-md ring-4 ring-white border border-rose-100">
              {getInitials(profileData.name)}
            </div>
            <div className="text-center sm:text-left">
              <h2 className="text-2xl font-black text-stone-800 mb-1 tracking-tight">{profileData.name || 'User'}</h2>
              <p className="text-stone-500 font-medium mb-3">{profileData.email}</p>
              
              <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-sm border ${
                user.role === 'admin' ? 'bg-orange-50 text-orange-600 border-orange-100' : 
                user.role === 'volunteer' ? 'bg-rose-50 text-rose-600 border-rose-100' : 
                'bg-white text-stone-600 border-stone-200'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                  user.role === 'admin' ? 'bg-orange-500' : 
                  user.role === 'volunteer' ? 'bg-rose-500' : 'bg-stone-500'
                }`}></span>
                {user.role} Authorization
              </span>
            </div>
          </div>

          <form onSubmit={handleProfileUpdate} className="relative z-10 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="sm:col-span-2">
                <label className="block text-[10px] font-black text-stone-500 uppercase tracking-widest mb-2 ml-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  className="w-full px-4 py-3.5 bg-white/50 border border-white rounded-xl focus:ring-2 focus:ring-orange-400 transition-all font-bold text-stone-800 outline-none shadow-inner placeholder-stone-400"
                />
              </div>
              
              <div>
                <label className="block text-[10px] font-black text-stone-500 uppercase tracking-widest mb-2 ml-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={profileData.email}
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  className="w-full px-4 py-3.5 bg-stone-50/60 border border-stone-100 rounded-xl transition-all font-bold text-stone-400 outline-none cursor-not-allowed shadow-inner"
                  disabled // Recommended: Emails usually shouldn't be edited freely without verification
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-stone-500 uppercase tracking-widest mb-2 ml-1">Roll Number</label>
                <input
                  type="text"
                  value={profileData.rollNumber}
                  onChange={(e) => setProfileData({ ...profileData, rollNumber: e.target.value })}
                  className="w-full px-4 py-3.5 bg-white/50 border border-white rounded-xl focus:ring-2 focus:ring-orange-400 transition-all font-bold text-stone-800 uppercase outline-none placeholder-stone-400 shadow-inner"
                  placeholder="e.g. 24A81A0549"
                />
              </div>
            </div>

            <div className="pt-4 flex justify-end border-t border-stone-200/50 mt-6">
              <button
                type="submit"
                className="w-full sm:w-auto bg-gradient-to-r from-orange-400 to-rose-400 hover:from-orange-500 hover:to-rose-500 text-white font-black px-8 py-3.5 rounded-xl shadow-lg shadow-rose-500/25 transform hover:-translate-y-0.5 transition-all active:scale-95 mt-4"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>

        {/* --- SECURITY SECTION (FROSTED GLASS) --- */}
        <div className="bg-white/60 backdrop-blur-xl p-8 sm:p-10 rounded-[2.5rem] shadow-xl shadow-rose-900/5 hover:shadow-2xl hover:shadow-rose-900/10 transition-all duration-500 border border-white relative overflow-hidden group">
          
          {/* Rose Inner Glow */}
          <div className="absolute top-0 left-0 w-64 h-64 bg-rose-300/20 rounded-full blur-3xl opacity-50 -ml-20 -mt-20 pointer-events-none transition-opacity group-hover:opacity-100"></div>

          <div className="relative z-10 flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-white border border-rose-100 text-rose-500 rounded-2xl flex items-center justify-center text-2xl shadow-sm">
              🔒
            </div>
            <h2 className="text-2xl font-black text-stone-800 tracking-tight">Change Password</h2>
          </div>
          
          <form onSubmit={handlePasswordChange} className="relative z-10 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] font-black text-stone-500 uppercase tracking-widest mb-2 ml-1">Current Protocol</label>
                <input
                  type="password"
                  required
                  value={passwords.currentPassword}
                  onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                  className="w-full px-4 py-3.5 bg-white/50 border border-white rounded-xl focus:ring-2 focus:ring-rose-400 transition-all font-bold text-stone-800 outline-none placeholder-stone-400 shadow-inner"
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-stone-500 uppercase tracking-widest mb-2 ml-1">New Protocol</label>
                <input
                  type="password"
                  required
                  value={passwords.newPassword}
                  onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                  className="w-full px-4 py-3.5 bg-white/50 border border-white rounded-xl focus:ring-2 focus:ring-rose-400 transition-all font-bold text-stone-800 outline-none placeholder-stone-400 shadow-inner"
                  placeholder="••••••••"
                />
              </div>
            </div>
            
            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                className="w-full sm:w-auto bg-white hover:bg-rose-50 border border-stone-200 text-stone-600 hover:text-rose-500 font-black px-8 py-3.5 rounded-xl shadow-sm transform hover:-translate-y-0.5 transition-all active:scale-95 group-hover:border-rose-200"
              >
                Update Password
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
};

export default Profile;