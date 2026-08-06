import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CreateEvent = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'College Fest',
    date: '',
    venue: '',
    seatLimit: '',
    // NEW: Timeline specific fields
    festDay: 'Day 1',
    startTime: '',
    endTime: '',
    offersAccommodation: false,
    allowTeams: false,
    maxTeamSize: 1,
  });
  
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    const token = localStorage.getItem('token');

    try {
      const response = await fetch('http://localhost:5000/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Event created successfully!');
        setIsError(false);
        setTimeout(() => navigate('/dashboard'), 1500); 
      } else {
        setMessage(data.message || 'Failed to create event');
        setIsError(true);
      }
    } catch (error) {
      setMessage('Cannot connect to server.');
      setIsError(true);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-lg border border-gray-100">
        <h2 className="text-3xl font-extrabold text-gray-900 mb-6">Create New Event</h2>
        
        {message && (
          <div className={`mb-6 p-4 rounded-md text-sm font-medium ${isError ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Event Title</label>
            <input
              name="title"
              type="text"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={formData.title}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              name="description"
              required
              rows="4"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={formData.description}
              onChange={handleChange}
            ></textarea>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Category</label>
              <select
                name="category"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={formData.category}
                onChange={handleChange}
              >
                <option value="College Fest">College Fest</option>
                <option value="Workshop">Workshop</option>
                <option value="Hackathon">Hackathon</option>
                <option value="Seminar">Seminar</option>
                <option value="Sports">Sports</option>
                <option value="Cultural">Cultural</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Date</label>
              <input
                name="date"
                type="datetime-local"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={formData.date}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Venue</label>
              <input
                name="venue"
                type="text"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={formData.venue}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Seat Limit (Overall)</label>
              <input
                name="seatLimit"
                type="number"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={formData.seatLimit}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* NEW TIMELINE INPUTS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <div>
              <label className="block text-sm font-medium text-gray-700">Fest Day</label>
              <select
                name="festDay"
                value={formData.festDay}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="Day 1">Day 1</option>
                <option value="Day 2">Day 2</option>
                <option value="Day 3">Day 3</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Start Time</label>
              <input
                type="text"
                name="startTime"
                placeholder="e.g. 10:00 AM"
                value={formData.startTime}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">End Time</label>
              <input
                type="text"
                name="endTime"
                placeholder="e.g. 02:00 PM"
                value={formData.endTime}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
          </div>

          {/* Special Feature Toggles */}
          <div className="space-y-4 pt-2">
            
            <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg border border-purple-100">
              <input
                type="checkbox"
                id="accommodation"
                checked={formData.offersAccommodation}
                onChange={(e) => setFormData({ ...formData, offersAccommodation: e.target.checked })}
                className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500 border-gray-300 cursor-pointer"
              />
              <label htmlFor="accommodation" className="text-sm font-medium text-purple-900 cursor-pointer">
                Provide Overnight Hostel Accommodation for this event
              </label>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-100 gap-4">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="allowTeams"
                  checked={formData.allowTeams}
                  onChange={(e) => setFormData({ ...formData, allowTeams: e.target.checked })}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 border-gray-300 cursor-pointer"
                />
                <label htmlFor="allowTeams" className="text-sm font-medium text-blue-900 cursor-pointer">
                  Enable Team/Group Registrations
                </label>
              </div>

              {formData.allowTeams && (
                <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-md border border-blue-200 shadow-sm">
                  <label className="text-sm font-bold text-blue-900 whitespace-nowrap">Max Size:</label>
                  <input
                    name="maxTeamSize"
                    type="number"
                    min="2"
                    max="100"
                    required
                    className="w-16 px-2 py-1 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-center font-bold"
                    value={formData.maxTeamSize}
                    onChange={handleChange}
                  />
                </div>
              )}
            </div>

          </div>

          <div className="pt-4 flex gap-4">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="w-full bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 font-medium py-2.5 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition-colors shadow-md"
            >
              Create Event
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEvent;