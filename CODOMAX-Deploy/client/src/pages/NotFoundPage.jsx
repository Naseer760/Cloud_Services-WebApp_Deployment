import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, ArrowLeft, Search } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-16 text-center">
      <div className="max-w-md w-full space-y-6">
        <div className="w-20 h-20 rounded-3xl bg-brand-50 border border-brand-100 text-brand-600 flex items-center justify-center mx-auto shadow-sm">
          <Compass className="w-10 h-10 animate-spin-slow" />
        </div>

        <div className="space-y-2">
          <span className="text-6xl font-extrabold text-slate-900 tracking-tight">404</span>
          <h1 className="text-2xl font-bold text-slate-800">Page Not Found</h1>
          <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
            It seems this page has been lost or moved. Return to the campus portal directory to continue your search.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 shadow-md transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Return Home
          </Link>
          <Link
            to="/items"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-brand-700 bg-brand-50 hover:bg-brand-100 transition-all"
          >
            <Search className="w-4 h-4" />
            Browse Items
          </Link>
        </div>
      </div>
    </div>
  );
}
