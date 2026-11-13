import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  ShieldAlert,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Trash2,
  Eye,
  RefreshCw,
  Clock,
  Layers,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';
import { adminService } from '../services/api';
import ConfirmModal from '../components/ConfirmModal';

const CATEGORIES = [
  'ALL',
  'ID Card',
  'Mobile Phone',
  'Wallet',
  'Books',
  'Calculator',
  'Bag',
  'Electronics',
  'Keys',
  'Accessories',
  'Documents',
  'Other',
];

export default function AdminReportsPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [reports, setReports] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1, limit: 15 });
  const [loading, setLoading] = useState(true);

  // Filters
  const [type, setType] = useState(searchParams.get('type') || 'ALL');
  const [category, setCategory] = useState(searchParams.get('category') || 'ALL');
  const [status, setStatus] = useState(searchParams.get('status') || 'ALL');
  const [verificationStatus, setVerificationStatus] = useState(
    searchParams.get('verificationStatus') || 'ALL'
  );
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [includeDeleted, setIncludeDeleted] = useState(false);
  const [page, setPage] = useState(1);

  // Modal states
  const [selectedReport, setSelectedReport] = useState(null);
  const [actionType, setActionType] = useState(null); // 'VERIFY', 'REJECT', 'STATUS', 'DELETE'
  const [modalOpen, setModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchReports = () => {
    setLoading(true);
    const params = {
      page,
      limit: 15,
      type: type !== 'ALL' ? type : undefined,
      category: category !== 'ALL' ? category : undefined,
      status: status !== 'ALL' ? status : undefined,
      verificationStatus: verificationStatus !== 'ALL' ? verificationStatus : undefined,
      search: search.trim() ? search.trim() : undefined,
      includeDeleted: includeDeleted ? 'true' : 'false',
    };

    adminService
      .getAllReports(params)
      .then((res) => {
        if (res.data.success) {
          setReports(res.data.reports || []);
          setPagination(res.data.pagination || { total: 0, page: 1, pages: 1, limit: 15 });
        }
      })
      .catch((err) => console.error('Error fetching admin reports:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchReports();
  }, [type, category, status, verificationStatus, includeDeleted, page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchReports();
  };

  // Perform moderation action
  const handleConfirmAction = async (reason) => {
    if (!selectedReport) return;
    setActionLoading(true);

    try {
      if (actionType === 'VERIFY') {
        await adminService.verifyReport(selectedReport._id);
      } else if (actionType === 'REJECT') {
        await adminService.rejectReport(selectedReport._id, reason);
      } else if (actionType === 'DELETE') {
        await adminService.deleteReport(selectedReport._id, reason);
      }
      setModalOpen(false);
      setSelectedReport(null);
      fetchReports();
    } catch (err) {
      alert(err.response?.data?.message || 'Operation failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleStatusChange = async (reportId, newStatus) => {
    try {
      await adminService.updateReportStatus(reportId, newStatus);
      fetchReports();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Campus Report Moderation
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Review submitted reports, verify authentic claims, reject spam, and moderate content.
          </p>
        </div>

        <Link
          to="/admin"
          className="text-xs font-bold text-slate-600 hover:text-brand-600 flex items-center gap-1.5"
        >
          &larr; Back to Admin Overview
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search reports by title, student name, or location..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 transition-colors"
          >
            Filter Records
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-3 pt-2 text-xs border-t border-slate-100">
          {/* Type Filter */}
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-500">Type:</span>
            <select
              value={type}
              onChange={(e) => {
                setType(e.target.value);
                setPage(1);
              }}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white"
            >
              <option value="ALL">All Types</option>
              <option value="LOST">Lost</option>
              <option value="FOUND">Found</option>
            </select>
          </div>

          {/* Verification Status */}
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-500">Verification:</span>
            <select
              value={verificationStatus}
              onChange={(e) => {
                setVerificationStatus(e.target.value);
                setPage(1);
              }}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white"
            >
              <option value="ALL">All Verification</option>
              <option value="PENDING">Pending Only</option>
              <option value="VERIFIED">Verified</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-500">Status:</span>
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white"
            >
              <option value="ALL">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="RECOVERED">Recovered</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-500">Category:</span>
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setPage(1);
              }}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Include Deleted Checkbox */}
          <label className="flex items-center gap-2 cursor-pointer ml-auto">
            <input
              type="checkbox"
              checked={includeDeleted}
              onChange={(e) => {
                setIncludeDeleted(e.target.checked);
                setPage(1);
              }}
              className="w-4 h-4 text-brand-600 rounded"
            />
            <span className="font-semibold text-slate-600">Show Soft-Deleted</span>
          </label>
        </div>
      </div>

      {/* Moderation Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold">
                <th className="py-3.5 px-4">Type</th>
                <th className="py-3.5 px-4">Item &amp; Category</th>
                <th className="py-3.5 px-4">Student Reporter</th>
                <th className="py-3.5 px-4">Campus Location</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Verification</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Moderation Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-brand-600" />
                    Loading report queue...
                  </td>
                </tr>
              ) : reports.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-slate-400">
                    No reports match the selected administrative filters.
                  </td>
                </tr>
              ) : (
                reports.map((r) => {
                  const isLost = r.type === 'LOST';
                  const isVerified = r.verificationStatus === 'VERIFIED';
                  const isPending = r.verificationStatus === 'PENDING';
                  const isRejected = r.verificationStatus === 'REJECTED';

                  return (
                    <tr
                      key={r._id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        r.isDeleted ? 'bg-rose-50/30' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase text-white ${
                            isLost ? 'bg-rose-600' : 'bg-emerald-600'
                          }`}
                        >
                          {r.type}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 max-w-[200px]">
                        <span className="font-bold text-slate-900 block truncate">{r.title}</span>
                        <span className="text-[11px] text-slate-400 font-semibold">{r.category}</span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-800 block">
                          {r.ownerId?.name || 'Unknown'}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {r.ownerId?.studentId || 'N/A'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 max-w-[150px] truncate text-slate-600">
                        {r.location}
                      </td>

                      <td className="py-3.5 px-4 text-slate-500">
                        {new Date(r.dateOccurred).toLocaleDateString()}
                      </td>

                      <td className="py-3.5 px-4">
                        {isVerified && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-100 text-blue-800 flex items-center gap-1 w-fit">
                            <ShieldCheck className="w-3 h-3" />
                            Verified
                          </span>
                        )}
                        {isPending && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-100 text-amber-800 flex items-center gap-1 w-fit">
                            <Clock className="w-3 h-3" />
                            Pending
                          </span>
                        )}
                        {isRejected && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-rose-100 text-rose-800 flex items-center gap-1 w-fit">
                            <XCircle className="w-3 h-3" />
                            Rejected
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <select
                          value={r.status}
                          onChange={(e) => handleStatusChange(r._id, e.target.value)}
                          className="px-2 py-1 rounded-md border border-slate-200 bg-white text-[11px] font-semibold text-slate-700"
                        >
                          <option value="ACTIVE">ACTIVE</option>
                          <option value="RECOVERED">RECOVERED</option>
                          <option value="CLOSED">CLOSED</option>
                        </select>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            to={`/items/${r._id}`}
                            title="Inspect details"
                            className="p-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Link>

                          {isPending && (
                            <>
                              <button
                                onClick={() => {
                                  setSelectedReport(r);
                                  setActionType('VERIFY');
                                  setModalOpen(true);
                                }}
                                title="Approve and verify report"
                                className="p-1.5 rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => {
                                  setSelectedReport(r);
                                  setActionType('REJECT');
                                  setModalOpen(true);
                                }}
                                title="Reject report"
                                className="p-1.5 rounded-lg bg-amber-100 text-amber-700 hover:bg-amber-200"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}

                          {!r.isDeleted && (
                            <button
                              onClick={() => {
                                setSelectedReport(r);
                                setActionType('DELETE');
                                setModalOpen(true);
                              }}
                              title="Soft delete / remove report"
                              className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-slate-200 text-xs text-slate-500">
            <span>
              Page {pagination.page} of {pagination.pages} ({pagination.total} total reports)
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-30"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                disabled={page === pagination.pages}
                className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-30"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedReport(null);
        }}
        onConfirm={handleConfirmAction}
        loading={actionLoading}
        title={
          actionType === 'VERIFY'
            ? 'Verify Legitimate Report?'
            : actionType === 'REJECT'
            ? 'Reject Inappropriate Report?'
            : 'Remove / Soft-Delete Report?'
        }
        message={
          actionType === 'VERIFY'
            ? `Confirm verification for "${selectedReport?.title}". The reporter will receive an official verification badge.`
            : actionType === 'REJECT'
            ? `Please specify why "${selectedReport?.title}" is being rejected.`
            : `Confirm removal of "${selectedReport?.title}". Moderation audit trails will be preserved in the system.`
        }
        showReasonInput={actionType === 'REJECT' || actionType === 'DELETE'}
        isDanger={actionType === 'REJECT' || actionType === 'DELETE'}
        confirmText={
          actionType === 'VERIFY'
            ? 'Verify Report'
            : actionType === 'REJECT'
            ? 'Reject Report'
            : 'Remove Report'
        }
      />
    </div>
  );
}
