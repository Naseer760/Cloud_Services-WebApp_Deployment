import React from 'react';
import { Link } from 'react-router-dom';
import {
  MapPin,
  Calendar,
  Clock,
  ShieldCheck,
  Tag,
  CheckCircle,
  Eye,
  FileBadge,
  Smartphone,
  CreditCard,
  BookOpen,
  Briefcase,
  Key,
  Watch,
  FileText,
  HelpCircle,
} from 'lucide-react';

const categoryIcons = {
  'ID Card': CreditCard,
  'Mobile Phone': Smartphone,
  Wallet: CreditCard,
  Books: BookOpen,
  Calculator: FileBadge,
  Bag: Briefcase,
  Electronics: Smartphone,
  Keys: Key,
  Accessories: Watch,
  Documents: FileText,
  Other: HelpCircle,
};

export default function ItemCard({ item }) {
  const IconComponent = categoryIcons[item.category] || Tag;
  const isLost = item.type === 'LOST';
  const isRecovered = item.status === 'RECOVERED';
  const isVerified = item.verificationStatus === 'VERIFIED';

  const formattedDate = new Date(item.dateOccurred).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="glass-card rounded-2xl overflow-hidden flex flex-col group relative">
      {/* Top Banner & Status Badges */}
      <div className="relative h-48 bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 group-hover:text-brand-500 transition-colors">
            <IconComponent className="w-16 h-16 stroke-1 mb-2 opacity-60" />
            <span className="text-xs font-semibold tracking-wider uppercase text-slate-500">
              {item.category}
            </span>
          </div>
        )}

        {/* Type Ribbon Badge */}
        <div className="absolute top-3 left-3 flex gap-2">
          <span
            className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider shadow-sm flex items-center gap-1 text-white ${
              isLost ? 'bg-rose-600 shadow-rose-500/20' : 'bg-emerald-600 shadow-emerald-500/20'
            }`}
          >
            {isLost ? 'Lost Item' : 'Found Item'}
          </span>

          {isRecovered && (
            <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-purple-600 text-white shadow-sm flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5" />
              Recovered
            </span>
          )}
        </div>

        {/* Verification Status */}
        <div className="absolute top-3 right-3">
          {isVerified ? (
            <span
              title="Verified by Campus Administration"
              className="p-1.5 rounded-full bg-white/90 backdrop-blur text-blue-600 shadow-sm flex items-center"
            >
              <ShieldCheck className="w-4 h-4" />
            </span>
          ) : (
            <span
              title="Pending Staff Verification"
              className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-amber-500/90 text-white backdrop-blur"
            >
              Pending
            </span>
          )}
        </div>
      </div>

      {/* Card Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span className="flex items-center gap-1 font-semibold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-md">
              <IconComponent className="w-3.5 h-3.5 text-brand-600" />
              {item.category}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {formattedDate}
            </span>
          </div>

          <h3 className="text-base font-bold text-slate-900 group-hover:text-brand-600 transition-colors line-clamp-1 mb-2">
            {item.title}
          </h3>

          <p className="text-xs text-slate-600 line-clamp-2 mb-3 leading-relaxed">
            {item.description}
          </p>

          <div className="space-y-1.5 text-xs text-slate-500 border-t border-slate-100 pt-3">
            <div className="flex items-center gap-1.5 truncate">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{item.location}</span>
            </div>
            {item.approximateTime && (
              <div className="flex items-center gap-1.5 text-slate-400 truncate">
                <Clock className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{item.approximateTime}</span>
              </div>
            )}
          </div>
        </div>

        {/* Card Footer Action */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
          <span className="text-[11px] text-slate-400 flex items-center gap-1">
            <Eye className="w-3.5 h-3.5" />
            {item.views || 0} views
          </span>

          <Link
            to={`/items/${item._id}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-brand-700 bg-brand-50 hover:bg-brand-600 hover:text-white transition-all shadow-sm"
          >
            Inspect Details &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
