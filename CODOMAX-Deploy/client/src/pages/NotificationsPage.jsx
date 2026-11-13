import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Bell,
  CheckCircle,
  Sparkles,
  Trash2,
  CheckCheck,
  MessageSquare,
  ShieldCheck,
  Clock,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { notificationService } from '../services/api';
import { useSocket } from '../context/SocketContext';
import MatchBadge from '../components/MatchBadge';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL'); // ALL or UNREAD
  const { setUnreadCount, decrementUnread, resetUnread } = useSocket();

  const fetchNotifications = () => {
    setLoading(true);
    notificationService
      .getNotifications()
      .then((res) => {
        if (res.data.success) {
          setNotifications(res.data.notifications || []);
          setUnreadCount(res.data.unreadCount || 0);
        }
      })
      .catch((err) => console.error('Error fetching notifications:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id, isCurrentlyRead) => {
    if (isCurrentlyRead) return;
    try {
      const res = await notificationService.markAsRead(id);
      if (res.data.success) {
        setNotifications((prev) =>
          prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
        );
        decrementUnread();
      }
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const res = await notificationService.markAllAsRead();
      if (res.data.success) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        resetUnread();
      }
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const handleDelete = async (id, wasUnread) => {
    try {
      const res = await notificationService.deleteNotification(id);
      if (res.data.success) {
        setNotifications((prev) => prev.filter((n) => n._id !== id));
        if (wasUnread) decrementUnread();
      }
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'UNREAD') return !n.isRead;
    return true;
  });

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'MATCH_SUGGESTION':
        return <Sparkles className="w-5 h-5 text-accent-500" />;
      case 'REPORT_VERIFIED':
        return <ShieldCheck className="w-5 h-5 text-blue-500" />;
      case 'REPORT_REJECTED':
        return <ShieldAlert className="w-5 h-5 text-rose-500" />;
      case 'REPORT_RECOVERED':
        return <CheckCircle className="w-5 h-5 text-emerald-500" />;
      case 'CONTACT_INQUIRY':
        return <MessageSquare className="w-5 h-5 text-brand-500" />;
      default:
        return <Bell className="w-5 h-5 text-slate-400" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Bell className="w-7 h-7 text-brand-600" />
            Live Alerts &amp; Notifications
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time heuristic match suggestions, verification notices, and student inquiries.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleMarkAllAsRead}
            disabled={notifications.filter((n) => !n.isRead).length === 0}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-40 transition-colors shadow-sm"
          >
            <CheckCheck className="w-4 h-4 text-brand-600" />
            Mark All Read
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setFilter('ALL')}
          className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
            filter === 'ALL'
              ? 'bg-slate-900 text-white'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          All Notifications ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('UNREAD')}
          className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
            filter === 'UNREAD'
              ? 'bg-slate-900 text-white'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          Unread ({notifications.filter((n) => !n.isRead).length})
        </button>
      </div>

      {/* Notifications List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-24 rounded-2xl bg-slate-200/70 animate-pulse" />
          ))}
        </div>
      ) : filteredNotifications.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 p-8 space-y-3">
          <Bell className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No notifications to show</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            You're all caught up! Live match alerts and report updates will appear here instantly.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((notif) => {
            const hasMatch = notif.type === 'MATCH_SUGGESTION' && notif.metadata?.score;
            const targetItemId = notif.relatedItemId?._id || notif.relatedItemId;

            return (
              <div
                key={notif._id}
                onClick={() => handleMarkAsRead(notif._id, notif.isRead)}
                className={`p-5 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 cursor-pointer ${
                  notif.isRead
                    ? 'bg-white border-slate-200/80 hover:border-slate-300'
                    : 'bg-brand-50/50 border-brand-200 shadow-sm hover:border-brand-300 ring-1 ring-brand-200/50'
                }`}
              >
                <div className="flex items-start gap-3.5 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                    {getNotificationIcon(notif.type)}
                  </div>

                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4
                        className={`text-sm truncate ${
                          notif.isRead ? 'font-semibold text-slate-800' : 'font-extrabold text-slate-900'
                        }`}
                      >
                        {notif.title}
                      </h4>

                      {hasMatch && <MatchBadge score={notif.metadata.score} />}

                      {!notif.isRead && (
                        <span className="w-2 h-2 rounded-full bg-brand-600 shrink-0"></span>
                      )}
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">{notif.message}</p>

                    {/* Matching reasons pill tags */}
                    {hasMatch && notif.metadata.matchingReasons && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {notif.metadata.matchingReasons.map((r, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[10px] text-slate-600 font-medium"
                          >
                            ✓ {r}
                          </span>
                        ))}
                      </div>
                    )}

                    <span className="text-[10px] text-slate-400 block pt-0.5">
                      {new Date(notif.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  {targetItemId && (
                    <Link
                      to={`/items/${targetItemId}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-brand-700 bg-brand-100/70 hover:bg-brand-600 hover:text-white transition-colors"
                    >
                      <span>View Item</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  )}

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(notif._id, !notif.isRead);
                    }}
                    title="Dismiss alert"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
