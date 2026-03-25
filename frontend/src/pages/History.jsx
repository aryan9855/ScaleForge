import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { History as HistoryIcon, Search, Calendar, Award, X, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

const History = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const navigate = useNavigate();

  const fetchHistory = async () => {
    try {
      const { data } = await api.get('/interview/history');
      setHistory(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleRetry = (q) => {
    navigate('/interview', { state: { retryQuestion: q } });
  };

  const filteredHistory = history.filter(item => 
    item.question.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Your Progress</h1>
          <p className="text-slate-500">Track and review all your previous design sessions</p>
        </div>
        
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search questions..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20">
          <p className="text-slate-500">Loading your history...</p>
        </div>
      ) : filteredHistory.length > 0 ? (
        <div className="grid grid-cols-1 gap-6">
          {filteredHistory.map((item) => (
            <div key={item._id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-all">
              <div className="flex flex-col lg:flex-row justify-between gap-6">
                <div className="flex-1 space-y-4">
                  <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-indigo-600">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1 bg-indigo-50 px-2 py-0.5 rounded">
                      <Award className="w-3 h-3" /> Score: {item.feedback.score}/10
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 line-clamp-2">{item.question}</h3>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <p className="text-sm font-bold text-slate-400 uppercase mb-2">Your Answer Snippet</p>
                    <p className="text-slate-600 text-sm line-clamp-1 italic">"{item.userAnswer}"</p>
                  </div>
                </div>

                <div className="lg:w-80 space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-100">
                      <p className="text-xs font-bold text-emerald-800 uppercase mb-1">Strengths</p>
                      <p className="text-xl font-black text-emerald-600">{item.feedback.strengths.length}</p>
                    </div>
                    <div className="bg-amber-50 p-3 rounded-xl border border-amber-100">
                      <p className="text-xs font-bold text-amber-800 uppercase mb-1">Missing</p>
                      <p className="text-xl font-black text-amber-600">{item.feedback.missingPoints.length}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleRetry(item.question)}
                      className="flex-1 py-2.5 bg-indigo-50 text-indigo-600 font-bold rounded-xl text-sm hover:bg-indigo-100 transition-colors flex items-center justify-center gap-1"
                    >
                      <RefreshCw className="w-3.5 h-3.5" /> Try Again
                    </button>
                    <button 
                      onClick={() => setSelectedItem(item)}
                      className="flex-1 py-2.5 bg-slate-900 text-white font-bold rounded-xl text-sm hover:bg-slate-800 transition-colors"
                    >
                      Full Details
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white p-20 rounded-3xl shadow-sm border border-slate-200 border-dashed text-center">
          <HistoryIcon className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-900">No results found</h3>
          <p className="text-slate-500 mt-2">Try a different search term or start a new interview.</p>
        </div>
      )}

      {/* Feedback Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="sticky top-0 bg-white border-b border-slate-100 p-6 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Session Feedback</h3>
                <p className="text-sm text-slate-500">{new Date(selectedItem.createdAt).toLocaleDateString()}</p>
              </div>
              <button 
                onClick={() => setSelectedItem(null)}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-slate-400" />
              </button>
            </div>

            <div className="p-8 space-y-8">
              <div className="bg-indigo-600 rounded-2xl p-6 text-white flex justify-between items-center shadow-lg shadow-indigo-100">
                <div>
                  <h4 className="text-sm font-bold uppercase tracking-widest opacity-80">Final Score</h4>
                  <p className="text-4xl font-black">{selectedItem.feedback.score}/10</p>
                </div>
                <Award className="w-12 h-12 opacity-30" />
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-lg font-bold text-slate-900">Problem Statement</h4>
                  <button 
                    onClick={() => handleRetry(selectedItem.question)}
                    className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition-colors"
                  >
                    <RefreshCw className="w-3 h-3" /> Answer Again
                  </button>
                </div>
                <p className="text-slate-600 leading-relaxed font-semibold p-6 bg-slate-50 rounded-2xl border border-slate-100">{selectedItem.question}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-100">
                  <h5 className="flex items-center gap-2 text-emerald-800 font-bold mb-4">
                    <CheckCircle2 className="w-5 h-5" /> Key Strengths
                  </h5>
                  <ul className="space-y-2">
                    {selectedItem.feedback.strengths.map((s, i) => (
                      <li key={i} className="text-emerald-700 text-sm flex gap-2">
                        <span className="font-bold text-emerald-300">•</span> {s}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="p-6 bg-amber-50 rounded-2xl border border-amber-100">
                  <h5 className="flex items-center gap-2 text-amber-800 font-bold mb-4">
                    <AlertCircle className="w-5 h-5" /> Missing Points
                  </h5>
                  <ul className="space-y-2">
                    {selectedItem.feedback.missingPoints.map((m, i) => (
                      <li key={i} className="text-amber-700 text-sm flex gap-2">
                        <span className="font-bold text-amber-300">•</span> {m}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-lg font-bold text-slate-900">Your Past Answer</h4>
                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 text-slate-500 text-sm whitespace-pre-wrap italic">
                  "{selectedItem.userAnswer}"
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-lg font-bold text-slate-900">Ideal Recommendation</h4>
                <div className="p-6 bg-indigo-50 rounded-2xl border border-indigo-100 text-indigo-900 text-sm leading-relaxed whitespace-pre-wrap">
                  {selectedItem.feedback.idealAnswer}
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-slate-50 p-6 border-t border-slate-100 flex gap-4">
              <button 
                onClick={() => setSelectedItem(null)}
                className="flex-1 py-4 bg-white border border-slate-200 text-slate-600 rounded-2xl font-bold hover:bg-slate-100 transition-colors"
              >
                Close
              </button>
              <button 
                onClick={() => handleRetry(selectedItem.question)}
                className="flex-[2] py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-indigo-100"
              >
                <RefreshCw className="w-5 h-5" /> Retry Scenario
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default History;
