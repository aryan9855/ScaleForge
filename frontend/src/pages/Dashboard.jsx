import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { BrainCircuit, History, Award, BookOpen, ArrowRight } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const { data } = await api.get('/interview/history');
        setHistory(data); // Store ALL history for total metrics
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const averageScore = history.length > 0 
    ? (history.reduce((acc, curr) => acc + curr.feedback.score, 0) / history.length).toFixed(1)
    : 0;

  // Calculate dynamic "Top Skill" from strengths
  const calculateTopSkill = () => {
    if (history.length === 0) return "Architecture";
    const allStrengths = history.flatMap(h => h.feedback.strengths || []).join(' ').toLowerCase();
    
    const SKILLS = [
      'Scalability', 'Database', 'Caching', 'Load Balancing', 
      'Microservices', 'API Design', 'Security', 'Availability', 
      'Consistency', 'Architecture', 'Data Modeling', 'Messaging', 
      'Performance', 'Reliability', 'Monitoring'
    ];

    const counts = SKILLS.reduce((acc, skill) => {
      const regex = new RegExp(skill.toLowerCase(), 'g');
      const matches = allStrengths.match(regex);
      if (matches) acc[skill] = (acc[skill] || 0) + matches.length;
      return acc;
    }, {});

    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    return sorted.length > 0 ? sorted[0][0] : "Architecture";
  };

  const topSkill = calculateTopSkill();

  // Get only the 3 most recent for the UI list
  const recentAttempts = history.slice(0, 3);

  return (
    <div className="space-y-8">
      <header className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
        <h1 className="text-3xl font-bold text-slate-900">Hello, {user?.name}! 👋</h1>
        <p className="text-slate-500 mt-2">Ready to master System Design with ScaleForge? Start a new interview or review your progress.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="bg-indigo-50 p-1 rounded-xl">
            <img src="/favicon.png" alt="ScaleForge" className="w-10 h-10 object-contain" />
          </div>
          <div>
            <p className="text-sm text-slate-500">Total Attempts</p>
            <p className="text-2xl font-bold text-slate-900">{history.length}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="bg-emerald-100 p-3 rounded-xl">
            <Award className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <p className="text-sm text-slate-500">Average Score</p>
            <p className="text-2xl font-bold text-slate-900">{averageScore}/10</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="bg-amber-100 p-3 rounded-xl">
            <BookOpen className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <p className="text-sm text-slate-500">Top Skill</p>
            <p className="text-2xl font-bold tracking-tight text-slate-900 capitalize">{topSkill}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <History className="w-5 h-5 text-indigo-600" /> Recent Attempts
            </h2>
            <Link to="/history" className="text-indigo-600 hover:underline text-sm font-semibold">View All</Link>
          </div>
          
          {loading ? (
            <p>Loading history...</p>
          ) : recentAttempts.length > 0 ? (
            <div className="space-y-4">
              {recentAttempts.map((attempt) => (
                <div key={attempt._id} className="p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-indigo-200 transition-colors">
                  <p className="font-semibold text-slate-800 line-clamp-1">{attempt.question}</p>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-slate-400">{new Date(attempt.createdAt).toLocaleDateString()}</span>
                    <span className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded text-xs font-bold">Score: {attempt.feedback.score}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 text-center py-8">No attempts yet. Start your first session!</p>
          )}
        </section>

        <section className="bg-indigo-600 p-8 rounded-2xl shadow-xl text-white flex flex-col justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-4">Practice Makes Perfect</h2>
            <p className="text-indigo-100 text-lg mb-8">
              Generate a unique System Design question tailored to industry standards and get instant AI feedback.
            </p>
          </div>
          <Link 
            to="/interview" 
            className="bg-white text-indigo-600 px-6 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors shadow-lg shadow-indigo-800/20"
          >
            Start New Session <ArrowRight className="w-5 h-5" />
          </Link>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
