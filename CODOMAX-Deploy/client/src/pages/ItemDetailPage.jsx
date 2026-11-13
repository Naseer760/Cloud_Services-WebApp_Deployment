import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  MapPin,
  Calendar,
  Clock,
  ShieldCheck,
  ShieldAlert,
  Tag,
  CheckCircle,
  Eye,
  MessageSquare,
  Sparkles,
  ArrowLeft,
  Share2,
  Trash2,
  CheckCircle2,
  Building,
  UserCheck,
  HelpCircle,
  AlertTriangle,
} from 'lucide-react';
import { itemService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import ContactModal from '../components/ContactModal';
import ReportMatchModal from '../components/ReportMatchModal';
import ConfirmModal from '../components/ConfirmModal';
import MatchBadge from '../components/MatchBadge';

export default function ItemDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, isAdmin } = useAuth();

  const [item, setItem] = useState(null);
  const [matches, setMatches] = useState([]);
  const [isOwner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [matchModalOpen, setMatchModalOpen] = useState(false);
  const [recoverModalOpen, setRecoverModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchItemDetails = () => {
    setLoading(true);
    itemService
      .getItemById(id)
      .then((res) => {
        if (res.data.success) {
          setItem(res.data.item);
          setMatches(res.data.matches || []);
          setIsOwner(res.data.isOwner || false);
        }
      })
      .catch((err) => {
        setError(err.response?.data?.message || 'Item report not found or removed.');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchItemDetails();
  }, [id]);

  const handleMarkRecovered = async () => {
    setActionLoading(true);
    try {
      const res = await itemService.markRecovered(id);
      if (res.data.success) {
        setItem(res.data.item);
        setRecoverModalOpen(false);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update recovery status.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (reason) => {
    setActionLoading(true);
    try {
      const res = await itemService.deleteItem(id, reason);
      if (res.data.success) {
        setDeleteModalOpen(false);
        navigate('/my-reports');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to remove report.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 space-y-6">
        <div className="h-8 w-40 bg-slate-200 rounded-lg animate-pulse" />
        <div className="h-96 bg-slate-200 rounded-3xl animate-pulse" />
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <AlertTriangle className="w-16 h-16 text-rose-500 mx-auto" />
        <h2 className="text-2xl font-bold text-slate-800">Report Unavailable</h2>
        <p className="text-sm text-slate-500">{error || 'The requested item report does not exist.'}</p>
        <Link
          to="/items"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-brand-600 hover:bg-brand-500"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Browse Items
        </Link>
      </div>
    );
  }

  const isLost = item.type === 'LOST';
  const isRecovered = item.status === 'RECOVERED';
  const isVerified = item.verificationStatus === 'VERIFIED';

  const formattedDate = new Date(item.dateOccurred).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Back button */}
      <div>
        <Link
          to="/items"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-brand-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Directory
        </Link>
      </div>

      {/* Main Item Card Layout */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden grid grid-cols-1 md:grid-cols-2">
        {/* Left Column: Image or Graphic */}
        <div className="relative bg-slate-100 flex items-center justify-center p-6 border-b md:border-b-0 md:border-r border-slate-200 min-h-[350px]">
          {item.imageUrl ? (
            <img
              src={item.imageUrl}
              alt={item.title}
              className="max-h-[420px] w-auto max-w-full rounded-2xl object-contain shadow-md"
            />
          ) : (
            <div className="text-center p-8 space-y-3">
              <div className="w-24 h-24 rounded-3xl bg-brand-50 border border-brand-100 text-brand-600 flex items-center justify-center mx-auto shadow-sm">
                <Tag className="w-12 h-12 stroke-1" />
              </div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                {item.category}
              </p>
              <p className="text-[11px] text-slate-400">No photo uploaded with this report</p>
            </div>
          )}

          {/* Badges Overlay */}
          <div className="absolute top-4 left-4 flex flex-wrap gap-2">
            <span
              className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wider text-white shadow-md ${
                isLost ? 'bg-rose-600' : 'bg-emerald-600'
              }`}
            >
              {isLost ? 'Lost Item' : 'Found Item'}
            </span>

            {isRecovered && (
              <span className="px-3 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wider bg-purple-600 text-white shadow-md flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" />
                Recovered &amp; Closed
              </span>
            )}
          </div>

          <div className="absolute top-4 right-4">
            {isVerified ? (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200 flex items-center gap-1 shadow-sm">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                Verified
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1 shadow-sm">
                <Clock className="w-4 h-4 text-amber-600" />
                Pending Verification
              </span>
            )}
          </div>
        </div>

        {/* Right Column: Information & Actions */}
        <div className="p-6 sm:p-8 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div>
              <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">
                {item.category}
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1 leading-snug">
                {item.title}
              </h1>
            </div>

            {/* Description */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Detailed Description
              </h4>
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                {item.description}
              </p>
            </div>

            {/* Key Attributes */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-slate-400 font-semibold block flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-brand-600" />
                  Campus Location:
                </span>
                <span className="font-bold text-slate-800">{item.location}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-slate-400 font-semibold block flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-brand-600" />
                  Date Occurred:
                </span>
                <span className="font-bold text-slate-800">{formattedDate}</span>
              </div>

              {item.approximateTime && (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-slate-400 font-semibold block flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-brand-600" />
                    Approximate Time:
                  </span>
                  <span className="font-bold text-slate-800">{item.approximateTime}</span>
                </div>
              )}

              {item.color && (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-slate-400 font-semibold block">Item Color:</span>
                  <span className="font-bold text-slate-800">{item.color}</span>
                </div>
              )}
            </div>

            {/* Distinctive marks */}
            {item.distinctiveMarks && (
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                <span className="text-slate-400 font-semibold block mb-0.5">
                  Distinctive Markings &amp; Features:
                </span>
                <span className="font-medium text-slate-800">{item.distinctiveMarks}</span>
              </div>
            )}

            {/* Security Handover Notice */}
            {item.securityHandover && (
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-start gap-2.5">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-bold">Physical Security Custody Verified</strong>
                  <span>
                    This found item has been handed over to the campus security desk at:{' '}
                    <strong>{item.securityOfficeLocation}</strong>.
                  </span>
                </div>
              </div>
            )}

            {/* Safe Reporter Details Card */}
            <div className="p-4 rounded-2xl bg-brand-50/60 border border-brand-100/80 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-brand-600 text-white font-bold flex items-center justify-center">
                  {item.ownerId?.name?.charAt(0) || 'U'}
                </div>
                <div>
                  <span className="font-bold text-slate-900 block">{item.ownerId?.name}</span>
                  <span className="text-slate-500 text-[11px]">
                    {item.ownerId?.department || 'University Member'}
                  </span>
                </div>
              </div>

              <div className="text-right text-[11px] text-slate-500">
                <span className="block font-semibold">Contact Preference:</span>
                <span className="font-bold text-brand-700">{item.contactPreference}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-100 space-y-3">
            {/* If current user is Owner or Admin */}
            {(isOwner || isAdmin) ? (
              <div className="space-y-2.5">
                <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-800 font-medium">
                  You are viewing your own report. You can mark it as recovered or manage its listing.
                </div>

                <div className="flex flex-wrap gap-2.5">
                  {!isRecovered && (
                    <button
                      onClick={() => setRecoverModalOpen(true)}
                      className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-emerald-600 hover:bg-emerald-500 shadow-md transition-all"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Mark as Recovered
                    </button>
                  )}

                  <button
                    onClick={() => setDeleteModalOpen(true)}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                    Remove Report
                  </button>
                </div>
              </div>
            ) : (
              /* Public / Student actions */
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => {
                    if (!isAuthenticated) {
                      navigate('/login');
                    } else {
                      setContactModalOpen(true);
                    }
                  }}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold text-xs text-white bg-brand-600 hover:bg-brand-500 shadow-md shadow-brand-600/20 transition-all"
                >
                  <MessageSquare className="w-4 h-4" />
                  Contact Reporter
                </button>

                <button
                  onClick={() => {
                    if (!isAuthenticated) {
                      navigate('/login');
                    } else {
                      setMatchModalOpen(true);
                    }
                  }}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold text-xs text-brand-700 bg-brand-50 hover:bg-brand-100 border border-brand-200 transition-all"
                >
                  <Sparkles className="w-4 h-4 text-brand-600" />
                  Report Suspected Match
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Heuristic Live Match Suggestions Section (Visible to Owner / Admin) */}
      {(isOwner || isAdmin) && matches.length > 0 && (
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-accent-500" />
              <h3 className="text-xl font-bold text-slate-900">
                Potential Match Suggestions ({matches.length})
              </h3>
            </div>
            <span className="text-xs text-slate-500 font-medium">
              Calculated by Live Heuristic Engine
            </span>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed">
            Our system identified these counterpart reports based on category match, keyword similarity, campus locations, and date proximity.
          </p>

          <div className="space-y-4 pt-2">
            {matches.map((match) => {
              const counterpart =
                item.type === 'LOST' ? match.foundItemId : match.lostItemId;
              if (!counterpart) return null;

              return (
                <div
                  key={match._id}
                  className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 hover:bg-white hover:shadow-md transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <MatchBadge score={match.matchingScore} />
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        {counterpart.type} ITEM
                      </span>
                    </div>

                    <h4 className="text-base font-bold text-slate-900">
                      {counterpart.title}
                    </h4>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {counterpart.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(counterpart.dateOccurred).toLocaleDateString()}
                      </span>
                    </div>

                    {/* Reasons breakdown */}
                    {match.matchingReasons && match.matchingReasons.length > 0 && (
                      <div className="pt-2 flex flex-wrap gap-1.5">
                        {match.matchingReasons.map((reason, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[11px] text-slate-600 font-medium"
                          >
                            ✓ {reason}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <Link
                    to={`/items/${counterpart._id}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-brand-700 bg-brand-100/70 hover:bg-brand-600 hover:text-white transition-all shadow-sm shrink-0"
                  >
                    Inspect Counterpart &rarr;
                  </Link>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Modals */}
      <ContactModal
        isOpen={contactModalOpen}
        onClose={() => setContactModalOpen(false)}
        item={item}
      />

      <ReportMatchModal
        isOpen={matchModalOpen}
        onClose={() => setMatchModalOpen(false)}
        targetItem={item}
      />

      <ConfirmModal
        isOpen={recoverModalOpen}
        onClose={() => setRecoverModalOpen(false)}
        onConfirm={handleMarkRecovered}
        loading={actionLoading}
        title="Mark Item as Recovered?"
        message="This will immediately update the database, archive the report from public active listings, and record the recovery in your personal history."
        confirmText="Yes, Mark Recovered"
      />

      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        loading={actionLoading}
        isDanger={true}
        showReasonInput={true}
        title="Remove Report Listing?"
        message="Are you sure you wish to cancel or remove this report? A soft-delete record will be retained for safety and audit integrity."
        confirmText="Remove Report"
      />
    </div>
  );
}
