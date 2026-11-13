import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  PlusCircle,
  CheckCircle,
  Sparkles,
  ShieldCheck,
  Bell,
  ArrowRight,
  MapPin,
  Calendar,
  Layers,
  ChevronRight,
  CreditCard,
  Smartphone,
  BookOpen,
  Briefcase,
  Key,
  Watch,
  FileBadge,
  HelpCircle,
} from 'lucide-react';
import { itemService } from '../services/api';
import ItemCard from '../components/ItemCard';

const categories = [
  { name: 'ID Card', icon: CreditCard, count: 'Cards & Passes' },
  { name: 'Mobile Phone', icon: Smartphone, count: 'Phones & Tech' },
  { name: 'Wallet', icon: CreditCard, count: 'Wallets & Purses' },
  { name: 'Books', icon: BookOpen, count: 'Textbooks & Notes' },
  { name: 'Calculator', icon: FileBadge, count: 'Calculators & Tools' },
  { name: 'Bag', icon: Briefcase, count: 'Backpacks & Bags' },
  { name: 'Keys', icon: Key, count: 'Keys & Keychains' },
  { name: 'Accessories', icon: Watch, count: 'Watches & Glasses' },
];

export default function LandingPage() {
  const [recentItems, setRecentItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('ALL');
  const navigate = useNavigate();

  useEffect(() => {
    itemService
      .getItems({ limit: 6, sort: 'newest' })
      .then((res) => {
        if (res.data.success) {
          setRecentItems(res.data.items || []);
        }
      })
      .catch((err) => console.error('Error fetching recent items:', err))
      .finally(() => setLoading(false));
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim() || selectedType !== 'ALL') {
      navigate(`/items?search=${encodeURIComponent(searchQuery)}&type=${selectedType}`);
    } else {
      navigate('/items');
    }
  };

  return (
    <div className="space-y-20 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-brand-950 to-slate-900 text-white pt-20 pb-24 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        {/* Background Decorative Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-brand-600/20 blur-[120px] rounded-full pointer-events-none" />

        <div className="relative max-w-5xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-500/10 border border-brand-400/30 text-accent-300 text-xs font-semibold tracking-wide">
            <Sparkles className="w-4 h-4 text-accent-400 animate-pulse" />
            Live Heuristic Matching &amp; Real-Time Campus Alerts
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-tight">
            Lost Something on <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-400 via-brand-300 to-blue-400">Campus?</span>
          </h1>

          <p className="text-base sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
            The university's centralized portal for reporting lost items, registering found belongings, and receiving automated live alerts when matches appear.
          </p>

          {/* Primary Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              to="/report-lost"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-2xl text-base font-bold text-white bg-rose-600 hover:bg-rose-500 shadow-lg shadow-rose-600/30 transition-all hover:-translate-y-0.5"
            >
              <PlusCircle className="w-5 h-5" />
              Report Lost Item
            </Link>

            <Link
              to="/report-found"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-2xl text-base font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-600/30 transition-all hover:-translate-y-0.5"
            >
              <CheckCircle className="w-5 h-5" />
              Report Found Item
            </Link>
          </div>

          {/* Search Bar in Hero */}
          <div className="pt-8 max-w-3xl mx-auto">
            <form
              onSubmit={handleSearch}
              className="glass-panel p-2 rounded-2xl shadow-2xl flex flex-col sm:flex-row items-center gap-2 text-slate-800"
            >
              <div className="flex items-center gap-2 px-3 w-full sm:w-auto border-b sm:border-b-0 sm:border-r border-slate-200 pb-2 sm:pb-0">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Type:</span>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="text-xs font-semibold bg-transparent text-slate-700 focus:outline-none cursor-pointer py-1"
                >
                  <option value="ALL">All Items</option>
                  <option value="LOST">Lost Only</option>
                  <option value="FOUND">Found Only</option>
                </select>
              </div>

              <div className="relative flex-1 w-full flex items-center">
                <Search className="w-5 h-5 text-slate-400 ml-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by keywords (e.g. Student ID, Calculator, Blue Bag, iPhone)..."
                  className="w-full bg-transparent px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl font-bold text-sm text-white bg-brand-600 hover:bg-brand-500 transition-colors shadow-md flex items-center justify-center gap-2"
              >
                <Search className="w-4 h-4" />
                Search
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Category Shortcuts */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Explore by Category</h2>
            <p className="text-sm text-slate-500 mt-1">Jump directly to common items reported across campus</p>
          </div>
          <Link
            to="/items"
            className="text-sm font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1 group"
          >
            View all categories
            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.name}
                to={`/items?category=${encodeURIComponent(cat.name)}`}
                className="glass-card p-4 rounded-2xl flex flex-col items-center text-center group hover:border-brand-500 hover:bg-brand-50/50 transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-slate-100 group-hover:bg-brand-600 group-hover:text-white text-brand-600 flex items-center justify-center mb-3 transition-colors shadow-sm">
                  <Icon className="w-6 h-6 stroke-[1.75]" />
                </div>
                <span className="text-xs font-bold text-slate-800 group-hover:text-brand-700 line-clamp-1">
                  {cat.name}
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5">{cat.count}</span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Recently Reported Items */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <h2 className="text-2xl font-bold text-slate-900">Recently Reported on Campus</h2>
            </div>
            <p className="text-sm text-slate-500 mt-1">Latest reports posted by students and campus facilities</p>
          </div>

          <Link
            to="/items"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold text-brand-700 bg-brand-50 hover:bg-brand-100 transition-colors"
          >
            Browse All Items
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-72 rounded-2xl bg-slate-200/80 animate-pulse"></div>
            ))}
          </div>
        ) : recentItems.length === 0 ? (
          <div className="text-center py-12 glass-card rounded-2xl">
            <Layers className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-700">No reports posted yet</h3>
            <p className="text-xs text-slate-500 mt-1">Be the first to submit a lost or found report.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentItems.map((item) => (
              <ItemCard key={item._id} item={item} />
            ))}
          </div>
        )}
      </section>

      {/* How It Works Section */}
      <section className="bg-slate-900 text-white py-16 px-4 sm:px-6 lg:px-8 rounded-3xl max-w-7xl mx-auto relative overflow-hidden">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-accent-400 font-bold text-xs uppercase tracking-wider">
            Seamless Workflow
          </span>
          <h2 className="text-3xl font-extrabold mt-2 tracking-tight">
            How Campus Lost &amp; Found Works
          </h2>
          <p className="text-slate-400 text-sm mt-2">
            Engineered specifically for university environments to ensure fast, safe recovery.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Step 1 */}
          <div className="space-y-3 relative">
            <div className="w-12 h-12 rounded-2xl bg-brand-600/30 border border-brand-500/40 text-accent-300 flex items-center justify-center font-bold text-lg">
              1
            </div>
            <h3 className="text-base font-bold text-white">Post Your Report</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Describe the item, campus location, date, color, and optional picture without revealing sensitive numbers.
            </p>
          </div>

          {/* Step 2 */}
          <div className="space-y-3 relative">
            <div className="w-12 h-12 rounded-2xl bg-brand-600/30 border border-brand-500/40 text-accent-300 flex items-center justify-center font-bold text-lg">
              2
            </div>
            <h3 className="text-base font-bold text-white">Heuristic Matching</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Our intelligent engine compares categories, keywords, campus landmarks, and timestamps to calculate similarity scores.
            </p>
          </div>

          {/* Step 3 */}
          <div className="space-y-3 relative">
            <div className="w-12 h-12 rounded-2xl bg-brand-600/30 border border-brand-500/40 text-accent-300 flex items-center justify-center font-bold text-lg">
              3
            </div>
            <h3 className="text-base font-bold text-white">Real-Time Alerts</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Socket.IO instantly alerts both parties with transparent matching reasons, in-app notifications, and optional email alerts.
            </p>
          </div>

          {/* Step 4 */}
          <div className="space-y-3 relative">
            <div className="w-12 h-12 rounded-2xl bg-brand-600/30 border border-brand-500/40 text-accent-300 flex items-center justify-center font-bold text-lg">
              4
            </div>
            <h3 className="text-base font-bold text-white">Safe Handover</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Connect safely through in-app inquiries or collect valuable items directly at the Campus Security Main Gate Office.
            </p>
          </div>
        </div>
      </section>

      {/* Campus Safety Guidelines */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-brand-50 to-accent-50 rounded-3xl p-8 border border-brand-200/60 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 text-brand-700 font-bold text-sm">
              <ShieldCheck className="w-5 h-5 text-brand-600" />
              Campus Safety &amp; Integrity Guidelines
            </div>
            <h3 className="text-xl font-bold text-slate-900">
              Found valuable items like Wallets, Electronics, or Cash?
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              For high-value items, we strongly advise handing them directly to the Campus Security Office in Admin Block Room 102. When exchanging items with peers, always choose well-lit, public areas such as the library reception or campus cafeteria.
            </p>
          </div>

          <div className="shrink-0 flex flex-col sm:flex-row gap-3">
            <Link
              to="/report-found"
              className="px-6 py-3 rounded-xl font-bold text-sm text-white bg-brand-600 hover:bg-brand-500 shadow-md transition-all text-center"
            >
              Register Found Item
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
