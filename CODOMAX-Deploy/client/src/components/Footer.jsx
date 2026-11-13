import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Shield, MapPin, Phone, Mail, Clock } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-600 to-accent-500 flex items-center justify-center">
                <Compass className="w-5 h-5 text-white" />
              </div>
              <span className="text-base font-bold text-white tracking-tight">
                Campus <span className="text-accent-400">Lost &amp; Found</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Official centralized portal for university students and staff to report, track, match, and recover lost campus belongings securely.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20 w-fit">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Live Alert Engine Online
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Portal Navigation</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/items" className="hover:text-white transition-colors">
                  Search &amp; Browse Items
                </Link>
              </li>
              <li>
                <Link to="/report-lost" className="hover:text-rose-400 transition-colors">
                  Report a Lost Item
                </Link>
              </li>
              <li>
                <Link to="/report-found" className="hover:text-emerald-400 transition-colors">
                  Register a Found Item
                </Link>
              </li>
              <li>
                <Link to="/my-reports" className="hover:text-white transition-colors">
                  Personal Reports Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Campus Security Office */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Security Handover</h4>
            <ul className="space-y-2.5 text-sm">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-accent-400 shrink-0 mt-0.5" />
                <span>Admin Block Ground Floor, Room 102</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-accent-400 shrink-0" />
                <span>Campus Helpline: (555) 019-2000</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-accent-400 shrink-0" />
                <span>security.lostfound@campus.edu</span>
              </li>
              <li className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-accent-400 shrink-0" />
                <span>Open 24/7 for Handover &amp; Claims</span>
              </li>
            </ul>
          </div>

          {/* Safety & Integrity */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Student Safety</h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-3">
              Never publish high-value credentials, bank PINs, or private identifiers publicly. When meeting to retrieve items, meet in public campus zones like the Library foyer or Security Office.
            </p>
            <div className="flex items-center gap-1.5 text-xs text-slate-300">
              <Shield className="w-4 h-4 text-brand-400" />
              <span>Verified Campus Security Monitored</span>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500">
          <p>&copy; {new Date().getFullYear()} University Campus Lost &amp; Found Portal. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 sm:mt-0">
            <span>Student Privacy Protected</span>
            <span>Live Alerts Powered by Socket.IO</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
