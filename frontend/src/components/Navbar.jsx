import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BrainCircuit, History, LayoutDashboard, LogOut, X, AlertTriangle } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setShowLogoutModal(false);
  };

  if (!user) return null;

  return (
    <>
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <Link to="/dashboard" className="flex items-center gap-2 group">
              <div className="bg-white overflow-hidden p-0.5 rounded-xl shadow-lg shadow-indigo-200 group-hover:scale-110 transition-transform">
                <img src="/favicon.png" alt="ScaleForge" className="w-8 h-8 object-contain" />
              </div>
              <span className="text-2xl font-black text-slate-800 tracking-tighter">ScaleForge</span>
            </Link>

            <div className="flex items-center gap-6">
              <Link to="/dashboard" className="flex items-center gap-1 text-slate-600 hover:text-indigo-600 font-medium text-sm">
                <LayoutDashboard className="w-5 h-5" />
                <span className="hidden md:inline">Dashboard</span>
              </Link>
              <Link to="/interview" className="flex items-center gap-1 text-slate-600 hover:text-indigo-600 font-medium text-sm">
                <BrainCircuit className="w-5 h-5" />
                <span className="hidden md:inline">New Interview</span>
              </Link>
              <Link to="/history" className="flex items-center gap-1 text-slate-600 hover:text-indigo-600 font-medium text-sm">
                <History className="w-5 h-5" />
                <span className="hidden md:inline">History</span>
              </Link>
              <button 
                onClick={() => setShowLogoutModal(true)}
                className="flex items-center gap-1 text-slate-600 hover:text-red-600 font-medium ml-4 text-sm"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl p-8 text-center space-y-6 animate-in zoom-in-95 duration-200">
            <div className="bg-red-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-slate-900">Are you sure?</h3>
              <p className="text-slate-500 text-sm">You will be logged out of your session.</p>
            </div>

            <div className="flex flex-col gap-3">
              <button 
                onClick={handleLogout}
                className="w-full py-3.5 bg-red-600 text-white rounded-2xl font-bold hover:bg-red-700 transition-colors shadow-lg shadow-red-100"
              >
                Yes, Logout
              </button>
              <button 
                onClick={() => setShowLogoutModal(false)}
                className="w-full py-3.5 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
