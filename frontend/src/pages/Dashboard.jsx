import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { io } from 'socket.io-client';

const Dashboard = () => {
  const [events, setEvents] = useState([]);
  const [userRole, setUserRole] = useState('');
  const [userId, setUserId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
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

    const socket = io('https://college-event-portal-a0d1.onrender.com');

    socket.on('receive-announcement', (data) => {
      setAnnouncements((prev) => {
        const updatedList = [data, ...prev];
        localStorage.setItem('liveAnnouncements', JSON.stringify(updatedList));
        return updatedList;
      });
      
      setLatestAlert(data); 
      
      setTimeout(() => {
        setLatestAlert(null);
      }, 8000);
    });

    return () => socket.disconnect();
  }, []);

  const handleRegister = async (eventId, requestAccommodation = false) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`https://college-event-portal-a0d1.onrender.com/api/events/${eventId}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ requestAccommodation })
      });

      const data = await response.json();

      if (response.ok) {
        alert(`🎉 ${data.message}`);
        fetchEvents();
      } else {
        alert(`❌ ${data.message}`); 
      }
    } catch (error) {
      alert('❌ Cannot connect to server.');
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
      if (response.ok) {
        alert(`🔖 ${data.message}`);
      }
    } catch (error) {
      alert('❌ Cannot connect to server.');
    }
  };

  const handleCreateTeam = async (eventId) => {
    const token = localStorage.getItem('token');
    const teamName = teamInput[eventId];

    if (!teamName) return alert("Please enter a team name!");

    try {
      const response = await fetch(`https://college-event-portal-a0d1.onrender.com/api/events/${eventId}/team`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ teamName })
      });

      const data = await response.json();

      if (response.ok) {
        alert(`🎉 ${data.message}\n\nMake sure to share your Invite Code with your teammates!`);
        fetchEvents();
      } else {
        alert(`❌ ${data.message}`); 
      }
    } catch (error) {
      alert('❌ Cannot connect to server.');
    }
  };

  const handleJoinTeam = async (eventId) => {
    const token = localStorage.getItem('token');
    const inviteCode = teamInput[eventId];

    if (!inviteCode) return alert("Please enter the invite code!");

    try {
      const response = await fetch(`https://college-event-portal-a0d1.onrender.com/api/events/${eventId}/team/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ inviteCode })
      });

      const data = await response.json();

      if (response.ok) {
        alert(`🎉 ${data.message}`);
        fetchEvents();
      } else {
        alert(`❌ ${data.message}`); 
      }
    } catch (error) {
      alert('❌ Cannot connect to server.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/login');
  };

  const handleDelete = async (eventId) => {
    if (!window.confirm("Are you sure you want to delete this event? This action cannot be undone.")) return;
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`https://college-event-portal-a0d1.onrender.com/api/events/${eventId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setEvents(events.filter(event => event._id !== eventId));
      } else {
        const data = await response.json();
        alert(`❌ ${data.message}`);
      }
    } catch (error) {
      alert('❌ Cannot connect to server.');
    }
  };

  const filteredEvents = events.filter((event) => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          event.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || event.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6 sm:p-10 relative">
      
      {/* --- LIVE BROADCAST BANNER POPUP --- */}
      {latestAlert && (
        <div className="fixed top-5 right-5 z-50 max-w-md bg-red-600 text-white p-4 rounded-xl shadow-2xl border-2 border-white animate-bounce flex items-start gap-3">
          <span className="text-2xl">🚨</span>
          <div className="flex-1">
            <div className="flex justify-between items-center">
              <h4 className="font-black uppercase tracking-wide text-sm">Live Announcement!</h4>
              <span className="text-[10px] bg-red-800 px-2 py-0.5 rounded text-red-100">{latestAlert.time}</span>
            </div>
            <p className="font-bold text-base mt-1">{latestAlert.title}</p>
            <p className="text-sm text-red-100 mt-0.5">{latestAlert.message}</p>
          </div>
          <button onClick={() => setLatestAlert(null)} className="text-red-200 hover:text-white font-bold text-lg">×</button>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-extrabold text-gray-900">Event Dashboard</h1>
            
            <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide ${userRole === 'admin' ? 'bg-purple-100 text-purple-700' : userRole === 'volunteer' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
              {userRole === 'admin' ? 'Admin Portal' : userRole === 'volunteer' ? 'Volunteer Portal' : 'Student Portal'}
            </span>
          </div>
          
          <div className="flex gap-4 items-center">
            
            {/* Notification Bell Button */}
            <button 
              onClick={() => setShowNotificationModal(true)}
              className="relative bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 p-2.5 rounded-lg transition-colors flex items-center justify-center shadow-sm"
              title="View Announcements"
            >
              🔔
              {announcements.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center animate-pulse">
                  {announcements.length}
                </span>
              )}
            </button>

            {userRole === 'student' && (
              <>
                <Link to="/my-registrations" className="text-blue-600 hover:text-blue-800 font-medium transition-colors">
                   My Registrations
                </Link>
                 <Link to="/schedule" className="text-purple-600 hover:text-purple-800 font-medium transition-colors ml-4">
                   My Itinerary 📅
                </Link>
              </>
            )}
            <Link to="/profile" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
              Profile
            </Link>

            {(userRole === 'admin' || userRole === 'volunteer') && (
              <Link to="/admin-scanner" className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg font-medium transition-colors flex items-center gap-2">
                📷 Scan Tickets
              </Link>
            )}

            {userRole === 'admin' && (
              <>
                <Link to="/admin/broadcast" className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                  📢 Broadcast
                </Link>
                <Link to="/create-event" className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-medium transition-colors">
                  + Create Event
                </Link>
              </>
            )}

            <button onClick={handleLogout} className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-5 py-2 rounded-lg font-medium transition-colors">
              Logout
            </button>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-8 items-center justify-between">
          <input
            type="text"
            placeholder="Search events by title or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-96 px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white"
          />
          <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
            {['All', 'College Fest', 'Workshop', 'Hackathon', 'Seminar', 'Sports', 'Cultural'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === cat ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
        
        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            [...Array(6)].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 animate-pulse h-[350px] flex flex-col justify-between">
                <div className="h-full bg-gray-100 rounded-lg"></div>
              </div>
            ))
          ) : filteredEvents.length === 0 ? (
            <p className="text-gray-500">No events found matching your search.</p>
          ) : (
            filteredEvents.map((event) => {
              const registeredCount = event.registeredUsers?.length || 0;
              const isSoldOut = registeredCount >= event.seatLimit;
              
              const isAlreadyRegistered = userId && event.registeredUsers?.includes(userId);
              const isWaitlisted = userId && event.waitlistedUsers?.includes(userId);

              return (
                <div key={event._id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-wide">
                        {event.category}
                      </span>
                      {event.allowTeams && (
                        <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md">
                          👥 Teams up to {event.maxTeamSize}
                        </span>
                      )}
                    </div>
                    
                    <h2 className="text-xl font-bold mt-4 mb-2 text-gray-900">{event.title}</h2>
                    <p className="text-gray-600 mb-5 line-clamp-3 text-sm">{event.description}</p>
                    
                    <div className="text-sm text-gray-500 space-y-2 mb-6">
                      <p className="flex items-center"><span className="mr-2">📍</span> {event.venue}</p>
                      <p className="flex items-center"><span className="mr-2">📅</span> {new Date(event.date).toLocaleDateString()}</p>
                      {/* NEW: Time and Day Display */}
                      <p className="flex items-center"><span className="mr-2">⏰</span> {event.festDay || 'Day 1'} • {event.startTime || 'TBA'} - {event.endTime || 'TBA'}</p>
                      <p className={`flex items-center font-bold ${isSoldOut ? 'text-red-600' : 'text-green-600'}`}>
                        <span className="mr-2">🎟️</span> {registeredCount} / {event.seatLimit} Seats Filled
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    {userRole === 'admin' || userRole === 'volunteer' ? (
                      <div className="flex gap-2 mt-2">
                        <Link to={`/admin/event/${event._id}`} className="flex-1 bg-gray-800 hover:bg-gray-900 text-white text-center font-medium py-2.5 rounded-lg transition-colors text-sm flex items-center justify-center">Details</Link>
                        
                        {userRole === 'admin' && (
                          <>
                            <Link to={`/admin/edit-event/${event._id}`} className="bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200 px-3 py-2.5 rounded-lg transition-colors text-lg flex items-center justify-center" title="Edit Event">✏️</Link>
                            <button onClick={() => handleDelete(event._id)} className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-3 py-2.5 rounded-lg transition-colors text-lg flex items-center justify-center" title="Delete Event">🗑️</button>
                          </>
                        )}
                      </div>
                    ) : (
                      // Student View
                      <div className="space-y-3 mt-2">

                        {isAlreadyRegistered ? (
                          <>
                            <button disabled className="w-full bg-green-50 text-green-700 border border-green-200 font-bold py-2.5 rounded-lg cursor-not-allowed">
                              ✅ Successfully Registered
                            </button>
                            {/* Bookmark Button MOVED here so it only shows if registered */}
                            <button 
                              onClick={() => handleBookmark(event._id)}
                              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-2 rounded-lg transition-colors border border-gray-300"
                            >
                              🔖 Add to Itinerary
                            </button>
                          </>
                        ) : isWaitlisted ? (
                          <button disabled className="w-full bg-yellow-50 text-yellow-700 border border-yellow-200 font-bold py-2.5 rounded-lg cursor-not-allowed">
                            ⏳ On Waitlist
                          </button>
                        ) : isSoldOut ? (
                          <button 
                            onClick={() => handleRegister(event._id, accommodationRequests[event._id])}
                            className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-2.5 rounded-lg transition-colors"
                          >
                            Join Waitlist
                          </button>
                        ) : event.allowTeams ? (
                          
                          <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 space-y-3">
                            <div className="flex gap-2">
                              <button 
                                onClick={() => setActiveTeamAction({...activeTeamAction, [event._id]: 'create'})}
                                className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-colors ${activeTeamAction[event._id] === 'create' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 border border-gray-300'}`}
                              >
                                👑 Create Team
                              </button>
                              <button 
                                onClick={() => setActiveTeamAction({...activeTeamAction, [event._id]: 'join'})}
                                className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-colors ${activeTeamAction[event._id] === 'join' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-300'}`}
                              >
                                🤝 Join Team
                              </button>
                            </div>

                            {activeTeamAction[event._id] === 'create' && (
                              <div className="flex gap-2">
                                <input 
                                  type="text" 
                                  placeholder="Enter Team Name..."
                                  className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                  value={teamInput[event._id] || ''}
                                  onChange={(e) => setTeamInput({...teamInput, [event._id]: e.target.value})}
                                />
                                <button onClick={() => handleCreateTeam(event._id)} className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-md text-sm font-bold">
                                  Submit
                                </button>
                              </div>
                            )}

                            {activeTeamAction[event._id] === 'join' && (
                              <div className="flex gap-2">
                                <input 
                                  type="text" 
                                  placeholder="Enter 6-Digit Code..."
                                  className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 uppercase"
                                  value={teamInput[event._id] || ''}
                                  onChange={(e) => setTeamInput({...teamInput, [event._id]: e.target.value})}
                                />
                                <button onClick={() => handleJoinTeam(event._id)} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-md text-sm font-bold">
                                  Join
                                </button>
                              </div>
                            )}
                          </div>

                        ) : (
                          <>
                            {event.offersAccommodation && (
                              <div className="flex items-center gap-2 p-2 bg-purple-50 rounded-lg border border-purple-100">
                                <input
                                  type="checkbox"
                                  id={`acc-${event._id}`}
                                  checked={!!accommodationRequests[event._id]}
                                  onChange={(e) => setAccommodationRequests({
                                    ...accommodationRequests,
                                    [event._id]: e.target.checked
                                  })}
                                  className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500 border-gray-300"
                                />
                                <label htmlFor={`acc-${event._id}`} className="text-xs font-medium text-purple-900 cursor-pointer">
                                  Request Overnight Accommodation
                                </label>
                              </div>
                            )}
                            <button 
                              onClick={() => handleRegister(event._id, accommodationRequests[event._id])}
                              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition-colors"
                            >
                              Register for Event
                            </button>
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
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-100">
            <div className="flex justify-between items-center mb-4 border-b pb-3">
              <h3 className="font-extrabold text-xl text-gray-900 flex items-center gap-2">📢 Live Announcements Feed</h3>
              <button onClick={() => setShowNotificationModal(false)} className="text-gray-400 hover:text-gray-600 font-bold text-xl">×</button>
            </div>
            
            <div className="space-y-3 max-h-[60vh] overflow-y-auto">
              {announcements.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No live announcements at the moment. You're all caught up!</p>
              ) : (
                announcements.map((item, idx) => (
                  <div key={idx} className="bg-blue-50 border border-blue-100 p-4 rounded-xl">
                    <div className="flex justify-between items-center mb-1">
                      <h4 className="font-bold text-blue-900">{item.title}</h4>
                      <span className="text-xs text-blue-500 font-medium">{item.time}</span>
                    </div>
                    <p className="text-sm text-gray-700">{item.message}</p>
                  </div>
                ))
              )}
            </div>

            <div className="mt-6 text-right">
              <button onClick={() => setShowNotificationModal(false)} className="bg-gray-800 hover:bg-gray-900 text-white px-5 py-2 rounded-lg text-sm font-medium">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Dashboard;