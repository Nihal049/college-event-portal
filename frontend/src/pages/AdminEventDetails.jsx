import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

const AdminEventDetails = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // NEW: Fetch the role to determine what buttons to show
  const userRole = localStorage.getItem('role');

  useEffect(() => {
    const fetchDetails = async () => {
      const token = localStorage.getItem('token');
      try {
        const response = await fetch(`http://localhost:5000/api/events/${id}/admin-details`, {
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

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!event) return <div className="min-h-screen flex items-center justify-center">Event not found.</div>;

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
    <div className="min-h-screen bg-gray-50 p-6 sm:p-10">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">{event.title}</h1>
            <p className="text-gray-500 mt-1">Attendance Dashboard</p>
          </div>
          <div className="flex gap-3">
            
            {/* NEW: Both Admins and Volunteers can see the scanner link */}
            {(userRole === 'admin' || userRole === 'volunteer') && (
              <Link to="/admin-scanner" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 shadow-sm">
                📷 Open Scanner
              </Link>
            )}

            {/* NEW: ONLY Admins can export the full user list data */}
            {userRole === 'admin' && (
              <button
                onClick={handleExportCSV}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 shadow-sm"
              >
                📥 Download Roster (CSV)
              </button>
            )}

            <Link to="/dashboard" className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors">
              Back to Dashboard
            </Link>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm text-center">
            <h3 className="text-lg font-bold text-gray-700">Total Registered</h3>
            <p className="text-4xl font-extrabold text-blue-600 mt-2">{sortedRegistered.length}</p>
          </div>
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm text-center">
            <h3 className="text-lg font-bold text-gray-700">Successfully Checked-In</h3>
            <p className="text-4xl font-extrabold text-green-600 mt-2">{sortedCheckedIn.length}</p>
          </div>
        </div>

        {/* Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          
          {/* Registered Users List */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="bg-gray-100 px-6 py-4 border-b border-gray-200">
              <h2 className="font-bold text-gray-800 text-center">All Registered Students</h2>
            </div>
            <ul className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
              {sortedRegistered.map(user => (
                <li key={user._id} className="px-6 py-4 flex justify-between items-center hover:bg-gray-50">
                  <div>
                    <p className="font-medium text-gray-900">{user.name}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                  <span className="text-sm font-bold text-gray-700 bg-gray-200 px-3 py-1 rounded uppercase">
                    {user.rollNumber || 'N/A'}
                  </span>
                </li>
              ))}
              {sortedRegistered.length === 0 && (
                <li className="px-6 py-4 text-gray-500 text-center">No registrations yet.</li>
              )}
            </ul>
          </div>

          {/* Checked-In Users List (Roll Numbers Only) */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="bg-green-50 px-6 py-4 border-b border-green-100">
              <h2 className="font-bold text-green-800 text-center">Checked-In Roll Numbers</h2>
            </div>
            <ul className="divide-y divide-green-100 max-h-96 overflow-y-auto bg-white">
              {sortedCheckedIn.map(user => (
                <li key={user._id} className="px-6 py-4 flex justify-center items-center hover:bg-green-50 transition-colors">
                  <span className="text-2xl font-black text-green-700 tracking-widest uppercase">
                    {user.rollNumber || '⚠️ NOT SET'}
                  </span>
                </li>
              ))}
              {sortedCheckedIn.length === 0 && (
                <li className="px-6 py-4 text-gray-500 text-center">No check-ins yet.</li>
              )}
            </ul>
          </div>

          {/* Hostel Accommodation Section */}
          {event.offersAccommodation && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="bg-purple-50 px-6 py-4 border-b border-purple-100 flex justify-between items-center">
                <h2 className="font-bold text-purple-900">Hostel Accommodation Requests</h2>
                <span className="bg-purple-200 text-purple-800 text-xs font-bold px-3 py-1 rounded-full">
                  {event.accommodationRequests?.length || 0} Rooms Needed
                </span>
              </div>
              <ul className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
                {event.accommodationRequests?.map(request => (
                  <li key={request._id} className="px-6 py-4 flex flex-col sm:flex-row justify-between items-center hover:bg-purple-50 gap-4">
                    <div>
                      <p className="font-medium text-gray-900">{request.student?.name}</p>
                      <p className="text-sm text-gray-500">{request.student?.email}</p>
                      <span className="inline-block mt-1 text-xs font-bold text-gray-600 bg-gray-200 px-2 py-1 rounded uppercase">
                        {request.student?.rollNumber || 'N/A'}
                      </span>
                    </div>
                    
                    {/* Room Assignment UI */}
                    <div className="flex items-center gap-3">
                      {request.status === 'Approved' ? (
                        <div className="text-right">
                          <span className="block text-xs text-gray-500 uppercase tracking-wider">Assigned Room</span>
                          <span className="text-xl font-black text-purple-700">{request.assignedRoom}</span>
                        </div>
                      ) : (
                        <form 
                          onSubmit={async (e) => {
                            e.preventDefault();
                            const roomInput = e.target.roomNumber.value;
                            const token = localStorage.getItem('token');
                            try {
                              const res = await fetch(`http://localhost:5000/api/events/${event._id}/assign-room`, {
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
                            className="w-24 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-purple-500 focus:border-purple-500"
                          />
                          <button 
                            type="submit"
                            className="bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium px-3 py-1 rounded transition-colors"
                          >
                            Assign
                          </button>
                        </form>
                      )}
                    </div>
                  </li>
                ))}
                {(!event.accommodationRequests || event.accommodationRequests.length === 0) && (
                  <li className="px-6 py-4 text-gray-500 text-center">No accommodation requests for this event.</li>
                )}
              </ul>
            </div>
          )}
        </div>

        {/* Admin Registered Teams Section */}
        {event.allowTeams && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden mt-8">
            <div className="bg-indigo-50 px-6 py-4 border-b border-indigo-100 flex justify-between items-center">
              <h2 className="font-bold text-indigo-900 text-xl flex items-center gap-2">👥 Registered Teams</h2>
              <span className="bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                {event.teams?.length || 0} Teams
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0 divide-y md:divide-y-0 md:divide-x divide-gray-100">
              {event.teams?.map(team => (
                <div key={team._id} className="p-6 hover:bg-indigo-50/50 transition-colors border-b border-gray-100">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-black text-xl text-gray-900">{team.name}</h3>
                    <div className="text-center bg-white border border-indigo-200 px-2 py-1 rounded shadow-sm">
                      <span className="block text-[10px] text-gray-500 uppercase font-bold leading-none mb-1">Invite Code</span>
                      <span className="text-sm font-mono font-bold text-indigo-700 leading-none">{team.inviteCode}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="bg-indigo-100/50 p-3 rounded-lg border border-indigo-100">
                      <p className="text-xs font-bold text-indigo-800 uppercase tracking-wider mb-1">👑 Captain</p>
                      <p className="font-medium text-gray-900">{team.captain?.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5 uppercase">{team.captain?.rollNumber || 'N/A'}</p>
                    </div>

                    <div className="p-3">
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Members ({team.members?.length || 0})</p>
                      {team.members?.length > 0 ? (
                        <ul className="space-y-2">
                          {team.members.map(member => (
                            <li key={member._id} className="flex justify-between items-center text-sm border-b border-gray-50 pb-1 last:border-0">
                              <span className="text-gray-700">{member.name}</span>
                              <span className="text-xs font-bold text-gray-400 uppercase">{member.rollNumber || 'N/A'}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-gray-400 italic">No members joined yet.</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {(!event.teams || event.teams.length === 0) && (
                <div className="p-8 text-center col-span-full">
                  <p className="text-gray-500">No teams have been created for this event yet.</p>
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