import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react'; // Using SVG for sharper PDF rendering
import html2pdf from 'html2pdf.js'; 

const MyRegistrations = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    
    if (token) {
      try {
        const decoded = JSON.parse(atob(token.split('.')[1]));
        setUserId(decoded.id);
      } catch (e) {
        console.error("Invalid token");
      }
    }
    
    const fetchMyEvents = async () => {
      try {
        const response = await fetch('https://college-event-portal-a0d1.onrender.com/api/events/my-registrations', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        
        if (response.ok) {
          // Fetch team data for events that allow teams
          const eventsWithTeams = await Promise.all(data.map(async (event) => {
            if (event.allowTeams) {
              const teamRes = await fetch(`https://college-event-portal-a0d1.onrender.com/api/events/${event._id}/team`, {
                headers: { 'Authorization': `Bearer ${token}` }
              });
              const teamData = await teamRes.json();
              return { ...event, myTeam: teamData };
            }
            return event;
          }));
          setEvents(eventsWithTeams);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching registrations:', error);
        setLoading(false);
      }
    };

    fetchMyEvents();
  }, []);

  const handleCancel = async (eventId) => {
    if (!window.confirm("Are you sure you want to cancel your ticket? If you are a team captain, leadership will be passed to the next member.")) return;

    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`https://college-event-portal-a0d1.onrender.com/api/events/${eventId}/cancel`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        alert("✅ Registration cancelled successfully.");
        setEvents(events.filter(event => event._id !== eventId));
      } else {
        const data = await response.json();
        alert(`❌ ${data.message}`);
      }
    } catch (error) {
      alert("❌ Error connecting to server.");
    }
  };

  const downloadTicket = (eventId, eventTitle) => {
    const element = document.getElementById(`ticket-${eventId}`);
    const actionButtons = document.getElementById(`actions-${eventId}`);
    
    // Hide buttons before taking the PDF snapshot
    if (actionButtons) actionButtons.style.display = 'none';

    const opt = {
      margin: 0.5, 
      filename: `${eventTitle.replace(/\s+/g, '_')}_Ticket.pdf`,
      image: { type: 'jpeg', quality: 0.98 }, 
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'landscape' }
    };
    
    html2pdf().set(opt).from(element).save().then(() => {
      // Restore buttons after downloading
      if (actionButtons) actionButtons.style.display = 'flex';
    });
  };

  const downloadCertificate = (eventId, eventTitle) => {
    const element = document.getElementById(`cert-${eventId}`);
    const opt = {
      margin: 0, 
      filename: `${eventTitle.replace(/\s+/g, '_')}_Certificate.pdf`,
      image: { type: 'jpeg', quality: 1 }, 
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'landscape' }
    };
    html2pdf().set(opt).from(element).save();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors">
        <p className="text-gray-500 dark:text-gray-400 font-bold text-lg animate-pulse">Loading your tickets...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 transition-colors">
      <div className="max-w-5xl mx-auto">
        
        <div className="flex justify-between items-center mb-8 border-b dark:border-gray-700 pb-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-black">My Tickets</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Present these QR codes at the venue door</p>
          </div>
          <Link to="/dashboard" className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-lg font-medium transition-colors">
            Back to Dashboard
          </Link>
        </div>

        {events.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 p-10 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 text-center">
            <span className="text-4xl mb-4 block">🎟️</span>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No active registrations</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6">You haven't registered for any upcoming events yet.</p>
            <Link to="/dashboard" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-bold transition-colors">
              Browse Events
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {events.map((event) => {
              // Format the precise JSON string the scanner is expecting
              const qrData = JSON.stringify({ eventId: event._id, userId: userId });
              
              const myAccommodation = event.accommodationRequests?.find(req => req.student === userId || (req.student && req.student._id === userId));
              const isCheckedIn = event.checkedInUsers?.includes(userId);
              const team = event.myTeam;

              return (
                <div key={event._id} className="relative">
                  
                  {/* The Visible Ticket Card */}
                  <div id={`ticket-${event._id}`} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col md:flex-row overflow-hidden h-full">
                    
                    {/* Left Side: Information */}
                    <div className="p-6 md:w-2/3 flex flex-col justify-between">
                      <div>
                        <span className="text-xs font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-400 px-2 py-1 rounded-md uppercase tracking-wide">
                          {event.category}
                        </span>
                        <h2 className="text-xl font-bold mt-3 mb-2 text-gray-900 dark:text-white leading-tight">{event.title}</h2>
                        <div className="text-sm text-gray-500 dark:text-gray-400 space-y-1.5 mt-2">
                          <p className="flex items-center"><span className="mr-2">📍</span> {event.venue}</p>
                          <p className="flex items-center"><span className="mr-2">📅</span> {new Date(event.date).toLocaleDateString()}</p>
                        </div>

                        {/* Team Info Section */}
                        {team && (
                          <div className="mt-4 p-4 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-lg">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <p className="text-xs font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-wider">Team Roster</p>
                                <p className="text-lg font-black text-indigo-900 dark:text-indigo-300">{team.name}</p>
                              </div>
                              <div className="bg-white dark:bg-gray-800 px-2 py-1 rounded border border-indigo-200 dark:border-indigo-700 text-center shadow-sm">
                                <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase">Invite Code</p>
                                <p className="font-mono font-bold text-indigo-700 dark:text-indigo-400">{team.inviteCode}</p>
                              </div>
                            </div>
                            
                            <div className="space-y-1 mt-3">
                              <p className="text-sm text-indigo-800 dark:text-indigo-300"><span className="font-bold">👑 Captain:</span> {team.captain?.name}</p>
                              {team.members?.map((member, idx) => (
                                <p key={idx} className="text-sm text-indigo-700 dark:text-indigo-400 ml-5 flex items-center gap-2">
                                  <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full"></span> {member.name}
                                </p>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Hostel Accommodation Status */}
                        {myAccommodation && (
                          <div className={`mt-4 p-3 rounded-lg border ${myAccommodation.status === 'Approved' ? 'bg-green-50 border-green-100 dark:bg-green-900/20 dark:border-green-800/50' : 'bg-amber-50 border-amber-100 dark:bg-amber-900/20 dark:border-amber-800/50'}`}>
                            <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${myAccommodation.status === 'Approved' ? 'text-green-800 dark:text-green-400' : 'text-amber-800 dark:text-amber-400'}`}>
                              🛏️ Hostel Accommodation
                            </p>
                            {myAccommodation.status === 'Approved' ? (
                              <p className="text-xl font-black text-green-600 dark:text-green-500 leading-none">Room: {myAccommodation.assignedRoom}</p>
                            ) : (
                              <p className="text-sm font-medium text-amber-700 dark:text-amber-500">Status: Pending Admin Approval</p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right Side: QR Code & Actions */}
                    <div className="bg-gray-50 dark:bg-gray-750 p-6 flex flex-col items-center justify-center border-t md:border-t-0 md:border-l border-gray-100 dark:border-gray-700 min-w-[200px]">
                      
                      {isCheckedIn ? (
                        <div className="text-center mb-4">
                          <div className="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 p-3 rounded-full inline-block mb-2">
                            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                          </div>
                          <p className="text-sm font-bold text-green-700 dark:text-green-500 uppercase tracking-widest">Attended</p>
                        </div>
                      ) : (
                        <div className="text-center mb-4">
                          <div className="bg-white p-2 rounded-xl shadow-sm border border-gray-200">
                            <QRCodeSVG value={qrData} size={140} level="H" includeMargin={false} />
                          </div>
                          <p className="mt-3 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Admit One</p>
                        </div>
                      )}

                      {/* Action Buttons (These get hidden during PDF export!) */}
                      <div id={`actions-${event._id}`} className="mt-2 flex flex-col items-center gap-3 w-full">
                        {isCheckedIn ? (
                          <button onClick={() => downloadCertificate(event._id, event.title)} className="w-full bg-yellow-500 hover:bg-yellow-600 text-white text-xs font-bold py-2.5 px-4 rounded-md transition-colors shadow-sm">
                            🎓 Download Certificate
                          </button>
                        ) : (
                          <>
                            <button onClick={() => downloadTicket(event._id, event.title)} className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2.5 px-4 rounded-md transition-colors shadow-sm">
                              📥 Download PDF Ticket
                            </button>
                            <button onClick={() => handleCancel(event._id)} className="text-xs font-bold text-red-500 hover:text-red-700 hover:underline">
                              Cancel Registration
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                  </div>
                  
                  {/* HIDDEN CERTIFICATE TEMPLATE */}
                  <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
                    <div id={`cert-${event._id}`} className="w-[1056px] h-[816px] bg-white p-12 relative flex flex-col items-center justify-center text-center font-serif border-[16px] border-double border-blue-900">
                      <div className="absolute top-4 left-4 w-16 h-16 border-t-4 border-l-4 border-yellow-500"></div>
                      <div className="absolute top-4 right-4 w-16 h-16 border-t-4 border-r-4 border-yellow-500"></div>
                      <div className="absolute bottom-4 left-4 w-16 h-16 border-b-4 border-l-4 border-yellow-500"></div>
                      <div className="absolute bottom-4 right-4 w-16 h-16 border-b-4 border-r-4 border-yellow-500"></div>
                      <h3 className="text-2xl font-bold tracking-widest text-gray-500 uppercase mb-8">Certificate of Participation</h3>
                      <h1 className="text-5xl font-black text-blue-900 mb-12">{event.title}</h1>
                      <p className="text-2xl text-gray-700 mb-4">This is proudly presented to acknowledge the successful participation and attendance at our event.</p>
                      <p className="text-xl text-gray-500 mb-16">Hosted on <strong>{new Date(event.date).toLocaleDateString()}</strong> at <strong>{event.venue}</strong></p>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyRegistrations;