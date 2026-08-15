import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { io } from 'socket.io-client';
import Swal from 'sweetalert2';

const Dashboard = () => {
  const [events, setEvents] = useState([]);
  const [userRole, setUserRole] = useState('');
  const [userId, setUserId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeTab, setActiveTab] = useState('upcoming');
  const [accommodationRequests, setAccommodationRequests] = useState({});
  const [loading, setLoading] = useState(true);
  
  const [announcements, setAnnouncements] = useState(() => {
    const saved = localStorage.getItem('liveAnnouncements');
    return saved ? JSON.parse(saved) : [];
  });
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [latestAlert, setLatestAlert] = useState(null); 

  const [activeTeamAction, setActiveTeamAction] = useState({}); 
  const [teamInput, setTeamInput] = useState({}); 

  const navigate = useNavigate();

  const swalConfig = {
    background: '#ffffff',
    color: '#292524',
    customClass: { popup: 'rounded-[2rem] shadow-2xl border border-orange-50 font-sans' }
  };

  const fetchEvents = async () => {
    try {
      const response = await fetch('https://college-event-portal-a0d1.onrender.com/api/events');
      const data = await response.json();
      setEvents(data);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const role = localStorage.getItem('role');
    const token = localStorage.getItem('token');
    
    if (role) setUserRole(role);
    
    if (token) {
      try {
        const decoded = JSON.parse(atob(token.split('.')[1]));
        setUserId(decoded.id);
      } catch (e) {
        console.error("Invalid token");
      }
    }
    fetchEvents();

    const socket = io('https://college-event-portal-a0d1.onrender.com', {
      transports: ['websocket', 'polling'],
      withCredentials: true
    });

    socket.on('receive-announcement', (data) => {
      setAnnouncements((prev) => {
        const updatedList = [data, ...prev];
        localStorage.setItem('liveAnnouncements', JSON.stringify(updatedList));
        return updatedList;
      });
      setLatestAlert(data); 
      setTimeout(() => setLatestAlert(null), 8000);
    });

    return () => socket.disconnect();
  }, []);

  // --- Helper: Safely resolve dates across new and legacy schemas ---
  const getEventDates = (event) => {
    const rawStart = event.startDate || event.date;
    const rawEnd = event.endDate || event.startDate || event.date;
    return {
      startDate: rawStart ? new Date(rawStart) : null,
      endDate: rawEnd ? new Date(rawEnd) : null
    };
  };

  // --- Formatter for Dates & Times ---
  const formatEventDateTime = (event) => {
    const { startDate, endDate } = getEventDates(event);
    if (!startDate) return 'TBA';

    const sDateStr = startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const eDateStr = endDate ? endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : sDateStr;
    
    if (sDateStr === eDateStr) {
      return `${sDateStr} • ${event.startTime || 'TBA'} - ${event.endTime || 'TBA'}`;
    }
    return `${sDateStr}, ${event.startTime || 'TBA'} – ${eDateStr}, ${event.endTime || 'TBA'}`;
  };

  // --- Dynamic Status Badges ---
  const getEventStatus = (event) => {
    const { startDate, endDate } = getEventDates(event);
    if (!startDate || !endDate) {
      return { label: 'Upcoming', color: 'text-orange-600 bg-orange-50 border-orange-200', dot: 'bg-orange-500' };
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const startDay = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate()).getTime();
    const endExpiry = endDate.getTime() + (24 * 60 * 60 * 1000);

    if (now.getTime() > endExpiry) {
      return { label: 'Concluded', color: 'text-stone-500 bg-stone-100 border-stone-200', dot: 'bg-stone-400' };
    }
    if (startDay <= today && now.getTime() <= endExpiry) {
      return { label: 'Live Today', color: 'text-emerald-600 bg-emerald-50 border-emerald-200', dot: 'bg-emerald-500 animate-pulse' };
    }
    return { label: 'Upcoming', color: 'text-orange-600 bg-orange-50 border-orange-200', dot: 'bg-orange-500' };
  };

  const handleRegister = async (eventId, requestAccommodation = false) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`https://college-event-portal-a0d1.onrender.com/api/events/${eventId}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ requestAccommodation })
      });
      const data = await response.json();
      if (response.ok) {
        Swal.fire({ ...swalConfig, title: 'Success!', text: data.message, icon: 'success', confirmButtonColor: '#f97316' });
        fetchEvents();
      } else {
        Swal.fire({ ...swalConfig, title: 'Oops!', text: data.message, icon: 'error', confirmButtonColor: '#f43f5e' });
      }
    } catch (error) {
      Swal.fire({ ...swalConfig, title: 'Connection Error', text: 'Cannot connect to server.', icon: 'error', confirmButtonColor: '#f43f5e' });
    }
  };

  const handleBookmark = async (eventId) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`https://college-event-portal-a0d1.onrender.com/api/events/${eventId}/bookmark`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) Swal.fire({ ...swalConfig, title: 'Added to Itinerary!', text: data.message, icon: 'success', confirmButtonColor: '#f97316', timer: 2000, showConfirmButton: false });
    } catch (error) {
      Swal.fire({ ...swalConfig, title: 'Connection Error', text: 'Cannot connect to server.', icon: 'error', confirmButtonColor: '#f43f5e' });
    }
  };

  const handleCreateTeam = async (eventId) => {
    const token = localStorage.getItem('token');
    const teamName = teamInput[eventId];
    if (!teamName) return Swal.fire({ ...swalConfig, title: 'Missing Information', text: 'Please enter a team name!', icon: 'warning', confirmButtonColor: '#f59e0b' });
    try {
      const response = await fetch(`https://college-event-portal-a0d1.onrender.com/api/events/${eventId}/team`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ teamName })
      });
      const data = await response.json();
      if (response.ok) {
        Swal.fire({ ...swalConfig, title: 'Team Created! 🎉', text: `${data.message}\n\nMake sure to share your Invite Code!`, icon: 'success', confirmButtonColor: '#f97316' });
        fetchEvents();
      } else Swal.fire({ ...swalConfig, title: 'Error', text: data.message, icon: 'error', confirmButtonColor: '#f43f5e' });
    } catch (error) {
      Swal.fire({ ...swalConfig, title: 'Connection Error', text: 'Cannot connect to server.', icon: 'error', confirmButtonColor: '#f43f5e' });
    }
  };

  const handleJoinTeam = async (eventId) => {
    const token = localStorage.getItem('token');
    const inviteCode = teamInput[eventId];
    if (!inviteCode) return Swal.fire({ ...swalConfig, title: 'Missing Information', text: 'Please enter the invite code!', icon: 'warning', confirmButtonColor: '#f59e0b' });
    try {
      const response = await fetch(`https://college-event-portal-a0d1.onrender.com/api/events/${eventId}/team/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ inviteCode })
      });
      const data = await response.json();
      if (response.ok) {
        Swal.fire({ ...swalConfig, title: 'Joined Successfully!', text: data.message, icon: 'success', confirmButtonColor: '#f97316' });
        fetchEvents();
      } else Swal.fire({ ...swalConfig, title: 'Error', text: data.message, icon: 'error', confirmButtonColor: '#f43f5e' });
    } catch (error) {
      Swal.fire({ ...swalConfig, title: 'Connection Error', text: 'Cannot connect to server.', icon: 'error', confirmButtonColor: '#f43f5e' });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/login');
  };

  const handleDelete = async (eventId) => {
    const result = await Swal.fire({ ...swalConfig, title: 'Are you sure?', text: 'You want to delete this event? This action cannot be undone.', icon: 'warning', showCancelButton: true, confirmButtonColor: '#f43f5e', cancelButtonColor: '#a8a29e', confirmButtonText: 'Yes, delete it!' });
    if (!result.isConfirmed) return;
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`https://college-event-portal-a0d1.onrender.com/api/events/${eventId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setEvents(events.filter(event => event._id !== eventId));
        Swal.fire({ ...swalConfig, title: 'Deleted!', text: 'Event deleted successfully.', icon: 'success', confirmButtonColor: '#f97316' });
      } else {
        const data = await response.json();
        Swal.fire({ ...swalConfig, title: 'Error', text: data.message, icon: 'error', confirmButtonColor: '#f43f5e' });
      }
    } catch (error) {
      Swal.fire({ ...swalConfig, title: 'Connection Error', text: 'Cannot connect to server.', icon: 'error', confirmButtonColor: '#f43f5e' });
    }
  };

  // --- Filtering with Fallback Support ---
  const filteredEvents = events.filter((event) => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          event.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || event.category === selectedCategory;
    
    const { endDate } = getEventDates(event);
    const now = new Date();
    const isPast = endDate ? (endDate.getTime() + (24 * 60 * 60 * 1000) < now.getTime()) : false;

    const matchesTab = activeTab === 'upcoming' ? !isPast : isPast;

    return matchesSearch && matchesCategory && matchesTab;
  });

  return (
    <div className="min-h-screen bg-[#fff8f6] py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden font-sans text-stone-800 selection:bg-orange-500/20">
      
      <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-rose-300/40 rounded-full blur-[120px] pointer-events-none mix-blend-multiply"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-orange-300/40 rounded-full blur-[120px] pointer-events-none mix-blend-multiply"></div>

      {latestAlert && (
        <div className="fixed top-5 right-5 z-50 max-w-md bg-white/90 backdrop-blur-xl p-5 rounded-3xl shadow-xl shadow-rose-500/10 border border-rose-100 animate-bounce flex items-start gap-4">
          <span className="text-3xl filter drop-shadow-sm">🚨</span>
          <div className="flex-1">
            <div className="flex justify-between items-center mb-1">
              <h4 className="font-black uppercase tracking-widest text-[11px] text-rose-500">Live Announcement</h4>
              <span className="text-[10px] font-bold bg-rose-50 text-rose-600 px-2 py-0.5 rounded-full border border-rose-100">{latestAlert.time}</span>
            </div>
            <p className="font-black text-lg leading-tight text-stone-800">{latestAlert.title}</p>
            <p className="text-sm text-stone-500 mt-1 font-medium">{latestAlert.message}</p>
          </div>
          <button onClick={() => setLatestAlert(null)} className="text-stone-400 hover:text-stone-800 font-bold text-xl transition-colors">×</button>
        </div>
      )}

      <div className="max-w-7xl mx-auto relative z-10">
        
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-10 gap-6 bg-white/60 backdrop-blur-xl p-6 md:p-8 rounded-[2rem] shadow-xl shadow-rose-900/5 border border-white">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <h1 className="text-4xl md:text-5xl font-black text-stone-800 tracking-tight">Event Hub</h1>
            <span className={`text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-sm mt-2 md:mt-0 border ${
              userRole === 'admin' ? 'bg-orange-100 text-orange-600 border-orange-200' : 
              userRole === 'volunteer' ? 'bg-rose-100 text-rose-600 border-rose-200' : 
              'bg-white text-stone-600 border-stone-200'
            }`}>
              {userRole === 'admin' ? 'Admin Portal' : userRole === 'volunteer' ? 'Volunteer Portal' : 'Student Portal'}
            </span>
          </div>
          
          <div className="flex flex-wrap gap-3 items-center w-full xl:w-auto">
            <button 
              onClick={() => setShowNotificationModal(true)}
              className="relative bg-white/80 hover:bg-white border border-white text-stone-700 w-12 h-12 rounded-xl transition-all duration-300 flex items-center justify-center transform hover:-translate-y-0.5 shadow-sm"
            >
              <span className="text-xl">🔔</span>
              {announcements.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center animate-pulse shadow-md">
                  {announcements.length}
                </span>
              )}
            </button>

            {userRole === 'student' && (
              <>
                <Link to="/my-registrations" className="bg-white/80 hover:bg-white text-orange-600 border border-white px-5 py-3 rounded-xl font-bold transition-all transform hover:-translate-y-0.5 flex items-center gap-2 shadow-sm">
                  🎫 My Tickets
                </Link>
                 <Link to="/schedule" className="bg-white/80 hover:bg-white text-stone-600 border border-white px-5 py-3 rounded-xl font-bold transition-all transform hover:-translate-y-0.5 flex items-center gap-2 shadow-sm">
                  📅 Itinerary
                </Link>
              </>
            )}
            <Link to="/profile" className="bg-white/80 hover:bg-white text-stone-600 border border-white px-5 py-3 rounded-xl font-bold transition-all transform hover:-translate-y-0.5 flex items-center gap-2 shadow-sm">
              👤 Profile
            </Link>

            {(userRole === 'admin' || userRole === 'volunteer') && (
              <Link to="/admin-scanner" className="bg-white/80 hover:bg-white text-stone-800 px-6 py-3 rounded-xl font-bold shadow-sm border border-white transition-all transform hover:-translate-y-0.5 flex items-center gap-2">
                📷 Scan Tickets
              </Link>
            )}

            {userRole === 'admin' && (
              <>
                <Link to="/analytics" className="bg-white/80 hover:bg-white border border-white text-violet-500 px-6 py-3 rounded-xl font-bold shadow-sm transition-all transform hover:-translate-y-0.5 flex items-center gap-2">
                  📊 Analytics
                </Link>
                <Link to="/admin/broadcast" className="bg-white/80 hover:bg-white border border-white text-rose-500 px-6 py-3 rounded-xl font-bold shadow-sm transition-all transform hover:-translate-y-0.5 flex items-center gap-2">
                  📢 Broadcast
                </Link>
                <Link to="/create-event" className="bg-gradient-to-r from-orange-400 to-rose-400 hover:from-orange-500 hover:to-rose-500 text-white px-6 py-3 rounded-xl font-black shadow-md shadow-rose-500/20 transition-all transform hover:-translate-y-0.5 flex items-center gap-2">
                  + Create Event
                </Link>
              </>
            )}

            <button onClick={handleLogout} className="bg-white/50 hover:bg-rose-50 text-rose-500 border border-white px-5 py-3 rounded-xl font-bold transition-all ml-auto xl:ml-0 shadow-sm">
              Logout
            </button>
          </div>
        </div>

        <div className="bg-white/60 backdrop-blur-xl p-3 rounded-[1.5rem] shadow-xl shadow-rose-900/5 border border-white flex flex-col md:flex-row gap-4 mb-10 items-center justify-between">
          <div className="flex bg-stone-100/50 p-1 rounded-xl w-full md:w-auto">
            <button 
              onClick={() => setActiveTab('upcoming')}
              className={`flex-1 md:flex-none px-6 py-2 rounded-lg text-sm font-black uppercase tracking-widest transition-all ${activeTab === 'upcoming' ? 'bg-white text-orange-500 shadow-sm border border-white' : 'text-stone-400 hover:text-stone-600'}`}
            >
              ⚡ Upcoming
            </button>
            <button 
              onClick={() => setActiveTab('past')}
              className={`flex-1 md:flex-none px-6 py-2 rounded-lg text-sm font-black uppercase tracking-widest transition-all ${activeTab === 'past' ? 'bg-white text-stone-800 shadow-sm border border-white' : 'text-stone-400 hover:text-stone-600'}`}
            >
              📁 Past Events
            </button>
          </div>

          <div className="relative w-full md:w-1/3">
            <span className="absolute left-4 top-3 text-stone-400">🔍</span>
            <input type="text" placeholder="Search events..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-11 pr-4 py-2.5 bg-white/50 border border-white/50 rounded-xl focus:ring-2 focus:ring-orange-400 transition-colors font-medium text-stone-800 placeholder-stone-400 outline-none" />
          </div>
          
          <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 hide-scrollbar">
            {['All', 'College Fest', 'Workshop', 'Hackathon', 'Seminar', 'Sports', 'Cultural'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all duration-300 ${
                  selectedCategory === cat ? 'bg-gradient-to-r from-orange-400 to-rose-400 text-white shadow-md border-transparent' : 'bg-transparent text-stone-500 hover:bg-white hover:text-stone-800 border-transparent'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading ? (
            [...Array(6)].map((_, i) => (
              <div key={i} className="bg-white/60 backdrop-blur-xl p-8 rounded-[2rem] border border-white animate-pulse h-[400px] flex flex-col justify-between shadow-sm">
                <div className="h-full bg-white/40 rounded-xl"></div>
              </div>
            ))
          ) : filteredEvents.length === 0 ? (
            <div className="col-span-full text-center py-20">
              <span className="text-6xl block mb-4 opacity-50">🔭</span>
              <h2 className="text-2xl font-black text-stone-800">No {activeTab} events found in this sector</h2>
              <p className="text-stone-500 font-medium mt-2">Try adjusting your search parameters.</p>
            </div>
          ) : (
            filteredEvents.map((event) => {
              const registeredCount = event.registeredUsers?.length || 0;
              const isSoldOut = registeredCount >= event.seatLimit;
              const isAlreadyRegistered = userId && event.registeredUsers?.includes(userId);
              const isWaitlisted = userId && event.waitlistedUsers?.includes(userId);
              
              const status = getEventStatus(event);
              const isPast = status.label === 'Concluded';

              return (
                <div key={event._id} className={`bg-white/60 backdrop-blur-xl rounded-[2rem] shadow-xl shadow-rose-900/5 hover:shadow-2xl hover:shadow-rose-900/10 transition-all duration-500 transform hover:-translate-y-2 border border-white flex flex-col justify-between relative overflow-hidden group ${isPast ? 'grayscale-[0.4] opacity-90' : ''}`}>
                  
                  <div className="p-7 relative z-10 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                      <span className={`border text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-sm flex items-center gap-1.5 ${status.color}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`}></span>
                        {status.label}
                      </span>
                      {event.allowTeams && (
                        <span className="text-[10px] font-black text-stone-500 bg-white border border-stone-100 px-3 py-1.5 rounded-full flex items-center gap-1 shadow-sm">
                          👥 Max {event.maxTeamSize}
                        </span>
                      )}
                    </div>
                    
                    <h2 className="text-2xl font-black text-stone-800 mt-2 mb-3 group-hover:text-orange-600 transition-colors leading-tight tracking-tight">{event.title}</h2>
                    <p className="text-stone-500 mb-6 line-clamp-3 text-sm font-medium leading-relaxed">{event.description}</p>
                    
                    <div className="bg-white/50 p-4 rounded-2xl border border-white space-y-2.5 mt-auto">
                      <p className="flex items-center text-sm font-bold text-stone-700"><span className="bg-white p-1 rounded-md shadow-sm text-xs mr-3">📍</span> {event.venue}</p>
                      
                      <p className="flex items-center text-sm font-bold text-stone-700">
                        <span className="bg-white p-1 rounded-md shadow-sm text-xs mr-3">🗓️</span> 
                        {formatEventDateTime(event)}
                      </p>
                      
                      <div className="pt-3 mt-3 border-t border-white/50">
                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-1.5">
                          <span className={isSoldOut && !isPast ? 'text-rose-500' : 'text-stone-500'}>Seats Filled</span>
                          <span className="text-stone-500">{registeredCount} / {event.seatLimit}</span>
                        </div>
                        <div className="w-full bg-white/80 rounded-full h-2 overflow-hidden border border-white">
                          <div 
                            className={`h-2 rounded-full ${isPast ? 'bg-stone-400' : isSoldOut ? 'bg-rose-500' : 'bg-gradient-to-r from-orange-400 to-rose-400'}`} 
                            style={{ width: `${Math.min((registeredCount / event.seatLimit) * 100, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-7 pt-0 relative z-10">
                    {userRole === 'admin' || userRole === 'volunteer' ? (
                      <div className="flex gap-3">
                        <Link to={`/admin/event/${event._id}`} className="flex-1 bg-white hover:bg-orange-50 border border-stone-100 text-stone-700 text-center font-bold py-3.5 rounded-xl transition-all shadow-sm transform hover:-translate-y-0.5 text-sm">
                          View Details
                        </Link>
                        {userRole === 'admin' && (
                          <>
                            <Link to={`/admin/edit-event/${event._id}`} className="bg-white hover:bg-orange-50 border border-stone-100 text-stone-600 w-12 flex items-center justify-center rounded-xl transition-all shadow-sm transform hover:-translate-y-0.5" title="Edit Event">✏️</Link>
                            <button onClick={() => handleDelete(event._id)} className="bg-white hover:bg-rose-50 text-rose-500 border border-stone-100 w-12 flex items-center justify-center rounded-xl transition-all shadow-sm transform hover:-translate-y-0.5" title="Delete Event">🗑️</button>
                          </>
                        )}
                      </div>
                    ) : isPast ? (
                      <button disabled className="w-full bg-stone-100 text-stone-400 font-black tracking-wide py-3.5 rounded-xl cursor-not-allowed border border-stone-200 shadow-sm flex items-center justify-center gap-2">
                        🏁 Event Concluded
                      </button>
                    ) : (
                      <div className="space-y-3">
                        {isAlreadyRegistered ? (
                          <>
                            <button disabled className="w-full bg-emerald-50 text-emerald-600 border border-emerald-100 font-black tracking-wide py-3.5 rounded-xl cursor-not-allowed shadow-sm flex items-center justify-center gap-2">
                              ✓ Registered
                            </button>
                            <button onClick={() => handleBookmark(event._id)} className="w-full bg-white/60 hover:bg-white text-stone-600 font-bold py-3 rounded-xl transition-colors border border-white shadow-sm flex items-center justify-center gap-2">
                              🔖 Add to Itinerary
                            </button>
                          </>
                        ) : isWaitlisted ? (
                          <button disabled className="w-full bg-amber-50 text-amber-500 border border-amber-100 font-black tracking-wide py-3.5 rounded-xl cursor-not-allowed flex items-center justify-center gap-2 shadow-sm">
                            ⏳ Waitlisted
                          </button>
                        ) : isSoldOut ? (
                          <button onClick={() => handleRegister(event._id, accommodationRequests[event._id])} className="w-full bg-stone-800 hover:bg-stone-900 text-white font-black py-3.5 rounded-xl transition-all shadow-lg transform hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-2">
                            Join Waitlist
                          </button>
                        ) : event.allowTeams ? (
                          <div className="bg-white/50 p-4 rounded-2xl border border-white space-y-3">
                            <div className="flex gap-2">
                              <button onClick={() => setActiveTeamAction({...activeTeamAction, [event._id]: 'create'})} className={`flex-1 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all border ${activeTeamAction[event._id] === 'create' ? 'bg-gradient-to-r from-orange-400 to-rose-400 text-white shadow-md border-transparent' : 'bg-white text-stone-500 border-white hover:bg-orange-50'}`}>👑 Create Team</button>
                              <button onClick={() => setActiveTeamAction({...activeTeamAction, [event._id]: 'join'})} className={`flex-1 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all border ${activeTeamAction[event._id] === 'join' ? 'bg-stone-800 text-white shadow-md border-transparent' : 'bg-white text-stone-500 border-white hover:bg-orange-50'}`}>🤝 Join Team</button>
                            </div>
                            {activeTeamAction[event._id] === 'create' && (
                              <div className="flex gap-2">
                                <input type="text" placeholder="Enter Team Name..." className="flex-1 px-4 py-2 text-sm font-medium bg-white/60 border border-white rounded-xl focus:ring-2 focus:ring-orange-400 outline-none text-stone-800 placeholder-stone-400" value={teamInput[event._id] || ''} onChange={(e) => setTeamInput({...teamInput, [event._id]: e.target.value})} />
                                <button onClick={() => handleCreateTeam(event._id)} className="bg-gradient-to-r from-orange-400 to-rose-400 hover:from-orange-500 hover:to-rose-500 text-white px-4 py-2 rounded-xl text-sm font-black transition-all shadow-md shadow-rose-500/20">Submit</button>
                              </div>
                            )}
                            {activeTeamAction[event._id] === 'join' && (
                              <div className="flex gap-2">
                                <input type="text" placeholder="Enter 6-Digit Code..." className="flex-1 px-4 py-2 text-sm font-bold tracking-widest bg-white/60 border border-white rounded-xl focus:ring-2 focus:ring-stone-800 uppercase outline-none text-stone-800 placeholder-stone-400" value={teamInput[event._id] || ''} onChange={(e) => setTeamInput({...teamInput, [event._id]: e.target.value})} />
                                <button onClick={() => handleJoinTeam(event._id)} className="bg-stone-800 hover:bg-stone-900 text-white px-4 py-2 rounded-xl text-sm font-black transition-all shadow-md">Join</button>
                              </div>
                            )}
                          </div>
                        ) : (
                          <>
                            {event.offersAccommodation && (
                              <div className="flex items-center gap-3 p-3 bg-white/50 rounded-xl border border-white mb-3">
                                <div className="relative flex items-center">
                                  <input type="checkbox" id={`acc-${event._id}`} checked={!!accommodationRequests[event._id]} onChange={(e) => setAccommodationRequests({...accommodationRequests, [event._id]: e.target.checked})} className="peer w-5 h-5 bg-white border border-stone-200 rounded-md cursor-pointer accent-orange-500" />
                                </div>
                                <label htmlFor={`acc-${event._id}`} className="text-[10px] font-black uppercase tracking-widest text-stone-600 cursor-pointer flex-1">Request Hostel Stay</label>
                              </div>
                            )}
                            <button onClick={() => handleRegister(event._id, accommodationRequests[event._id])} className="w-full bg-gradient-to-r from-orange-400 to-rose-400 hover:from-orange-500 hover:to-rose-500 text-white font-black py-3.5 rounded-xl transition-all shadow-lg shadow-rose-500/25 transform hover:-translate-y-0.5 active:scale-95">Register</button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {showNotificationModal && (
        <div className="fixed inset-0 bg-stone-900/20 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white/90 backdrop-blur-2xl rounded-[2.5rem] max-w-lg w-full p-8 shadow-2xl border border-white transform transition-all">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-black text-2xl text-stone-800 flex items-center gap-3 tracking-tight">
                <span className="bg-white border border-stone-100 p-2 rounded-xl text-xl shadow-sm">📢</span> Updates Feed
              </h3>
              <button onClick={() => setShowNotificationModal(false)} className="text-stone-400 hover:text-stone-800 bg-white hover:bg-stone-50 border border-stone-100 w-10 h-10 rounded-full flex items-center justify-center font-bold text-xl transition-colors shadow-sm">×</button>
            </div>
            
            <div className="space-y-4 max-h-[60vh] overflow-y-auto hide-scrollbar pr-2">
              {announcements.length === 0 ? (
                <div className="text-center py-10 bg-white/50 rounded-2xl border border-white">
                  <span className="text-4xl block mb-3 opacity-50">📭</span>
                  <p className="text-stone-500 font-bold">No announcements yet.</p>
                </div>
              ) : (
                announcements.map((item, idx) => (
                  <div key={idx} className="bg-white/60 border border-white border-l-4 border-l-orange-400 p-5 rounded-2xl relative overflow-hidden shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-black text-stone-800 text-lg leading-tight">{item.title}</h4>
                      <span className="text-[9px] font-black uppercase tracking-widest text-orange-500 bg-orange-50 px-2 py-1 rounded-md border border-orange-100 whitespace-nowrap ml-2">{item.time}</span>
                    </div>
                    <p className="text-sm font-medium text-stone-600">{item.message}</p>
                  </div>
                ))
              )}
            </div>

            <div className="mt-8">
              <button onClick={() => setShowNotificationModal(false)} className="w-full bg-stone-800 hover:bg-stone-900 text-white py-3.5 rounded-xl font-bold shadow-md transition-all active:scale-95">
                Close Panel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;