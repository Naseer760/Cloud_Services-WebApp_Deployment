import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, X, ArrowRight, Bell } from 'lucide-react';
import { useSocket } from '../context/SocketContext';

export default function Toast() {
  const { liveAlert, clearLiveAlert } = useSocket();
  const navigate = useNavigate();

  useEffect(() => {
    if (liveAlert) {
      const timer = setTimeout(() => {
        clearLiveAlert();
      }, 9000);
      return () => clearTimeout(timer);
    }
  }, [liveAlert, clearLiveAlert]);

  if (!liveAlert) return null;

  const handleAction = () => {
    if (liveAlert.itemId) {
      navigate(`/items/${liveAlert.itemId}`);
    } else {
      navigate('/notifications');
    }
    clearLiveAlert();
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full animate-bounce-subtle">
      <div className="bg-slate-900 text-white rounded-2xl p-4 shadow-2xl border border-accent-500/30 flex items-start gap-3 backdrop-blur-xl">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-accent-500 flex items-center justify-center shrink-0 shadow-glow">
          {liveAlert.score ? (
            <Sparkles className="w-5 h-5 text-white animate-spin-slow" />
          ) : (
            <Bell className="w-5 h-5 text-white" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1 mb-1">
            <h4 className="text-sm font-bold text-white truncate">{liveAlert.title}</h4>
            <button
              onClick={clearLiveAlert}
              className="text-slate-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-slate-300 line-clamp-2 mb-2 leading-relaxed">
            {liveAlert.message}
          </p>

          <button
            onClick={handleAction}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-accent-400 hover:text-accent-300 transition-colors"
          >
            <span>Inspect Matched Report</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
