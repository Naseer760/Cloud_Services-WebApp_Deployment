import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PlusCircle,
  Upload,
  X,
  MapPin,
  Calendar,
  Clock,
  Tag,
  ShieldAlert,
  AlertCircle,
  CheckCircle2,
  Image as ImageIcon,
} from 'lucide-react';
import { itemService } from '../services/api';

const CATEGORIES = [
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

const CAMPUS_LOCATIONS = [
  'Central Library - 2nd Floor',
  'Main Cafeteria / Canteen',
  'Engineering Block B',
  'Science Block Auditorium',
  'Campus Sports Complex & Gym',
  'Student Center Foyer',
  'Parking Lot A (Bikes/Cars)',
  'Administration Block',
];

export default function ReportLostPage() {
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [dateOccurred, setDateOccurred] = useState(new Date().toISOString().split('T')[0]);
  const [approximateTime, setApproximateTime] = useState('');
  const [color, setColor] = useState('');
  const [distinctiveMarks, setDistinctiveMarks] = useState('');
  const [contactPreference, setContactPreference] = useState('IN_APP');
  const [contactDetails, setContactDetails] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image file exceeds the 5MB size limit.');
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setError('');
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !category || !description.trim() || !location.trim() || !dateOccurred) {
      setError('Please fill in all mandatory fields marked with an asterisk (*).');
      return;
    }

    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('title', title.trim());
    formData.append('type', 'LOST');
    formData.append('category', category);
    formData.append('description', description.trim());
    formData.append('location', location.trim());
    formData.append('dateOccurred', dateOccurred);
    formData.append('approximateTime', approximateTime.trim());
    formData.append('color', color.trim());
    formData.append('distinctiveMarks', distinctiveMarks.trim());
    formData.append('contactPreference', contactPreference);
    formData.append('contactDetails', contactDetails.trim());

    if (imageFile) {
      formData.append('image', imageFile);
    }

    try {
      const res = await itemService.createItem(formData);
      if (res.data.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate(`/items/${res.data.item._id}`);
        }, 1500);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit report. Please check your inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-bold uppercase tracking-wider mb-2">
          <PlusCircle className="w-3.5 h-3.5" />
          Lost Property Form
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Report a Lost Item on Campus
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Provide detailed information so our live heuristic matching engine can notify you when matching items are found.
        </p>
      </div>

      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-800 text-sm">
          <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
          <div>
            <strong>Report Submitted Successfully!</strong> Live alert matching has been initiated. Redirecting to your report...
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-800 text-sm">
          <AlertCircle className="w-6 h-6 text-rose-600 shrink-0" />
          <div>{error}</div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        {/* Item Title & Category */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Item Name / Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., RFID Student ID Card, Casio fx-991EX, Blue HP Backpack"
              className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Category *
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Detailed Description */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Detailed Description *
          </label>
          <textarea
            rows="4"
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the circumstances where you last had the item, context of loss, and visual details..."
            className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
          ></textarea>
        </div>

        {/* Location & Shortcuts */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Last-Seen Campus Location *
          </label>
          <div className="relative">
            <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Specific room, floor, or faculty zone..."
              className="w-full text-sm pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          {/* Quick campus shortcuts */}
          <div className="flex flex-wrap items-center gap-1.5 mt-2">
            <span className="text-[11px] font-semibold text-slate-400">Quick Select:</span>
            {CAMPUS_LOCATIONS.map((loc) => (
              <button
                type="button"
                key={loc}
                onClick={() => setLocation(loc)}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
              >
                {loc}
              </button>
            ))}
          </div>
        </div>

        {/* Date and Time Lost */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Date Lost *
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="date"
                required
                value={dateOccurred}
                onChange={(e) => setDateOccurred(e.target.value)}
                className="w-full text-sm pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Approximate Time
            </label>
            <div className="relative">
              <Clock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={approximateTime}
                onChange={(e) => setApproximateTime(e.target.value)}
                placeholder="e.g. Afternoon 2:30 PM, Morning Tutorial"
                className="w-full text-sm pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>
        </div>

        {/* Color and Distinctive Markings */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Primary Color
            </label>
            <input
              type="text"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              placeholder="e.g., Midnight Blue, Matte Black, Silver"
              className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Distinctive Features / Markings
            </label>
            <input
              type="text"
              value={distinctiveMarks}
              onChange={(e) => setDistinctiveMarks(e.target.value)}
              placeholder="e.g., NASA sticker on corner, scratched back, red keychain"
              className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
        </div>

        {/* Image Upload Area */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Optional Item Photo (Max 5MB)
          </label>
          {imagePreview ? (
            <div className="relative w-full max-w-sm rounded-2xl overflow-hidden border border-slate-200">
              <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover" />
              <button
                type="button"
                onClick={removeImage}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-slate-900/80 text-white hover:bg-rose-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-200 rounded-2xl hover:border-brand-500 hover:bg-brand-50/20 transition-all cursor-pointer">
              <Upload className="w-8 h-8 text-slate-400 mb-2" />
              <span className="text-xs font-bold text-slate-700">Click to upload photo</span>
              <span className="text-[11px] text-slate-400 mt-1">PNG, JPG, WebP up to 5MB</span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          )}
        </div>

        {/* Contact Preference */}
        <div className="border-t border-slate-100 pt-4">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Contact Preference
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { id: 'IN_APP', label: 'In-App Secure Inquiry', desc: 'Safest: keep details private' },
              { id: 'EMAIL', label: 'College Email', desc: 'Direct message to your inbox' },
              { id: 'SECURITY_OFFICE', label: 'Via Security Office', desc: 'Claim via Admin Room 102' },
            ].map((pref) => (
              <label
                key={pref.id}
                className={`p-3 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                  contactPreference === pref.id
                    ? 'border-brand-600 bg-brand-50/50 text-brand-900 ring-1 ring-brand-600'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <input
                  type="radio"
                  name="contactPreference"
                  value={pref.id}
                  checked={contactPreference === pref.id}
                  onChange={(e) => setContactPreference(e.target.value)}
                  className="hidden"
                />
                <span className="text-xs font-bold">{pref.label}</span>
                <span className="text-[10px] text-slate-500 mt-1">{pref.desc}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Submit Action */}
        <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-5 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 px-7 py-3 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-xl shadow-md shadow-rose-600/20 transition-all disabled:opacity-50"
          >
            {loading ? 'Submitting Report...' : (
              <>
                <PlusCircle className="w-4 h-4" />
                Submit Lost Report
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
