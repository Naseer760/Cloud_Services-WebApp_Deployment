import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard,
  PlusCircle,
  CheckCircle,
  Search,
  Bell,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Clock,
  Compass,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { userService, notificationService } from '../services/api';
import MatchBadge from '../components/MatchBadge';

export default function DashboardPage() {
  const { user } = useAuth();
  const [reportsData, setReportsData] = useState({ reports: [], counts: {} });
  const [recentNotifications, setRecentNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([userService.getMyReports(), notificationService.getNotifications()])
      .then(([repRes, notifRes]) => {
        if (repRes.data.success) {
          setReportsData({
            reports: repRes.data.reports || [],
            counts: repRes.data.counts || {},
          });
        }
        if (notifRes.data.success) {
          setRecentNotifications((notifRes.data.notifications || []).slice(0, 5));
        }
      })
      .catch((err) => console.error('Error fetching dashboard data:', err))
      .finally(() => setLoading(false));
  }, []);

  const counts = reportsData.counts;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Welcome Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-brand-950 to-brand-900 text-white p-8 sm:p-10 shadow-xl border border-slate-800">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-500/20 text-accent-300 text-xs font-bold border border-accent-500/30">
            <Compass className="w-3.5 h-3.5" />
            University Lost &amp; Found Portal
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            Student ID: <strong className="text-white">{user?.studentId}</strong> | Department: {user?.department || 'General'}
          </p>
          <div className="flex flex-wrap gap-3 pt-3">
            <Link
              to="/report-lost"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 shadow-md transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              Report Lost Item
            </Link>
            <Link
              to="/report-found"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-md transition-all"
            >
              <CheckCircle className="w-4 h-4" />
              Register Found Item
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">My Total Reports</span>
            <span className="text-2xl font-extrabold text-slate-900 mt-1 block">{counts.total || 0}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold">
            {counts.total || 0}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-rose-500 uppercase tracking-wider block">Active Lost</span>
            <span className="text-2xl font-extrabold text-rose-600 mt-1 block">{counts.lostCount || 0}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
            {counts.lostCount || 0}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-emerald-500 uppercase tracking-wider block">Active Found</span>
            <span className="text-2xl font-extrabold text-emerald-600 mt-1 block">{counts.foundCount || 0}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            {counts.foundCount || 0}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-purple-500 uppercase tracking-wider block">Recovered</span>
            <span className="text-2xl font-extrabold text-purple-600 mt-1 block">{counts.recoveredCount || 0}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            {counts.recoveredCount || 0}
          </div>
        </div>
      </div>

      {/* Main Grid: Recent Notifications / Alerts & My Recent Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Live Alerts & Match Feed */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-accent-500" />
              <h3 className="text-lg font-bold text-slate-900">Recent Live Alerts</h3>
            </div>
            <Link
              to="/notifications"
              className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
            >
              View All &rarr;
            </Link>
          </div>

          {recentNotifications.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-xs">
              No recent notifications or match suggestions yet.
            </div>
          ) : (
            <div className="space-y-3">
              {recentNotifications.map((notif) => {
                const targetItemId = notif.relatedItemId?._id || notif.relatedItemId;
                return (
                  <div
                    key={notif._id}
                    className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-start justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{notif.title}</span>
                        {notif.metadata?.score && <MatchBadge score={notif.metadata.score} />}
                      </div>
                      <p className="text-slate-600 line-clamp-2">{notif.message}</p>
                      <span className="text-[10px] text-slate-400 block">
                        {new Date(notif.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    {targetItemId && (
                      <Link
                        to={`/items/${targetItemId}`}
                        className="px-2.5 py-1.5 rounded-lg bg-brand-50 text-brand-700 font-bold text-[11px] shrink-0 hover:bg-brand-100"
                      >
                        Inspect
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Recent Personal Reports */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <LayoutDashboard className="w-5 h-5 text-brand-600" />
              <h3 className="text-lg font-bold text-slate-900">My Recent Reports</h3>
            </div>
            <Link
              to="/my-reports"
              className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
            >
              All Reports ({reportsData.reports.length}) &rarr;
            </Link>
          </div>

          {reportsData.reports.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-xs">
              You haven't submitted any reports yet.
            </div>
          ) : (
            <div className="space-y-3">
              {reportsData.reports.slice(0, 5).map((rep) => (
                <div
                  key={rep._id}
                  className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1 truncate flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase text-white ${
                          rep.type === 'LOST' ? 'bg-rose-600' : 'bg-emerald-600'
                        }`}
                      >
                        {rep.type}
                      </span>
                      <span className="font-bold text-slate-900 truncate">{rep.title}</span>
                    </div>
                    <span className="text-[11px] text-slate-500 block truncate">
                      {rep.location} &bull; {new Date(rep.dateOccurred).toLocaleDateString()}
                    </span>
                  </div>

                  <Link
                    to={`/items/${rep._id}`}
                    className="px-2.5 py-1.5 rounded-lg bg-brand-50 text-brand-700 font-bold text-[11px] shrink-0 hover:bg-brand-100"
                  >
                    View
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
