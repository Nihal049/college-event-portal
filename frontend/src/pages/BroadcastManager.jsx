import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const BroadcastManager = () => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('');
  const navigate = useNavigate();

  const handleBroadcast = async (e) => {
    e.preventDefault();
    setStatus('');
    const token = localStorage.getItem('token');

    try {
      const response = await fetch('https://college-event-portal-a0d1.onrender.com/api/events/broadcast', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title, message })
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('🚀 Announcement broadcasted successfully to all connected users!');
        setTitle('');
        setMessage('');
      } else {
        setStatus(`❌ ${data.message}`);
      }
    } catch (error) {
      setStatus('❌ Cannot connect to server.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl mx-auto bg-white p-8 rounded-xl shadow-lg border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-extrabold text-gray-900">Live Broadcast Panel</h2>
          <Link to="/dashboard" className="text-sm font-medium text-blue-600 hover:underline">Back to Dashboard</Link>
        </div>

        {status && (
          <div className="mb-6 p-4 rounded-md text-sm font-medium bg-blue-50 text-blue-800 border border-blue-200">
            {status}
          </div>
        )}

        <form onSubmit={handleBroadcast} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Alert Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Venue Change: Hackathon Hall B"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Message Body</label>
            <textarea
              required
              rows="4"
              placeholder="Type your urgent broadcast message here..."
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            ></textarea>
          </div>

          <button
            type="submit"
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg transition-colors shadow-md flex items-center justify-center gap-2"
          >
            📢 Broadcast Instant Alert
          </button>
        </form>
      </div>
    </div>
  );
};

export default BroadcastManager;