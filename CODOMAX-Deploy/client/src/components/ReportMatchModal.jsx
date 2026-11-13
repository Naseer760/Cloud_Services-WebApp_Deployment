import React, { useState, useEffect } from 'react';
import { X, Sparkles, CheckCircle2 } from 'lucide-react';
import { userService, itemService } from '../services/api';

export default function ReportMatchModal({ isOpen, onClose, targetItem }) {
  const [myReports, setMyReports] = useState([]);
  const [selectedReportId, setSelectedReportId] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && targetItem) {
      setFetching(true);
      userService
        .getMyReports()
        .then((res) => {
          if (res.data.success) {
            // Find opposite reports (e.g. if target is LOST, user needs FOUND; if target is FOUND, user needs LOST)
            const targetOppositeType = targetItem.type === 'LOST' ? 'FOUND' : 'LOST';
            const eligible = res.data.reports.filter(
              (r) => r.type === targetOppositeType && r.status === 'ACTIVE'
            );
            setMyReports(eligible);
            if (eligible.length > 0) {
              setSelectedReportId(eligible[0]._id);
            }
          }
        })
        .catch(() => {})
        .finally(() => setFetching(false));
    }
  }, [isOpen, targetItem]);

  if (!isOpen || !targetItem) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedReportId) {
      setError('Please select one of your reports to link as a suspected match.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await itemService.reportSuspectedMatch(targetItem._id, {
        counterpartItemId: selectedReportId,
        notes: notes.trim(),
      });

      if (res.data.success) {
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          setNotes('');
          onClose();
        }, 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to report match.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-brand-600 mb-1">
          <Sparkles className="w-5 h-5" />
          <h3 className="text-lg font-bold text-slate-900">Report Suspected Match</h3>
        </div>
        <p className="text-xs text-slate-500 mb-4">
          Notify the owner of <strong className="text-slate-700">"{targetItem.title}"</strong> that your item report corresponds to theirs.
        </p>

        {success ? (
          <div className="py-8 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto animate-bounce" />
            <h4 className="text-base font-bold text-slate-900">Match Correlation Flagged!</h4>
            <p className="text-xs text-slate-500">
              The owner has been notified in real time to review your report.
            </p>
          </div>
        ) : fetching ? (
          <div className="py-8 text-center text-slate-400 text-sm">
            Loading your active reports...
          </div>
        ) : myReports.length === 0 ? (
          <div className="py-6 text-center space-y-3">
            <p className="text-sm text-slate-600">
              You do not have any active{' '}
              <strong className="text-brand-600">
                {targetItem.type === 'LOST' ? 'FOUND' : 'LOST'}
              </strong>{' '}
              reports to link to this item.
            </p>
            <p className="text-xs text-slate-400">
              Please submit a report for your item first, then link it as a match.
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 text-slate-700 font-semibold rounded-xl text-xs"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Select Your Counterpart Report *
              </label>
              <select
                value={selectedReportId}
                onChange={(e) => setSelectedReportId(e.target.value)}
                className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
              >
                {myReports.map((r) => (
                  <option key={r._id} value={r._id}>
                    [{r.category}] {r.title} - {r.location}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Matching Notes or Shared Characteristics (Optional)
              </label>
              <textarea
                rows="3"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. My keys have the same blue lanyard and were found near the library..."
                className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
              ></textarea>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-500 rounded-xl shadow-md transition-all disabled:opacity-50"
              >
                {loading ? 'Submitting...' : 'Link Suspected Match'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
