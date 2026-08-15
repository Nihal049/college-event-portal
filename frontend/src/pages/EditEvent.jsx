import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import Swal from 'sweetalert2';

const EditEvent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'College Fest',
    venue: '',
    seatLimit: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: ''
  });
  
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Warm Light-Mode SweetAlert Config (Aurora Style)
  const swalConfig = {
    background: '#ffffff',
    color: '#292524',
    customClass: { popup: 'rounded-[2rem] shadow-2xl border border-orange-50 font-sans' }
  };

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await fetch(`https://college-event-portal-a0d1.onrender.com/api/events`);
        const events = await response.json();
        const currentEvent = events.find(e => e._id === id);
        
        if (currentEvent) {
          // Format date for HTML date input (YYYY-MM-DD)
          const formattedStart = currentEvent.startDate ? currentEvent.startDate.split('T')[0] : '';
          const formattedEnd = currentEvent.endDate ? currentEvent.endDate.split('T')[0] : '';
          
          setFormData({
            title: currentEvent.title,
            description: currentEvent.description,
            venue: currentEvent.venue,
            category: currentEvent.category,
            seatLimit: currentEvent.seatLimit,
            startDate: formattedStart,
            startTime: currentEvent.startTime || '',
            endDate: formattedEnd,
            endTime: currentEvent.endTime || ''
          });
        }
      } catch (error) {
        console.error('Error fetching event data', error);
        Swal.fire({ ...swalConfig, title: 'Data Error', text: 'Failed to fetch event data.', icon: 'error', confirmButtonColor: '#f43f5e' });
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const token = localStorage.getItem('token');

    try {
      const response = await fetch(`https://college-event-portal-a0d1.onrender.com/api/events/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        Swal.fire({ ...swalConfig, title: 'System Updated', text: 'Event parameters modified successfully!', icon: 'success', confirmButtonColor: '#f97316' });
        setTimeout(() => navigate('/dashboard'), 1500);
      } else {
        Swal.fire({ ...swalConfig, title: 'Update Failed', text: data.message || 'Failed to modify event.', icon: 'error', confirmButtonColor: '#f43f5e' });
        setIsSubmitting(false);
      }
    } catch (error) {
      Swal.fire({ ...swalConfig, title: 'Connection Error', text: 'Cannot connect to server.', icon: 'error', confirmButtonColor: '#f43f5e' });
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#fff8f6]">
        <div className="w-16 h-16 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin mb-4"></div>
        <p className="text-orange-500 font-black tracking-widest uppercase text-sm animate-pulse shadow-sm">Decrypting Event Data...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fff8f6] py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden font-sans selection:bg-orange-500/20">
      
      {/* --- AURORA AMBIENT BACKGROUND BLOBS --- */}
      <div className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] bg-rose-300/40 rounded-full blur-[120px] pointer-events-none mix-blend-multiply"></div>
      <div className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] bg-orange-300/40 rounded-full blur-[120px] pointer-events-none mix-blend-multiply"></div>
      
      <div className="max-w-4xl w-full relative z-10">
        
        {/* --- MAIN AURORA GLASS CARD --- */}
        <div className="bg-white/60 backdrop-blur-xl p-8 sm:p-12 rounded-[2.5rem] shadow-xl shadow-rose-900/5 border border-white relative overflow-hidden">
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 border-b border-white/60 pb-6 relative z-10 gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-sm border bg-orange-50 text-orange-600 border-orange-100 mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse"></span>
                Admin Protocol
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-stone-800 leading-tight tracking-tight">
                Modify Event Data
              </h1>
            </div>
            <Link to="/dashboard" className="group flex items-center gap-2 bg-white/80 hover:bg-white border border-white text-stone-600 px-5 py-2.5 rounded-xl font-bold transition-all duration-300 shadow-sm transform hover:-translate-y-0.5 active:scale-95">
              <span className="text-xl group-hover:-translate-x-1 transition-transform text-stone-400">←</span>
              Abort
            </Link>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] font-black text-stone-500 uppercase tracking-widest mb-2 ml-1">Event Title</label>
                <input type="text" name="title" required value={formData.title} onChange={handleChange} className="block w-full px-4 py-3.5 bg-white/50 border border-white rounded-xl focus:ring-2 focus:ring-orange-400 transition-all font-bold text-stone-800 outline-none placeholder-stone-400 shadow-inner" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-stone-500 uppercase tracking-widest mb-2 ml-1">Category</label>
                <select name="category" value={formData.category} onChange={handleChange} className="block w-full px-4 py-3.5 bg-white/50 border border-white rounded-xl focus:ring-2 focus:ring-orange-400 transition-all font-bold text-stone-800 outline-none cursor-pointer shadow-inner">
                  <option value="College Fest">College Fest</option>
                  <option value="Workshop">Workshop</option>
                  <option value="Hackathon">Hackathon</option>
                  <option value="Seminar">Seminar</option>
                  <option value="Sports">Sports</option>
                  <option value="Cultural">Cultural</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-stone-500 uppercase tracking-widest mb-2 ml-1">Description</label>
              <textarea name="description" required rows="4" value={formData.description} onChange={handleChange} className="block w-full px-4 py-3.5 bg-white/50 border border-white rounded-xl focus:ring-2 focus:ring-orange-400 transition-all font-medium text-stone-800 outline-none placeholder-stone-400 resize-none leading-relaxed shadow-inner" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-6 bg-white/50 rounded-2xl border border-white shadow-sm">
              <div>
                <label className="block text-[10px] font-black text-stone-500 uppercase tracking-widest mb-2 ml-1">Venue Location</label>
                <input type="text" name="venue" required value={formData.venue} onChange={handleChange} className="block w-full px-4 py-3.5 bg-white/60 border border-white rounded-xl focus:ring-2 focus:ring-orange-400 transition-all font-bold text-stone-800 outline-none placeholder-stone-400 shadow-inner" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-stone-500 uppercase tracking-widest mb-2 ml-1">Seat Capacity</label>
                <input type="number" name="seatLimit" required min="1" value={formData.seatLimit} onChange={handleChange} className="block w-full px-4 py-3.5 bg-white/60 border border-white rounded-xl focus:ring-2 focus:ring-orange-400 transition-all font-bold text-stone-800 outline-none placeholder-stone-400 shadow-inner" />
              </div>
            </div>

            {/* --- GOOGLE CALENDAR STYLE SCHEDULE PANEL --- */}
            <div>
              <h3 className="text-xs font-black text-orange-500 uppercase tracking-widest mb-4 flex items-center gap-2 ml-1">
                <span className="text-lg drop-shadow-sm">🗓️</span> Schedule event
              </h3>
              <div className="space-y-5 p-6 bg-white/50 rounded-2xl border border-white shadow-sm">
                
                {/* Event Starts */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
                  <label className="w-24 text-[10px] font-black text-stone-500 uppercase tracking-widest">Starts</label>
                  <div className="flex-1 flex flex-col sm:flex-row gap-3">
                    <input type="date" name="startDate" required value={formData.startDate} onChange={handleChange} className="flex-1 px-4 py-3 bg-white/60 border border-white rounded-xl focus:ring-2 focus:ring-orange-400 transition-all font-bold text-stone-800 outline-none shadow-inner" />
                    <input type="text" name="startTime" required value={formData.startTime} onChange={handleChange} className="flex-1 px-4 py-3 bg-white/60 border border-white rounded-xl focus:ring-2 focus:ring-orange-400 transition-all font-bold text-stone-800 outline-none placeholder-stone-400 shadow-inner" />
                  </div>
                </div>

                <div className="border-t border-white/60"></div>

                {/* Event Ends */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
                  <label className="w-24 text-[10px] font-black text-stone-500 uppercase tracking-widest">Ends</label>
                  <div className="flex-1 flex flex-col sm:flex-row gap-3">
                    <input type="date" name="endDate" required value={formData.endDate} onChange={handleChange} className="flex-1 px-4 py-3 bg-white/60 border border-white rounded-xl focus:ring-2 focus:ring-orange-400 transition-all font-bold text-stone-800 outline-none shadow-inner" />
                    <input type="text" name="endTime" required value={formData.endTime} onChange={handleChange} className="flex-1 px-4 py-3 bg-white/60 border border-white rounded-xl focus:ring-2 focus:ring-orange-400 transition-all font-bold text-stone-800 outline-none placeholder-stone-400 shadow-inner" />
                  </div>
                </div>

              </div>
            </div>

            <div className="pt-6 flex flex-col sm:flex-row gap-4 border-t border-white/60">
              <Link to="/dashboard" className="w-full sm:w-1/3 flex justify-center items-center py-4 bg-white/80 hover:bg-white border border-white rounded-xl text-stone-600 font-black text-sm uppercase tracking-widest transition-all shadow-sm active:scale-95">
                Discard
              </Link>
              <button type="submit" disabled={isSubmitting} className={`w-full sm:w-2/3 flex justify-center items-center py-4 rounded-xl text-white font-black text-sm uppercase tracking-widest shadow-lg transform transition-all ${isSubmitting ? 'bg-stone-200 border border-stone-200 text-stone-400 cursor-not-allowed shadow-none' : 'bg-gradient-to-r from-orange-400 to-rose-400 hover:from-orange-500 hover:to-rose-500 shadow-rose-500/25 hover:-translate-y-0.5 active:scale-95'}`}>
                {isSubmitting ? 'Applying Changes...' : 'Update Event'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditEvent;