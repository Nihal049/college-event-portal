import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

const AdminEventDetails = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Fetch the role to determine what buttons to show
  const userRole = localStorage.getItem('role');

  useEffect(() => {
    const fetchDetails = async () => {
      const token = localStorage.getItem('token');
      try {
        const response = await fetch(`https://college-event-portal-a0d1.onrender.com/api/events/${id}/admin-details`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (response.ok) setEvent(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching details', error);
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  // CSV Export Function
  const handleExportCSV = () => {
    if (!event) return;

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Name,Email,Roll Number,Status\n";

    // Combine and label registrations & check-ins
    const registeredIds = new Set(event.registeredUsers?.map(u => u._id) || []);
    const checkedInIds = new Set(event.checkedInUsers?.map(u => u._id) || []);

    // Create a master list of unique users
    const allUsersMap = new Map();
    event.registeredUsers?.forEach(u => allUsersMap.set(u._id, u));
    event.checkedInUsers?.forEach(u => allUsersMap.set(u._id, u));

    allUsersMap.forEach((user) => {
      const name = `"${user.name || 'N/A'}"`;
      const email = `"${user.email || 'N/A'}"`;
      const rollNumber = `"${(user.rollNumber || 'N/A').toUpperCase()}"`;
      const status = checkedInIds.has(user._id) ? "Checked-In" : "Registered Only";

      csvContent += `${name},${email},${rollNumber},${status}\n`;
    });

    // Trigger browser file download
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${event.title.replace(/\s+/g, '_')}_Attendance.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#fff8f6]">
      <div className="w-16 h-16 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin mb-4"></div>
      <p className="text-orange-500 font-black tracking-widest uppercase text-sm animate-pulse shadow-sm">Fetching Secure Data...</p>
    </div>
  );

  if (!event) return (
    <div className="min-h-screen flex items-center justify-center bg-[#fff8f6] text-rose-500 font-black text-2xl tracking-widest uppercase">
      Event Data Not Found
    </div>
  );

  const sortedRegistered = [...(event.registeredUsers || [])].sort((a, b) => {
    const rollA = (a.rollNumber || '').toUpperCase();
    const rollB = (b.rollNumber || '').toUpperCase();
    return rollA.localeCompare(rollB);
  });

  const sortedCheckedIn = [...(event.checkedInUsers || [])].sort((a, b) => {
    const rollA = (a.rollNumber || '').toUpperCase();
    const rollB = (b.rollNumber || '').toUpperCase();
    return rollA.localeCompare(rollB);
  });

  return (
    <div className="min-h-screen bg-[#fff8f6] py-12 px-4 sm:px-6 lg:px-8 font-sans relative overflow-hidden text-stone-800 selection:bg-orange-500/20">
      
      {/* --- AURORA AMBIENT BACKGROUND BLOBS --- */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-rose-300/40 rounded-full blur-[100px] pointer-events-none mix-blend-multiply"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-orange-300/40 rounded-full blur-[100px] pointer-events-none mix-blend-multiply"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* --- AURORA HEADER --- */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-10 gap-6 bg-white/60 backdrop-blur-xl p-6 md:p-8 rounded-[2rem] shadow-xl shadow-rose-900/5 border border-white">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-stone-800 pb-1 tracking-tight">
              {event.title}
            </h1>
            <p className="text-orange-600 font-black uppercase tracking-widest text-[10px] mt-1 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse"></span>
              Live Attendance Intelligence
            </p>
          </div>
          
          <div className="flex flex-wrap gap-3 w-full lg:w-auto">
            {/* Both Admins and Volunteers can see the scanner link */}
            {(userRole === 'admin' || userRole === 'volunteer') && (
              <Link to="/admin-scanner" className="flex-1 lg:flex-none bg-white/80 hover:bg-white text-stone-800 px-5 py-2.5 rounded-xl font-black text-sm uppercase tracking-wider transition-all shadow-sm border border-stone-100 transform hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-2">
                📷 Scanner
              </Link>
            )}

            {/* ONLY Admins can export the full user list data */}
            {userRole === 'admin' && (
              <button
                onClick={handleExportCSV}
                className="flex-1 lg:flex-none bg-gradient-to-r from-orange-400 to-rose-400 hover:from-orange-500 hover:to-rose-500 text-white px-5 py-2.5 rounded-xl font-black text-sm uppercase tracking-wider transition-all shadow-md shadow-rose-500/20 transform hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-2"
              >
                📥 Export CSV
              </button>
            )}

            <Link to="/dashboard" className="flex-1 lg:flex-none text-center bg-white/40 hover:bg-white text-stone-600 border border-white px-5 py-2.5 rounded-xl font-bold transition-all duration-300 transform hover:-translate-y-0.5 active:scale-95 shadow-sm backdrop-blur-md">
              Back
            </Link>
          </div>
        </div>

        {/* --- AURORA STATS ROW --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
          <div className="bg-white/60 backdrop-blur-xl p-8 rounded-[2rem] border border-white shadow-xl shadow-rose-900/5 text-center hover:shadow-2xl hover:shadow-rose-900/10 transition-all relative overflow-hidden">
            <h3 className="text-xs font-black text-stone-500 uppercase tracking-widest mb-2 relative z-10">Total Registered</h3>
            <p className="text-5xl font-black text-orange-500 relative z-10">{sortedRegistered.length}</p>
          </div>
          
          <div className="bg-white/60 backdrop-blur-xl p-8 rounded-[2rem] border border-white shadow-xl shadow-rose-900/5 text-center hover:shadow-2xl hover:shadow-rose-900/10 transition-all relative overflow-hidden">
            <h3 className="text-xs font-black text-stone-500 uppercase tracking-widest mb-2 relative z-10">Verified Checked-In</h3>
            <p className="text-5xl font-black text-rose-500 relative z-10">{sortedCheckedIn.length}</p>
          </div>
        </div>

        {/* --- DATA TABLES --- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          
          {/* Registered Users List */}
          <div className="bg-white/60 backdrop-blur-xl rounded-[2rem] border border-white shadow-xl shadow-rose-900/5 overflow-hidden flex flex-col h-[500px]">
            <div className="bg-white/80 px-6 py-4 border-b border-white shadow-sm">
              <h2 className="font-black text-stone-800 text-center uppercase tracking-widest text-sm">All Registered Students</h2>
            </div>
            <ul className="divide-y divide-stone-100/50 overflow-y-auto hide-scrollbar flex-1 p-2">
              {sortedRegistered.map(user => (
                <li key={user._id} className="px-4 py-4 flex justify-between items-center hover:bg-white rounded-xl transition-colors mx-2 my-1">
                  <div>
                    <p className="font-bold text-stone-800">{user.name}</p>
                    <p className="text-xs font-medium text-stone-500">{user.email}</p>
                  </div>
                  <span className="text-[10px] font-black text-stone-600 bg-white border border-stone-100 px-3 py-1.5 rounded-lg uppercase tracking-wider shadow-sm">
                    {user.rollNumber || 'N/A'}
                  </span>
                </li>
              ))}
              {sortedRegistered.length === 0 && (
                <li className="px-6 py-10 text-stone-400 text-center font-bold uppercase tracking-widest text-xs">No registrations yet.</li>
              )}
            </ul>
          </div>

          {/* Checked-In Users List (Roll Numbers Only) */}
          <div className="bg-white/60 backdrop-blur-xl rounded-[2rem] border border-white shadow-xl shadow-rose-900/5 overflow-hidden flex flex-col h-[500px]">
            <div className="bg-white/80 px-6 py-4 border-b border-white shadow-sm">
              <h2 className="font-black text-orange-600 text-center uppercase tracking-widest text-sm">Verified Scans</h2>
            </div>
            <ul className="divide-y divide-stone-100/50 overflow-y-auto hide-scrollbar flex-1 p-2">
              {sortedCheckedIn.map(user => (
                <li key={user._id} className="px-6 py-5 flex justify-center items-center hover:bg-orange-50/50 rounded-xl transition-colors mx-2 my-1 border border-transparent hover:border-orange-100/50">
                  <span className="text-2xl font-black text-orange-500 tracking-widest uppercase">
                    {user.rollNumber || '⚠️ NOT SET'}
                  </span>
                </li>
              ))}
              {sortedCheckedIn.length === 0 && (
                <li className="px-6 py-10 text-stone-400 text-center font-bold uppercase tracking-widest text-xs">No check-ins yet.</li>
              )}
            </ul>
          </div>

          {/* Hostel Accommodation Section */}
          {event.offersAccommodation && (
            <div className="bg-white/60 backdrop-blur-xl rounded-[2rem] border border-white shadow-xl shadow-rose-900/5 overflow-hidden lg:col-span-2">
              <div className="bg-white/80 px-6 py-4 border-b border-white flex flex-col sm:flex-row justify-between items-center gap-3 shadow-sm">
                <h2 className="font-black text-stone-800 uppercase tracking-widest text-sm">Hostel Requests</h2>
                <span className="bg-rose-50 border border-rose-100 text-rose-600 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-sm">
                  {event.accommodationRequests?.length || 0} Rooms Needed
                </span>
              </div>
              <ul className="divide-y divide-stone-100/50 max-h-96 overflow-y-auto hide-scrollbar p-2">
                {event.accommodationRequests?.map(request => (
                  <li key={request._id} className="px-4 py-5 flex flex-col sm:flex-row justify-between items-center hover:bg-white rounded-xl transition-colors mx-2 my-1 gap-4">
                    <div className="text-center sm:text-left">
                      <p className="font-bold text-stone-800">{request.student?.name}</p>
                      <p className="text-xs font-medium text-stone-500">{request.student?.email}</p>
                      <span className="inline-block mt-2 text-[10px] font-black text-stone-600 bg-stone-50 px-2.5 py-1 rounded-lg uppercase tracking-widest border border-stone-200">
                        {request.student?.rollNumber || 'N/A'}
                      </span>
                    </div>
                    
                    {/* Room Assignment UI */}
                    <div className="flex items-center gap-3">
                      {request.status === 'Approved' ? (
                        <div className="text-center sm:text-right bg-rose-50 border border-rose-100 px-4 py-2 rounded-xl shadow-sm">
                          <span className="block text-[10px] font-black text-rose-400 uppercase tracking-widest">Assigned</span>
                          <span className="text-xl font-black text-rose-600">{request.assignedRoom}</span>
                        </div>
                      ) : (
                        <form 
                          onSubmit={async (e) => {
                            e.preventDefault();
                            const roomInput = e.target.roomNumber.value;
                            const token = localStorage.getItem('token');
                            try {
                              const res = await fetch(`https://college-event-portal-a0d1.onrender.com/api/events/${event._id}/assign-room`, {
                                method: 'PUT',
                                headers: {
                                  'Content-Type': 'application/json',
                                  'Authorization': `Bearer ${token}`
                                },
                                body: JSON.stringify({ requestId: request._id, roomNumber: roomInput })
                              });
                              if (res.ok) {
                                const updatedEvent = await res.json();
                                setEvent(updatedEvent); // instantly updates UI
                              }
                            } catch (err) {
                              alert("Error assigning room");
                            }
                          }}
                          className="flex gap-2"
                        >
                          <input 
                            type="text" 
                            name="roomNumber" 
                            placeholder="e.g. A-101" 
                            required
                            className="w-28 px-3 py-2 bg-white/50 border border-white rounded-xl focus:ring-2 focus:ring-rose-400 focus:border-transparent text-stone-800 font-bold uppercase placeholder-stone-400 outline-none text-center sm:text-left"
                          />
                          <button 
                            type="submit"
                            className="bg-gradient-to-r from-orange-400 to-rose-400 hover:from-orange-500 hover:to-rose-500 text-white text-xs font-black uppercase tracking-wider px-4 py-2 rounded-xl transition-all shadow-md shadow-rose-500/20 active:scale-95"
                          >
                            Assign
                          </button>
                        </form>
                      )}
                    </div>
                  </li>
                ))}
                {(!event.accommodationRequests || event.accommodationRequests.length === 0) && (
                  <li className="px-6 py-10 text-stone-400 text-center font-bold uppercase tracking-widest text-xs">No accommodation requests.</li>
                )}
              </ul>
            </div>
          )}
        </div>

        {/* --- ADMIN REGISTERED TEAMS --- */}
        {event.allowTeams && (
          <div className="bg-white/60 backdrop-blur-2xl rounded-[2rem] border border-white shadow-xl shadow-rose-900/5 overflow-hidden mt-8">
            <div className="bg-white/80 px-6 py-5 border-b border-white flex flex-col sm:flex-row justify-between items-center gap-3 shadow-sm">
              <h2 className="font-black text-stone-800 uppercase tracking-widest text-sm flex items-center gap-2">
                👥 Registered Teams
              </h2>
              <span className="bg-orange-50 border border-orange-100 text-orange-600 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-sm">
                {event.teams?.length || 0} Teams Active
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0 divide-y md:divide-y-0 md:divide-x divide-stone-100/50">
              {event.teams?.map(team => (
                <div key={team._id} className="p-6 hover:bg-white transition-colors border-b md:border-b-0 border-stone-100/50 relative overflow-hidden group">
                  
                  <div className="flex justify-between items-start mb-5 relative z-10">
                    <h3 className="font-black text-2xl text-stone-800 tracking-tight">{team.name}</h3>
                    <div className="text-center bg-white border border-stone-100 px-3 py-1.5 rounded-xl shadow-sm">
                      <span className="block text-[8px] text-stone-400 uppercase font-black tracking-widest mb-0.5">Code</span>
                      <span className="text-sm font-mono font-black text-rose-500 leading-none">{team.inviteCode}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-4 relative z-10">
                    <div className="bg-white/80 p-4 rounded-2xl border border-white shadow-sm">
                      <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest mb-1">👑 Captain</p>
                      <p className="font-bold text-stone-800 text-sm">{team.captain?.name}</p>
                      <p className="text-[10px] font-bold text-stone-400 mt-1 uppercase tracking-wider">{team.captain?.rollNumber || 'N/A'}</p>
                    </div>

                    <div className="p-2">
                      <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-3">Roster ({team.members?.length || 0})</p>
                      {team.members?.length > 0 ? (
                        <ul className="space-y-2">
                          {team.members.map(member => (
                            <li key={member._id} className="flex justify-between items-center text-sm border-b border-stone-50 pb-2 last:border-0">
                              <span className="text-stone-600 font-medium">{member.name}</span>
                              <span className="text-[10px] font-black text-stone-400 bg-stone-50 px-2 py-1 rounded uppercase tracking-wider">{member.rollNumber || 'N/A'}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-xs text-stone-400 font-bold uppercase tracking-widest">No members joined.</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {(!event.teams || event.teams.length === 0) && (
                <div className="p-10 text-center col-span-full">
                  <p className="text-stone-400 font-bold uppercase tracking-widest text-xs">No teams have been created for this event yet.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminEventDetails;