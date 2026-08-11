import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';

const MySchedule = () => {
  const [bookmarkedEvents, setBookmarkedEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Warm Light-Mode SweetAlert Config (Aurora Style)
  const swalConfig = {
    background: '#ffffff',
    color: '#292524',
    customClass: { popup: 'rounded-[2rem] shadow-2xl border border-orange-50 font-sans' }
  };

  // FETCH REAL DATA!
  useEffect(() => {
    const fetchBookmarks = async () => {
      const token = localStorage.getItem('token');
      try {
        const response = await fetch('https://college-event-portal-a0d1.onrender.com/api/events/my-bookmarks', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (response.ok) {
          setBookmarkedEvents(data);
        }
      } catch (error) {
        console.error("Failed to fetch bookmarks", error);
      } finally {
        setLoading(false);
      }
    };
    
    if (localStorage.getItem('token')) {
      fetchBookmarks();
    } else {
      setLoading(false);
    }
  }, []);

  // MAKE THE REMOVE BUTTON WORK!
  const handleRemove = async (eventId) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`https://college-event-portal-a0d1.onrender.com/api/events/${eventId}/bookmark`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        // Instantly remove it from the screen
        setBookmarkedEvents(bookmarkedEvents.filter(e => e._id !== eventId));
      }
    } catch (error) {
      Swal.fire({
        ...swalConfig,
        title: 'Error',
        text: 'Failed to remove event.',
        icon: 'error',
        confirmButtonColor: '#f43f5e'
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#fff8f6]">
        <div className="w-16 h-16 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin mb-4"></div>
        <p className="text-orange-500 font-black tracking-widest uppercase text-sm animate-pulse shadow-sm">Syncing Schedule...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fff8f6] py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden font-sans text-stone-800 selection:bg-orange-500/20">
      
      {/* --- AURORA AMBIENT BACKGROUND BLOBS --- */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-rose-300/40 rounded-full blur-[100px] pointer-events-none mix-blend-multiply"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-orange-300/40 rounded-full blur-[100px] pointer-events-none mix-blend-multiply"></div>

      <div className="max-w-4xl mx-auto relative z-10">
        
        {/* --- AURORA HEADER --- */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 bg-white/60 backdrop-blur-xl p-6 md:p-8 rounded-[2rem] shadow-xl shadow-rose-900/5 border border-white gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-stone-800 tracking-tight pb-1">
              My Itinerary
            </h1>
            <p className="text-orange-600 font-black uppercase tracking-widest text-[10px] mt-1 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse"></span>
              Personalized Fest Schedule
            </p>
          </div>
          <Link to="/dashboard" className="group flex items-center gap-2 bg-white/80 hover:bg-white border border-white text-stone-600 px-5 py-2.5 rounded-xl font-bold transition-all duration-300 transform hover:-translate-y-0.5 shadow-sm active:scale-95">
            <span className="text-xl group-hover:-translate-x-1 transition-transform text-stone-400">←</span>
            Back
          </Link>
        </div>

        {bookmarkedEvents.length === 0 ? (
          <div className="bg-white/60 backdrop-blur-xl p-16 rounded-[2.5rem] border border-dashed border-stone-300 hover:border-orange-400 transition-colors text-center flex flex-col items-center justify-center shadow-xl shadow-rose-900/5">
            <div className="w-20 h-20 bg-white border border-white rounded-full flex items-center justify-center shadow-sm mb-6 text-4xl">
              📅
            </div>
            <h2 className="text-2xl font-black text-stone-800 mb-2 tracking-tight">Your itinerary is empty</h2>
            <p className="text-stone-500 font-medium mb-8 max-w-sm">Go to the dashboard to bookmark events you're interested in attending!</p>
            <Link to="/dashboard" className="bg-gradient-to-r from-orange-400 to-rose-400 hover:from-orange-500 hover:to-rose-500 text-white px-8 py-3.5 rounded-xl font-black shadow-lg shadow-rose-500/25 transition-all duration-300 active:scale-95 hover:-translate-y-0.5 transform">
              Browse Events
            </Link>
          </div>
        ) : (
          /* --- SUNSET TIMELINE TRACK --- */
          <div className="relative border-l-2 border-orange-200 ml-4 md:ml-8 space-y-8 pb-12">
            
            {bookmarkedEvents.map((event) => (
              <div key={event._id} className="relative pl-8 md:pl-12 group">
                
                {/* Glowing Timeline Node Marker */}
                <div className="absolute -left-[13px] top-6 w-6 h-6 rounded-full bg-white border-2 border-orange-400 shadow-[0_0_15px_rgba(249,115,22,0.4)] flex items-center justify-center group-hover:scale-125 transition-transform">
                  <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></div>
                </div>
                
                {/* Frosted Glass Event Card */}
                <div className="bg-white/60 backdrop-blur-xl p-6 md:p-8 rounded-[2rem] shadow-xl shadow-rose-900/5 hover:shadow-2xl hover:shadow-rose-900/10 border border-white group-hover:border-orange-200 transition-all duration-300 relative overflow-hidden">
                  
                  {/* Subtle inner card glow */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-orange-400/10 rounded-full blur-2xl pointer-events-none"></div>

                  <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-6 relative z-10">
                    <div>
                      <div className="flex gap-3 items-center mb-3">
                        <span className="text-[10px] font-black text-orange-600 bg-orange-50 border border-orange-100 px-3 py-1 rounded-full uppercase tracking-widest shadow-sm">
                          {event.festDay || 'Day 1'}
                        </span>
                        <span className="text-xs font-bold text-stone-500 bg-white border border-stone-100 px-3 py-1 rounded-full shadow-sm">
                          ⏰ {event.startTime || 'TBA'} - {event.endTime || 'TBA'}
                        </span>
                      </div>
                      
                      <h3 className="text-2xl font-black text-stone-800 tracking-tight group-hover:text-orange-600 transition-colors">{event.title}</h3>
                      <p className="text-stone-500 mt-2 flex items-center font-medium text-sm">
                        <span className="mr-2 bg-white p-1 rounded-md shadow-sm text-xs">📍</span> {event.venue}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 mt-2 md:mt-0">
                      <button 
                        onClick={() => handleRemove(event._id)}
                        className="bg-white hover:bg-rose-50 border border-stone-200 text-rose-500 text-xs font-black uppercase tracking-wider px-4 py-2.5 rounded-xl transition-all active:scale-95 shadow-sm"
                      >
                        Remove
                      </button>
                      <Link to="/dashboard" className="bg-gradient-to-r from-orange-400 to-rose-400 hover:from-orange-500 hover:to-rose-500 text-white text-xs font-black uppercase tracking-wider px-5 py-2.5 rounded-xl transition-all shadow-md shadow-rose-500/25 active:scale-95 text-center transform hover:-translate-y-0.5">
                        Register
                      </Link>
                    </div>
                  </div>
                </div>
                
              </div>
            ))}

          </div>
        )}
      </div>
    </div>
  );
};

export default MySchedule;