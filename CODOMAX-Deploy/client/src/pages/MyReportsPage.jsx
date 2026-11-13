import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  PlusCircle,
  CheckCircle,
  Clock,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  Trash2,
  Eye,
  Layers,
  MapPin,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import { userService, itemService } from '../services/api';
import ConfirmModal from '../components/ConfirmModal';

export default function MyReportsPage() {
  const [reports, setReports] = useState([]);
  const [counts, setCounts] = useState({
    total: 0,
    lostCount: 0,
    foundCount: 0,
    activeCount: 0,
    recoveredCount: 0,
    pendingCount: 0,
    verifiedCount: 0,
    rejectedCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('ALL');

  // Modal actions
  const [selectedItem, setSelectedItem] = useState(null);
  const [recoverModalOpen, setRecoverModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchMyReports = () => {
    setLoading(true);
    userService
      .getMyReports()
      .then((res) => {
        if (res.data.success) {
          setReports(res.data.reports || []);
          setCounts(res.data.counts || {});
        }
      })
      .catch((err) => console.error('Error fetching my reports:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchMyReports();
  }, []);

  const handleMarkRecovered = async () => {
    if (!selectedItem) return;
    setActionLoading(true);
    try {
      const res = await itemService.markRecovered(selectedItem._id);
      if (res.data.success) {
        setRecoverModalOpen(false);
        setSelectedItem(null);
        fetchMyReports();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to mark as recovered.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (reason) => {
    if (!selectedItem) return;
    setActionLoading(true);
    try {
      const res = await itemService.deleteItem(selectedItem._id, reason);
      if (res.data.success) {
        setDeleteModalOpen(false);
        setSelectedItem(null);
        fetchMyReports();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to remove report.');
    } finally {
      setActionLoading(false);
    }
  };

  // Filter based on active tab
  const filteredReports = reports.filter((r) => {
    if (tab === 'ALL') return true;
    if (tab === 'LOST') return r.type === 'LOST';
    if (tab === 'FOUND') return r.type === 'FOUND';
    if (tab === 'RECOVERED') return r.status === 'RECOVERED';
    if (tab === 'PENDING') return r.verificationStatus === 'PENDING';
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Title & Submission Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            My Submitted Reports
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Track, update, and manage your campus lost and found listings in one place.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/report-lost"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 shadow-sm"
          >
            <PlusCircle className="w-4 h-4" />
            Report Lost
          </Link>
          <Link
            to="/report-found"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-sm"
          >
            <CheckCircle className="w-4 h-4" />
            Report Found
          </Link>
        </div>
      </div>

      {/* Metrics Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Total Reports</span>
          <span className="text-2xl font-extrabold text-slate-900 mt-1 block">{counts.total || 0}</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-rose-500 uppercase tracking-wider block">Lost Items</span>
          <span className="text-2xl font-extrabold text-rose-600 mt-1 block">{counts.lostCount || 0}</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-emerald-500 uppercase tracking-wider block">Found Items</span>
          <span className="text-2xl font-extrabold text-emerald-600 mt-1 block">{counts.foundCount || 0}</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-purple-500 uppercase tracking-wider block">Recovered</span>
          <span className="text-2xl font-extrabold text-purple-600 mt-1 block">{counts.recoveredCount || 0}</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-amber-500 uppercase tracking-wider block">Pending Review</span>
          <span className="text-2xl font-extrabold text-amber-600 mt-1 block">{counts.pendingCount || 0}</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-blue-500 uppercase tracking-wider block">Verified</span>
          <span className="text-2xl font-extrabold text-blue-600 mt-1 block">{counts.verifiedCount || 0}</span>
        </div>
      </div>

      {/* Tabs Filter */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        {[
          { id: 'ALL', label: 'All Reports', count: counts.total },
          { id: 'LOST', label: 'Lost Items', count: counts.lostCount },
          { id: 'FOUND', label: 'Found Items', count: counts.foundCount },
          { id: 'RECOVERED', label: 'Recovered Archive', count: counts.recoveredCount },
          { id: 'PENDING', label: 'Pending Verification', count: counts.pendingCount },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              tab === t.id
                ? 'bg-brand-600 text-white shadow-md'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span>{t.label}</span>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                tab === t.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
              }`}
            >
              {t.count || 0}
            </span>
          </button>
        ))}
      </div>

      {/* Report List Content */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-28 rounded-2xl bg-slate-200/70 animate-pulse" />
          ))}
        </div>
      ) : filteredReports.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 p-8 space-y-3">
          <Layers className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No reports found in this view</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            You currently do not have any items matching the "{tab}" tab.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReports.map((item) => {
            const isLost = item.type === 'LOST';
            const isRecovered = item.status === 'RECOVERED';
            const isVerified = item.verificationStatus === 'VERIFIED';
            const isRejected = item.verificationStatus === 'REJECTED';

            return (
              <div
                key={item._id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                {/* Left Section: Details */}
                <div className="flex items-start gap-4 flex-1">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-16 h-16 rounded-xl object-cover shrink-0 border border-slate-200"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 shrink-0 font-bold text-xs uppercase">
                      {item.category.slice(0, 3)}
                    </div>
                  )}

                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider text-white ${
                          isLost ? 'bg-rose-600' : 'bg-emerald-600'
                        }`}
                      >
                        {item.type}
                      </span>

                      {isRecovered && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-purple-100 text-purple-700 border border-purple-200 flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          Recovered
                        </span>
                      )}

                      {isVerified ? (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-blue-100 text-blue-700 border border-blue-200 flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3" />
                          Verified
                        </span>
                      ) : isRejected ? (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-rose-100 text-rose-700 border border-rose-200 flex items-center gap-1">
                          <ShieldAlert className="w-3 h-3" />
                          Rejected
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-amber-100 text-amber-700 border border-amber-200 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Pending Review
                        </span>
                      )}

                      <span className="text-xs font-semibold text-slate-400">[{item.category}]</span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 truncate">{item.title}</h3>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-0.5">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {item.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {new Date(item.dateOccurred).toLocaleDateString()}
                      </span>
                    </div>

                    {isRejected && item.rejectionReason && (
                      <p className="text-xs text-rose-600 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-100 mt-1">
                        Reason: {item.rejectionReason}
                      </p>
                    )}
                  </div>
                </div>

                {/* Right Action Buttons */}
                <div className="flex items-center gap-2 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 shrink-0">
                  <Link
                    to={`/items/${item._id}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-brand-700 bg-brand-50 hover:bg-brand-100 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Inspect Details
                  </Link>

                  {!isRecovered && (
                    <button
                      onClick={() => {
                        setSelectedItem(item);
                        setRecoverModalOpen(true);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-sm transition-colors"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Mark Recovered
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setSelectedItem(item);
                      setDeleteModalOpen(true);
                    }}
                    title="Remove report"
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Confirmation Modals */}
      <ConfirmModal
        isOpen={recoverModalOpen}
        onClose={() => {
          setRecoverModalOpen(false);
          setSelectedItem(null);
        }}
        onConfirm={handleMarkRecovered}
        loading={actionLoading}
        title="Mark Report as Recovered?"
        message={`Confirm that "${selectedItem?.title}" has been safely returned. This will move the item to your recovered archive.`}
        confirmText="Confirm Recovery"
      />

      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setSelectedItem(null);
        }}
        onConfirm={handleDelete}
        loading={actionLoading}
        isDanger={true}
        showReasonInput={true}
        title="Cancel & Remove Report?"
        message={`Are you sure you want to remove the report "${selectedItem?.title}"?`}
        confirmText="Remove Report"
      />
    </div>
  );
}
