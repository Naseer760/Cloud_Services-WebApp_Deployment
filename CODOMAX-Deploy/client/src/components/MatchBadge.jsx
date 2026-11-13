import React from 'react';
import { Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function MatchBadge({ score, className = '' }) {
  if (score >= 80) {
    return (
      <span
        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-sm ${className}`}
      >
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
        {score}% Match (Strong)
      </span>
    );
  }

  if (score >= 60) {
    return (
      <span
        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-300 shadow-sm ${className}`}
      >
        <Sparkles className="w-3.5 h-3.5 text-blue-600" />
        {score}% Match (Probable)
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300 shadow-sm ${className}`}
    >
      <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
      {score}% Match (Possible)
    </span>
  );
}
