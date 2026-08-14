import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';

const AdminAnalytics = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    upcomingEvents: 0,
    completedEvents: 0,
    totalRegistrations: 0,
    totalCheckedIn: 0,
    turnoutRate: 0,
    eventData: [],
    categoryData: []
  });

  const COLORS = ['#f97316', '#f43f5e', '#f59e0b', '#8b5cf6', '#14b8a6', '#ec4899'];

  useEffect(() => {
    const fetchAndProcessData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('https://college-event-portal-a0d1.onrender.com/api/events', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        
        if (response.ok) {
          setEvents(data);
          
          let upCount = 0;
          let compCount = 0;
          let totalReg = 0;
          let totalChecked = 0;
          const categoryCount = {};
          const now = new Date().getTime();
          
          const processedEventData = data.map(ev => {
            const regCount = ev.registeredUsers ? ev.registeredUsers.length : 0;
            const checkedCount = ev.checkedInUsers ? ev.checkedInUsers.length : 0;
            const cap = ev.seatLimit || 0;
            const isPast = new Date(ev.date).getTime() + (24 * 60 * 60 * 1000) < now;
            
            if (isPast) compCount++; else upCount++;
            
            totalReg += regCount;
            totalChecked += checkedCount;
            
            categoryCount[ev.category] = (categoryCount[ev.category] || 0) + 1;
            
            return {
              name: ev.title.length > 12 ? ev.title.substring(0, 12) + '..' : ev.title,
              fullTitle: ev.title,
              capacity: cap,
              registered: regCount,
              checkedIn: checkedCount
            };
          });

          const processedCategoryData = Object.keys(categoryCount).map(key => ({
            name: key,
            value: categoryCount[key]
          }));

          setStats({
            upcomingEvents: upCount,
            completedEvents: compCount,
            totalRegistrations: totalReg,
            totalCheckedIn: totalChecked,
            turnoutRate: totalReg > 0 ? Math.round((totalChecked / totalReg) * 100) : 0,
            eventData: processedEventData,
            categoryData: processedCategoryData
          });
        }
      } catch (error) {
        console.error("Failed to fetch analytics data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAndProcessData();
  }, []);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/80 backdrop-blur-md p-4 rounded-xl border border-white shadow-lg shadow-rose-900/10">
          <p className="font-black text-stone-800 mb-2">{payload[0].payload.fullTitle || label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm font-bold flex items-center gap-2" style={{ color: entry.color }}>
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></span>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#fff8f6]">
        <div className="w-16 h-16 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin mb-4"></div>
        <p className="text-orange-500 font-black tracking-widest uppercase text-sm animate-pulse shadow-sm">Calculating Metrics...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fff8f6] py-12 px-4 sm:px-6 lg:px-8 font-sans relative overflow-hidden selection:bg-orange-500/20 text-stone-800">
      
      <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-rose-300/40 rounded-full blur-[120px] pointer-events-none mix-blend-multiply"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-orange-300/40 rounded-full blur-[120px] pointer-events-none mix-blend-multiply"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6 bg-white/60 backdrop-blur-xl p-6 md:p-8 rounded-[2rem] shadow-xl shadow-rose-900/5 border border-white">
          <div>
            <h1 className="text-4xl font-black text-stone-800 tracking-tight pb-1">
              System Analytics
            </h1>
            <p className="text-orange-600 font-black uppercase tracking-widest text-[10px] mt-1 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse"></span>
              Live Event Diagnostics
            </p>
          </div>
          <Link to="/dashboard" className="group flex items-center gap-2 bg-white/80 hover:bg-white border border-white text-stone-600 px-6 py-3 rounded-xl font-bold transition-all duration-300 transform hover:-translate-y-0.5 shadow-sm active:scale-95">
            <span className="text-xl group-hover:-translate-x-1 transition-transform text-stone-400">←</span>
            Back to Hub
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Card 1: Event Status */}
          <div className="bg-white/60 backdrop-blur-xl p-8 rounded-[2rem] shadow-xl shadow-rose-900/5 border border-white flex flex-col justify-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-orange-400/20 rounded-full blur-xl -mr-10 -mt-10"></div>
            <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-3 relative z-10">Event Lifecycle</p>
            <div className="flex justify-between items-end relative z-10">
              <div>
                <p className="text-4xl font-black text-stone-800">{stats.upcomingEvents}</p>
                <p className="text-xs font-bold text-orange-500 uppercase tracking-widest mt-1">Upcoming</p>
              </div>
              <div className="h-10 border-r-2 border-stone-200"></div>
              <div className="text-right">
                <p className="text-4xl font-black text-stone-400">{stats.completedEvents}</p>
                <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mt-1">Completed</p>
              </div>
            </div>
          </div>
          
          {/* Card 2: Total Check-Ins */}
          <div className="bg-white/60 backdrop-blur-xl p-8 rounded-[2rem] shadow-xl shadow-rose-900/5 border border-white flex flex-col justify-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-rose-400/20 rounded-full blur-xl -mr-10 -mt-10"></div>
            <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-2 relative z-10">Total Tickets Scanned</p>
            <div className="flex items-baseline gap-3 relative z-10">
              <p className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-rose-500 relative z-10">
                {stats.totalCheckedIn}
              </p>
              <p className="text-sm font-bold text-stone-400">/ {stats.totalRegistrations} Reg.</p>
            </div>
          </div>

          {/* Card 3: Turnout Rate */}
          <div className="bg-white/60 backdrop-blur-xl p-8 rounded-[2rem] shadow-xl shadow-rose-900/5 border border-white flex flex-col justify-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-400/20 rounded-full blur-xl -mr-10 -mt-10"></div>
            <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-2 relative z-10">Actual Turnout Rate</p>
            <div className="flex items-baseline gap-2 relative z-10">
              <p className="text-5xl font-black text-stone-800">{stats.turnoutRate}</p>
              <span className="text-2xl font-bold text-stone-400">%</span>
            </div>
            <div className="w-full bg-stone-200 h-2 rounded-full mt-4 overflow-hidden relative z-10">
              <div className="bg-gradient-to-r from-emerald-400 to-teal-400 h-full rounded-full" style={{ width: `${stats.turnoutRate}%` }}></div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <div className="lg:col-span-2 bg-white/60 backdrop-blur-xl p-6 sm:p-8 rounded-[2rem] shadow-xl shadow-rose-900/5 border border-white">
            <h3 className="text-sm font-black text-stone-500 uppercase tracking-widest mb-6 ml-2">Capacity vs Registrations vs Scanned</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.eventData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorReg" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorCheck" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#78716c', fontWeight: 'bold' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#78716c', fontWeight: 'bold' }} />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="capacity" stroke="#d6d3d1" strokeWidth={3} fill="transparent" name="Capacity" />
                  <Area type="monotone" dataKey="registered" stroke="#f97316" strokeWidth={4} fillOpacity={1} fill="url(#colorReg)" name="Registered" />
                  <Area type="monotone" dataKey="checkedIn" stroke="#10b981" strokeWidth={4} fillOpacity={1} fill="url(#colorCheck)" name="Checked-In" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white/60 backdrop-blur-xl p-6 sm:p-8 rounded-[2rem] shadow-xl shadow-rose-900/5 border border-white flex flex-col items-center justify-center">
            <h3 className="text-sm font-black text-stone-500 uppercase tracking-widest mb-2 w-full">Event Distribution</h3>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={stats.categoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none">
                    {stats.categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap justify-center gap-3 mt-4">
              {stats.categoryData.map((entry, index) => (
                <div key={index} className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                  <span className="text-[10px] font-black text-stone-600 uppercase tracking-wider">{entry.name}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;