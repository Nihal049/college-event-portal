import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const MySchedule = () => {
  const [bookmarkedEvents, setBookmarkedEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // FETCH REAL DATA!
  useEffect(() => {
    const fetchBookmarks = async () => {
      const token = localStorage.getItem('token');
      try {
        const response = await fetch('http://localhost:5000/api/events/my-bookmarks', {
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
      const response = await fetch(`http://localhost:5000/api/events/${eventId}/bookmark`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        // Instantly remove it from the screen
        setBookmarkedEvents(bookmarkedEvents.filter(e => e._id !== eventId));
      }
    } catch (error) {
      alert("Failed to remove event.");
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-500 font-bold">Loading itinerary...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 transition-colors">
      <div className="max-w-4xl mx-auto">
        
        <div className="flex justify-between items-center mb-10 border-b border-gray-200 pb-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">My Itinerary</h1>
            <p className="text-gray-500 mt-1">Your personalized fest schedule</p>
          </div>
          <Link to="/dashboard" className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors">
            Back
          </Link>
        </div>

        {bookmarkedEvents.length === 0 ? (
          <div className="bg-white p-10 rounded-xl shadow-sm border border-gray-100 text-center">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Your itinerary is empty</h2>
            <p className="text-gray-500 mb-6">Go to the dashboard to bookmark events you're interested in!</p>
            <Link to="/dashboard" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-bold transition-colors">
              Browse Events
            </Link>
          </div>
        ) : (
          <div className="relative border-l-4 border-blue-500 ml-4 md:ml-8 space-y-8 pb-12">
            
            {bookmarkedEvents.map((event) => (
              <div key={event._id} className="relative pl-8 md:pl-12">
                
                <div className="absolute -left-[14px] top-4 w-6 h-6 rounded-full bg-blue-600 border-4 border-gray-50 shadow"></div>
                
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  
                  <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                    <div>
                      <div className="flex gap-2 items-center mb-2">
                        <span className="text-xs font-black text-blue-800 bg-blue-100 px-3 py-1 rounded-full uppercase tracking-wider">
                          {event.festDay || 'Day 1'}
                        </span>
                        <span className="text-sm font-bold text-gray-500">
                          {event.startTime || 'TBA'} - {event.endTime || 'TBA'}
                        </span>
                      </div>
                      
                      <h3 className="text-xl font-bold text-gray-900">{event.title}</h3>
                      <p className="text-gray-500 mt-2 flex items-center">
                        <span className="mr-2">📍</span> {event.venue}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleRemove(event._id)}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold px-4 py-2 rounded-lg transition-colors"
                      >
                        Remove
                      </button>
                      <Link to="/dashboard" className="bg-green-600 hover:bg-green-700 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors shadow-sm">
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