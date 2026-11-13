import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldAlert,
  FileCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Layers,
  Users,
  Sparkles,
  ArrowRight,
  Eye,
  CheckCircle,
  XCircle,
  RefreshCw,
} from 'lucide-react';
import { adminService } from '../services/api';
import MatchBadge from '../components/MatchBadge';

export default function AdminDashboardPage() {
  const [data, setData] = useState({
    metrics: {},
    recentReports: [],
    recentMatches: [],
  });
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = () => {
    setLoading(true);
    adminService
      .getDashboardStats()
      .then((res) => {
        if (res.data.success) {
          setData({
            metrics: res.data.metrics || {},
            recentReports: res.data.recentReports || [],
            recentMatches: res.data.recentMatches || [],
          });
        }
      })
      .catch((err) => console.error('Error fetching admin dashboard stats:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const metrics = data.metrics;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold uppercase tracking-wider mb-2">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-700" />
            Campus Administration Control Center
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Administrative Moderation Dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time platform metrics, report moderation queues, and heuristic match oversight.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchDashboardData}
            className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors shadow-sm"
            title="Refresh metrics"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <Link
            to="/admin/reports"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 shadow-md transition-all"
          >
            <span>Manage All Reports</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Total Active
          </span>
          <span className="text-2xl font-extrabold text-slate-900 mt-1 block">
            {metrics.totalReports || 0}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider block">
            Pending Review
          </span>
          <span className="text-2xl font-extrabold text-amber-600 mt-1 block">
            {metrics.pendingVerification || 0}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold text-rose-600 uppercase tracking-wider block">
            Active Lost
          </span>
          <span className="text-2xl font-extrabold text-rose-600 mt-1 block">
            {metrics.activeLost || 0}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider block">
            Active Found
          </span>
          <span className="text-2xl font-extrabold text-emerald-600 mt-1 block">
            {metrics.activeFound || 0}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold text-purple-600 uppercase tracking-wider block">
            Recovered
          </span>
          <span className="text-2xl font-extrabold text-purple-600 mt-1 block">
            {metrics.recoveredItems || 0}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider block">
            Registered Students
          </span>
          <span className="text-2xl font-extrabold text-blue-600 mt-1 block">
            {metrics.totalStudents || 0}
          </span>
        </div>
      </div>

      {/* Pending Moderation Callout */}
      {metrics.pendingVerification > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-amber-900">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-amber-600 shrink-0" />
            <span className="text-xs font-bold">
              You have {metrics.pendingVerification} reports awaiting verification review.
            </span>
          </div>
          <Link
            to="/admin/reports?verificationStatus=PENDING"
            className="px-4 py-1.5 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-500 shadow-sm text-center"
          >
            Review Pending Queue &rarr;
          </Link>
        </div>
      )}

      {/* Grid: Recent Submissions & Recent Matches */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Recent Activity Feed */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-brand-600" />
              Latest Campus Submissions
            </h3>
            <Link to="/admin/reports" className="text-xs font-bold text-brand-600 hover:text-brand-700">
              View All &rarr;
            </Link>
          </div>

          <div className="space-y-3">
            {data.recentReports.map((report) => (
              <div
                key={report._id}
                className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1 truncate flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase text-white ${
                        report.type === 'LOST' ? 'bg-rose-600' : 'bg-emerald-600'
                      }`}
                    >
                      {report.type}
                    </span>
                    <span className="font-bold text-slate-900 truncate">{report.title}</span>
                  </div>
                  <span className="text-[11px] text-slate-500 block truncate">
                    By {report.ownerId?.name || 'Student'} ({report.ownerId?.studentId}) &bull;{' '}
                    {report.location}
                  </span>
                </div>

                <Link
                  to={`/items/${report._id}`}
                  className="px-3 py-1.5 rounded-lg bg-brand-50 text-brand-700 font-bold text-[11px] shrink-0 hover:bg-brand-100"
                >
                  Inspect
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Heuristic Match Suggestions */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-accent-500" />
              Automated Match Correlations
            </h3>
            <span className="text-[11px] font-semibold text-slate-400">
              Total: {metrics.totalMatches || 0}
            </span>
          </div>

          <div className="space-y-3">
            {data.recentMatches.map((match) => (
              <div
                key={match._id}
                className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <MatchBadge score={match.matchingScore} />
                  <span className="text-[10px] font-bold text-slate-400 uppercase">
                    Status: {match.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200/60">
                  <div>
                    <span className="text-[10px] font-bold text-rose-600 block uppercase">Lost Item</span>
                    <span className="font-semibold text-slate-800 line-clamp-1">
                      {match.lostItemId?.title}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-emerald-600 block uppercase">Found Item</span>
                    <span className="font-semibold text-slate-800 line-clamp-1">
                      {match.foundItemId?.title}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
