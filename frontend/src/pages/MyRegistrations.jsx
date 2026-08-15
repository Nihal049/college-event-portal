import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react'; 
import html2pdf from 'html2pdf.js'; 
import Swal from 'sweetalert2'; 

const MyRegistrations = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'active' | 'past'

  // Warm Light-Mode SweetAlert Config
  const swalConfig = {
    background: '#ffffff',
    color: '#292524',
    customClass: { popup: 'rounded-[2rem] shadow-2xl border border-orange-50 font-sans' }
  };

  const fetchMyEvents = async (token) => {
    try {
      const response = await fetch('https://college-event-portal-a0d1.onrender.com/api/events/my-registrations', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      
      if (response.ok) {
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

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = JSON.parse(atob(token.split('.')[1]));
        setUserId(decoded.id);
        fetchMyEvents(token);
      } catch (e) {
        console.error("Invalid token");
      }
    }
  }, []);

  const handleCancel = async (eventId) => {
    const result = await Swal.fire({
      ...swalConfig,
      title: 'Are you sure?',
      text: 'If you are a team captain, leadership will be passed to the next member.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#f43f5e',
      cancelButtonColor: '#a8a29e',
      confirmButtonText: 'Yes, cancel it!',
    });

    if (!result.isConfirmed) return;

    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`https://college-event-portal-a0d1.onrender.com/api/events/${eventId}/cancel`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        Swal.fire({ ...swalConfig, title: 'Cancelled!', text: 'Registration cancelled successfully.', icon: 'success', confirmButtonColor: '#f97316' });
        setEvents(events.filter(event => event._id !== eventId));
      } else {
        const data = await response.json();
        Swal.fire({ ...swalConfig, title: 'Error', text: data.message, icon: 'error', confirmButtonColor: '#f43f5e' });
      }
    } catch (error) {
      Swal.fire({ ...swalConfig, title: 'Connection Error', text: 'Error connecting to server.', icon: 'error', confirmButtonColor: '#f43f5e' });
    }
  };

  const handleFeedback = async (eventId) => {
    const { value: formValues } = await Swal.fire({
      ...swalConfig,
      title: 'Rate Your Experience',
      html: `
        <div class="text-left mb-2 mt-4 text-stone-500 font-bold text-xs uppercase tracking-widest">Rating</div>
        <select id="swal-rating" class="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl outline-none mb-4 font-bold text-stone-800 shadow-inner focus:ring-2 focus:ring-orange-400">
          <option value="5">⭐⭐⭐⭐⭐ (5/5) Incredible</option>
          <option value="4">⭐⭐⭐⭐ (4/5) Great</option>
          <option value="3">⭐⭐⭐ (3/5) Good</option>
          <option value="2">⭐⭐ (2/5) Okay</option>
          <option value="1">⭐ (1/5) Disappointing</option>
        </select>
        <div class="text-left mb-2 text-stone-500 font-bold text-xs uppercase tracking-widest">Your Review</div>
        <textarea id="swal-comment" class="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl outline-none resize-none font-medium text-stone-800 shadow-inner focus:ring-2 focus:ring-orange-400" rows="3" placeholder="What did you think of the event?"></textarea>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Submit Review',
      confirmButtonColor: '#f97316',
      cancelButtonColor: '#a8a29e',
      preConfirm: () => {
        return {
          rating: document.getElementById('swal-rating').value,
          comment: document.getElementById('swal-comment').value
        }
      }
    });

    if (formValues) {
      if(!formValues.comment.trim()) {
         return Swal.fire({...swalConfig, icon:'warning', title:'Review Empty', text:'Please write a short review.', confirmButtonColor: '#f59e0b'});
      }
      
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`https://college-event-portal-a0d1.onrender.com/api/events/${eventId}/feedback`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify(formValues)
        });
        
        const data = await response.json();
        
        if (response.ok) {
          Swal.fire({ ...swalConfig, title: 'Thank You!', text: data.message, icon: 'success', confirmButtonColor: '#10b981' });
          fetchMyEvents(token);
        } else {
          Swal.fire({ ...swalConfig, title: 'Oops', text: data.message, icon: 'error', confirmButtonColor: '#f43f5e' });
        }
      } catch(e) {
        Swal.fire({ ...swalConfig, title: 'Connection Error', text: 'Cannot connect to server.', icon: 'error', confirmButtonColor: '#f43f5e' });
      }
    }
  };

  const downloadTicket = (eventId, eventTitle) => {
    const element = document.getElementById(`ticket-${eventId}`);
    const actionButtons = document.getElementById(`actions-${eventId}`);
    if (actionButtons) actionButtons.style.display = 'none';

    const opt = {
      margin: 0.5, filename: `${eventTitle.replace(/\s+/g, '_')}_Ticket.pdf`, image: { type: 'jpeg', quality: 0.98 }, 
      html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff' }, jsPDF: { unit: 'in', format: 'letter', orientation: 'landscape' }
    };
    
    html2pdf().set(opt).from(element).save().then(() => {
      if (actionButtons) actionButtons.style.display = 'flex';
    });
  };

  const downloadCertificate = (eventId, eventTitle) => {
    const element = document.getElementById(`cert-${eventId}`);
    const opt = {
      margin: 0, filename: `${eventTitle.replace(/\s+/g, '_')}_Certificate.pdf`, image: { type: 'jpeg', quality: 1 }, 
      html2canvas: { scale: 2, useCORS: true }, jsPDF: { unit: 'in', format: 'letter', orientation: 'landscape' }
    };
    html2pdf().set(opt).from(element).save();
  };

  // Helper calculation for event expiration
  const checkIsExpired = (event) => {
    const eventDate = new Date(event.date);
    const now = new Date();
    return eventDate.getTime() + (24 * 60 * 60 * 1000) < now.getTime();
  };

  // Partition events into Active and Past
  const now = new Date();
  const activeEvents = events
    .filter(event => !checkIsExpired(event))
    .sort((a, b) => new Date(a.date) - new Date(b.date)); // Nearest event first

  const pastEvents = events
    .filter(event => checkIsExpired(event))
    .sort((a, b) => new Date(b.date) - new Date(a.date)); // Most recent past event first

  const renderTicketCard = (event) => {
    const qrData = JSON.stringify({ eventId: event._id, userId: userId });
    const myAccommodation = event.accommodationRequests?.find(req => req.student === userId || (req.student && req.student._id === userId));
    const isCheckedIn = event.checkedInUsers?.includes(userId);
    const team = event.myTeam;
    const isExpired = checkIsExpired(event);
    const hasLeftFeedback = event.feedbacks?.some(f => f.student === userId || (f.student && f.student._id === userId));

    return (
      <div key={event._id} className="relative group perspective-1000">
        <div id={`ticket-${event._id}`} className={`bg-white/70 backdrop-blur-3xl rounded-[2.5rem] shadow-xl shadow-rose-900/5 group-hover:shadow-2xl group-hover:shadow-rose-900/10 transition-all duration-500 transform group-hover:-translate-y-2 border border-white group-hover:border-orange-200 flex flex-col md:flex-row overflow-hidden relative ${isExpired ? 'opacity-90' : ''}`}>
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-orange-400/20 to-rose-400/20 rounded-full blur-3xl opacity-50 -mr-20 -mt-20 pointer-events-none transition-opacity group-hover:opacity-100"></div>

          {/* Left Side: Information */}
          <div className="p-8 flex-1 flex flex-col justify-between relative z-10">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="bg-white border border-orange-50 text-orange-600 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-sm">
                  {event.category}
                </span>
                {isExpired ? (
                  <span className="bg-stone-100 text-stone-500 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border border-stone-200">
                    Ended
                  </span>
                ) : (
                  <span className="bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border border-emerald-100 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                    Valid Pass
                  </span>
                )}
              </div>
              
              <h2 className="text-2xl font-black text-stone-800 leading-tight mb-4 group-hover:text-orange-600 transition-colors tracking-tight">{event.title}</h2>
              
              <div className="flex flex-col gap-2 bg-white/50 backdrop-blur-md p-4 rounded-2xl border border-white">
                <p className="flex items-center text-stone-600 font-bold text-sm"><span className="w-8 h-8 rounded-full bg-white flex items-center justify-center border border-white mr-3 text-base shadow-sm">📍</span> {event.venue}</p>
                <p className="flex items-center text-stone-600 font-bold text-sm"><span className="w-8 h-8 rounded-full bg-white flex items-center justify-center border border-white mr-3 text-base shadow-sm">📅</span> {new Date(event.date).toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' })}</p>
              </div>

              {team && (
                <div className="mt-5 p-5 bg-white/60 border border-white rounded-2xl relative overflow-hidden shadow-sm">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-rose-300/30 rounded-full blur-xl -mr-10 -mt-10"></div>
                  <div className="relative z-10 flex justify-between items-start mb-3">
                    <div>
                      <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest mb-0.5">Team Roster</p>
                      <p className="text-xl font-black text-stone-800">{team.name}</p>
                    </div>
                    <div className="bg-white px-3 py-1.5 rounded-xl border border-rose-50 text-center shadow-sm">
                      <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest mb-0.5">Code</p>
                      <p className="font-mono font-bold text-rose-500 text-sm">{team.inviteCode}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-1.5 mt-2 relative z-10">
                    <p className="text-sm text-stone-700 font-bold"><span className="font-bold mr-1">👑</span> {team.captain?.name} <span className="text-rose-400 text-[10px] uppercase tracking-widest ml-1">(Captain)</span></p>
                    {team.members?.map((member, idx) => (
                      <p key={idx} className="text-sm text-stone-500 font-bold ml-6 flex items-center gap-2"><span className="w-1.5 h-1.5 bg-orange-400 rounded-full"></span> {member.name}</p>
                    ))}
                  </div>
                </div>
              )}

              {myAccommodation && (
                <div className={`mt-5 p-4 rounded-2xl border bg-white/80 shadow-sm flex items-center justify-between ${myAccommodation.status === 'Approved' ? 'border-emerald-100' : 'border-orange-100'}`}>
                  <div>
                    <p className={`text-[10px] font-black uppercase tracking-widest mb-0.5 ${myAccommodation.status === 'Approved' ? 'text-emerald-500' : 'text-orange-500'}`}>🛏️ Accommodation</p>
                    {myAccommodation.status === 'Approved' ? <p className="text-lg font-black text-stone-800">Room <span className="text-emerald-500">{myAccommodation.assignedRoom}</span></p> : <p className="text-sm font-bold text-orange-500">Pending Approval</p>}
                  </div>
                  {myAccommodation.status === 'Approved' && <div className="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center border border-emerald-100"><span className="text-emerald-500 text-xl">✓</span></div>}
                </div>
              )}
            </div>
          </div>

          {/* Right Side: QR Code Stub */}
          <div className="p-8 md:w-72 shrink-0 bg-white/40 border-t-2 md:border-t-0 md:border-l-2 border-dashed border-stone-200 flex flex-col items-center justify-center relative backdrop-blur-md">
            <div className="hidden md:block absolute -left-[17px] top-[-1px] w-8 h-8 bg-[#fff8f6] rounded-full border-b border-r border-stone-200"></div>
            <div className="hidden md:block absolute -left-[17px] bottom-[-1px] w-8 h-8 bg-[#fff8f6] rounded-full border-t border-r border-stone-200"></div>

            {isCheckedIn ? (
              <div className="text-center w-full bg-emerald-50 p-6 rounded-3xl border border-emerald-100 mb-4 shadow-sm">
                <div className="bg-emerald-500 text-white p-4 rounded-full inline-block mb-3 shadow-md shadow-emerald-500/30">
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                </div>
                <p className="text-xs font-black text-emerald-600 uppercase tracking-widest">Access Granted</p>
              </div>
            ) : isExpired ? (
              <div className="text-center w-full bg-stone-100/80 p-6 rounded-3xl border border-stone-200 mb-4 shadow-sm grayscale opacity-80">
                <div className="bg-stone-300 text-stone-500 p-4 rounded-full inline-block mb-3 shadow-inner"><span className="text-3xl block">⏳</span></div>
                <p className="text-xs font-black text-stone-500 uppercase tracking-widest">Event Ended</p>
                <p className="text-[10px] font-bold text-stone-400 mt-1 uppercase">Not Attended</p>
              </div>
            ) : (
              <div className="text-center mb-6 w-full flex flex-col items-center">
                <div className="bg-white p-3.5 rounded-3xl shadow-sm border-2 border-white group-hover:border-orange-300 transition-colors duration-500">
                  <QRCodeSVG value={qrData} size={128} level="H" includeMargin={false} fgColor="#292524" />
                </div>
                <p className="mt-4 text-[10px] font-black text-stone-400 uppercase tracking-widest">Scan at Entrance</p>
              </div>
            )}

            {/* Action Buttons */}
            <div id={`actions-${event._id}`} className="mt-auto w-full space-y-3">
              {isCheckedIn ? (
                <>
                  <button onClick={() => downloadCertificate(event._id, event.title)} className="w-full bg-gradient-to-r from-orange-400 to-amber-500 hover:from-orange-500 hover:to-amber-600 text-white text-sm font-black py-3.5 px-4 rounded-xl shadow-md shadow-orange-500/20 transform hover:-translate-y-0.5 transition-all mb-2">
                    🎓 Get Certificate
                  </button>
                  {!hasLeftFeedback && (
                    <button onClick={() => handleFeedback(event._id)} className="w-full bg-white hover:bg-stone-50 text-stone-600 border border-stone-200 text-xs font-bold py-3 px-4 rounded-xl transition-all shadow-sm active:scale-95">
                      ⭐ Leave Feedback
                    </button>
                  )}
                </>
              ) : isExpired ? (
                <button disabled className="w-full bg-stone-100 text-stone-400 text-sm font-black py-3.5 px-4 rounded-xl border border-stone-200 cursor-not-allowed">
                  Ticket Expired
                </button>
              ) : (
                <>
                  <button onClick={() => downloadTicket(event._id, event.title)} className="w-full bg-gradient-to-r from-orange-400 to-rose-400 hover:from-orange-500 hover:to-rose-500 text-white text-sm font-black py-3.5 px-4 rounded-xl shadow-md shadow-rose-500/20 transform hover:-translate-y-0.5 transition-all active:scale-95">
                    Download PDF
                  </button>
                  <button onClick={() => handleCancel(event._id)} className="w-full bg-white border border-stone-200 hover:bg-rose-50 text-rose-500 text-xs font-bold py-3 px-4 rounded-xl transition-colors active:scale-95 shadow-sm">
                    Cancel Registration
                  </button>
                </>
              )}
            </div>
          </div>

        </div>
        
        {/* HIDDEN CERTIFICATE */}
        <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
          <div id={`cert-${event._id}`} className="w-[1056px] h-[816px] bg-white p-12 relative flex flex-col items-center justify-center text-center font-serif border-[16px] border-double border-orange-900">
            <div className="absolute top-4 left-4 w-16 h-16 border-t-4 border-l-4 border-rose-500"></div>
            <div className="absolute top-4 right-4 w-16 h-16 border-t-4 border-r-4 border-rose-500"></div>
            <div className="absolute bottom-4 left-4 w-16 h-16 border-b-4 border-l-4 border-rose-500"></div>
            <div className="absolute bottom-4 right-4 w-16 h-16 border-b-4 border-r-4 border-rose-500"></div>
            <h3 className="text-2xl font-bold tracking-widest text-stone-500 uppercase mb-8">Certificate of Participation</h3>
            <h1 className="text-5xl font-black text-orange-900 mb-12">{event.title}</h1>
            <p className="text-2xl text-stone-700 mb-4">This is proudly presented to acknowledge the successful participation and attendance at our event.</p>
            <p className="text-xl text-stone-500 mb-16">Hosted on <strong>{new Date(event.date).toLocaleDateString()}</strong> at <strong>{event.venue}</strong></p>
          </div>
        </div>

      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#fff8f6]">
        <div className="w-16 h-16 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin mb-4"></div>
        <p className="text-orange-500 font-black tracking-widest uppercase text-sm animate-pulse shadow-sm">Decrypting Passes...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fff8f6] py-12 px-4 sm:px-6 lg:px-8 font-sans relative overflow-hidden selection:bg-orange-500/20 text-stone-800">
      
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-rose-300/40 rounded-full blur-[100px] pointer-events-none mix-blend-multiply"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-orange-300/40 rounded-full blur-[100px] pointer-events-none mix-blend-multiply"></div>

      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* Header Bar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6 bg-white/60 backdrop-blur-xl p-6 md:p-8 rounded-[2rem] shadow-xl shadow-rose-900/5 border border-white">
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-stone-800 pb-2 tracking-tight">
              Digital Passes
            </h1>
            <p className="text-orange-600 font-black uppercase tracking-widest text-[10px] flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse"></span>
              Secure Access Granted
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Filter Tabs */}
            <div className="bg-white/80 p-1 rounded-2xl border border-stone-200/80 flex items-center shadow-inner">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${activeTab === 'all' ? 'bg-gradient-to-r from-orange-500 to-rose-500 text-white shadow-md' : 'text-stone-500 hover:text-stone-800'}`}
              >
                All ({events.length})
              </button>
              <button
                onClick={() => setActiveTab('active')}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${activeTab === 'active' ? 'bg-gradient-to-r from-orange-500 to-rose-500 text-white shadow-md' : 'text-stone-500 hover:text-stone-800'}`}
              >
                🎟️ Active ({activeEvents.length})
              </button>
              <button
                onClick={() => setActiveTab('past')}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${activeTab === 'past' ? 'bg-gradient-to-r from-orange-500 to-rose-500 text-white shadow-md' : 'text-stone-500 hover:text-stone-800'}`}
              >
                ⏳ History ({pastEvents.length})
              </button>
            </div>

            <Link to="/dashboard" className="group flex items-center gap-2 bg-white/80 hover:bg-white border border-white text-stone-600 px-5 py-2.5 rounded-xl font-bold transition-all duration-300 transform hover:-translate-y-0.5 shadow-sm active:scale-95 text-sm">
              <span className="text-lg group-hover:-translate-x-1 transition-transform text-stone-400">←</span>
              Back to Hub
            </Link>
          </div>
        </div>

        {events.length === 0 ? (
          <div className="bg-white/60 backdrop-blur-xl p-16 rounded-[2.5rem] border border-dashed border-stone-300 hover:border-orange-400 transition-colors text-center flex flex-col items-center justify-center shadow-xl shadow-rose-900/5">
            <div className="w-24 h-24 bg-white border border-white rounded-full flex items-center justify-center shadow-sm mb-6 text-5xl">🎫</div>
            <h2 className="text-3xl font-black text-stone-800 mb-3 tracking-tight">Your wallet is empty</h2>
            <p className="text-stone-500 font-medium text-lg mb-8 max-w-md">You haven't encrypted any event passes yet. Browse the network and secure your spot!</p>
            <Link to="/dashboard" className="bg-gradient-to-r from-orange-400 to-rose-400 hover:from-orange-500 hover:to-rose-500 text-white px-8 py-4 rounded-2xl font-black text-lg shadow-lg shadow-rose-500/25 transition-all duration-300 transform hover:-translate-y-1 active:scale-95">
              Explore Events
            </Link>
          </div>
        ) : (
          <div className="space-y-12">
            
            {/* SECTION 1: Active & Upcoming Passes (Rendered First) */}
            {(activeTab === 'all' || activeTab === 'active') && (
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full animate-ping"></div>
                  <h2 className="text-xl font-black text-stone-800 uppercase tracking-wider flex items-center gap-2">
                    🎟️ Active & Upcoming Passes
                  </h2>
                  <span className="bg-emerald-100 text-emerald-700 text-xs font-black px-3 py-1 rounded-full">
                    {activeEvents.length}
                  </span>
                </div>

                {activeEvents.length === 0 ? (
                  <div className="bg-white/40 border border-stone-200/60 p-8 rounded-3xl text-center text-stone-500 font-semibold mb-8">
                    No active or upcoming passes right now. Check back when you register for new events!
                  </div>
                ) : (
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                    {activeEvents.map(renderTicketCard)}
                  </div>
                )}
              </div>
            )}

            {/* SECTION 2: Past & Expired Passes (Rendered Below) */}
            {(activeTab === 'all' || activeTab === 'past') && (
              <div className={activeTab === 'all' && activeEvents.length > 0 ? "pt-8 border-t border-stone-200/60" : ""}>
                <div className="flex items-center gap-3 mb-6">
                  <h2 className="text-xl font-black text-stone-500 uppercase tracking-wider flex items-center gap-2">
                    ⏳ Past & Expired Passes
                  </h2>
                  <span className="bg-stone-200 text-stone-600 text-xs font-black px-3 py-1 rounded-full">
                    {pastEvents.length}
                  </span>
                </div>

                {pastEvents.length === 0 ? (
                  <div className="bg-white/40 border border-stone-200/60 p-8 rounded-3xl text-center text-stone-500 font-semibold">
                    No past event passes.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                    {pastEvents.map(renderTicketCard)}
                  </div>
                )}
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
};

export default MyRegistrations;