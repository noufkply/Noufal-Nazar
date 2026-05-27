import React from 'react';
import { 
  Package, 
  UserPlus, 
  Smartphone, 
  FileText, 
  Anchor, 
  ShieldAlert 
} from 'lucide-react';

interface DeliverySelectorProps {
  packageType: string;
  setPackageType: (val: string) => void;
  recipientName: string;
  setRecipientName: (val: string) => void;
  recipientPhone: string;
  setRecipientPhone: (val: string) => void;
  deliveryNotes: string;
  setDeliveryNotes: (val: string) => void;
  weightCategory: string;
  setWeightCategory: (val: string) => void;
}

const PACKAGE_TYPES = [
  { id: 'docs', label: 'Documents & Letters', icon: 'FileText', desc: 'Contracts, passports, letters, books' },
  { id: 'food', label: 'Food & Groceries', icon: 'Package', desc: 'Tiffin cases, groceries, takeout, grocery baskets' },
  { id: 'electronics', label: 'Tech & Electronics', icon: 'ShieldAlert', desc: 'Secure protective casing for mobile, tabs, laptops' },
  { id: 'box', label: 'Heavy Boxes & Hardware', icon: 'Anchor', desc: 'Cardboard boxes, crates, household utilities' }
];

const WEIGHT_TIERS = [
  { value: 'light', label: 'Under 2 kg (Lightweight)' },
  { value: 'medium', label: '2 - 10 kg (Medium parcel)' },
  { value: 'heavy', label: '10 - 25 kg (Heavy load)' },
  { value: 'freight', label: 'Over 25 kg (Freight capacity)' }
];

export default function DeliverySelector({
  packageType,
  setPackageType,
  recipientName,
  setRecipientName,
  recipientPhone,
  setRecipientPhone,
  deliveryNotes,
  setDeliveryNotes,
  weightCategory,
  setWeightCategory
}: DeliverySelectorProps) {

  return (
    <div id="delivery-info-form" className="space-y-6">
      <div className="border-b border-slate-800 pb-4">
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-widest font-mono select-none">
          3. Package Cargo Details
        </h3>
        <p className="text-xs text-gray-500 mt-0.5 select-none">
          Choose specifications corresponding to your package for optimal container matching
        </p>
      </div>

      {/* Package Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {PACKAGE_TYPES.map((type) => {
          const isSelected = packageType === type.id;
          return (
            <div
              id={`package-cat-${type.id}`}
              key={type.id}
              onClick={() => setPackageType(type.id)}
              className={`p-3.5 rounded-xl border cursor-pointer select-none transition-all flex items-start space-x-3 bg-[#0B1120]/60 ${
                isSelected
                  ? 'border-emerald-500 bg-[#071317] ring-1 ring-emerald-500/10'
                  : 'border-slate-800/80 hover:border-slate-700/85 hover:bg-[#0D1526]/40'
              }`}
            >
              <div className={`p-2 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center mt-0.5 ${
                isSelected ? 'border-emerald-800 text-emerald-400' : 'text-slate-400'
              }`}>
                {type.icon === 'FileText' && <FileText className="h-4.5 w-4.5" />}
                {type.icon === 'Package' && <Package className="h-4.5 w-4.5" />}
                {type.icon === 'ShieldAlert' && <ShieldAlert className="h-4.5 w-4.5" />}
                {type.icon === 'Anchor' && <Anchor className="h-4.5 w-4.5" />}
              </div>
              <div>
                <span className={`text-[13px] font-semibold block ${isSelected ? 'text-emerald-300' : 'text-gray-200'}`}>
                  {type.label}
                </span>
                <span className="text-[10px] text-gray-500 font-normal leading-normal mt-0.5 block">
                  {type.desc}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Weight Selector */}
      <div className="space-y-2">
        <label className="block text-[10px] uppercase font-semibold font-mono text-gray-400 select-none">
          Estimated Cargo Weight
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {WEIGHT_TIERS.map((tier) => {
            const isSelected = weightCategory === tier.value;
            return (
              <button
                id={`weight-tier-${tier.value}`}
                key={tier.value}
                type="button"
                onClick={() => setWeightCategory(tier.value)}
                className={`py-2 px-3 text-left rounded-lg text-[11px] font-mono border select-none transition-all ${
                  isSelected
                    ? 'border-emerald-500 text-emerald-300 bg-emerald-950/25'
                    : 'border-slate-800 text-gray-400 bg-slate-950/50 hover:border-slate-700 hover:text-gray-200'
                }`}
              >
                {tier.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="border-b border-slate-800 pt-2 pb-4">
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-widest font-mono select-none">
          4. Recipient Coordinates
        </h3>
        <p className="text-xs text-gray-500 mt-0.5 select-none font-sans">
          Courier requires delivery contact details for automated parcel hand-down checks
        </p>
      </div>

      {/* Recipient Details Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="relative">
          <label className="block text-[10px] uppercase font-semibold font-mono text-gray-400 mb-1.5 select-none">
            Recipient's Full Name <span className="text-emerald-400">*</span>
          </label>
          <div className="relative">
            <UserPlus className="absolute left-3 top-2.5 h-4.5 w-4.5 text-gray-500" />
            <input
              id="input-recipient-name"
              type="text"
              required
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              placeholder="e.g. Sarah Connor"
              className="w-full bg-[#0D1526] border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 text-gray-200 placeholder-slate-600 rounded-xl pl-10 pr-4 py-2 text-sm outline-none transition-all"
            />
          </div>
        </div>

        <div className="relative">
          <label className="block text-[10px] uppercase font-semibold font-mono text-gray-400 mb-1.5 select-none">
            Recipient Contact Number <span className="text-emerald-400">*</span>
          </label>
          <div className="relative">
            <Smartphone className="absolute left-3 top-2.5 h-4.5 w-4.5 text-gray-500" />
            <input
              id="input-recipient-phone"
              type="tel"
              required
              value={recipientPhone}
              onChange={(e) => setRecipientPhone(e.target.value)}
              placeholder="e.g. +1 (555) 789-9944"
              className="w-full bg-[#0D1526] border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 text-gray-200 placeholder-slate-600 rounded-xl pl-10 pr-4 py-2 text-sm outline-none transition-all"
            />
          </div>
        </div>
      </div>

      {/* Special Delivery Dispatch Notes */}
      <div className="relative">
        <label className="block text-[10px] uppercase font-semibold font-mono text-gray-400 mb-1.5 select-none">
          Special Delivery Instructions / Gate Codes
        </label>
        <textarea
          id="input-delivery-notes"
          value={deliveryNotes}
          onChange={(e) => setDeliveryNotes(e.target.value)}
          placeholder="e.g. Ring Apt 4B. Leave on the porch if driver receives no voice response."
          rows={3}
          className="w-full bg-[#0D1526] border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 text-gray-200 placeholder-slate-600 rounded-xl px-4 py-3 text-sm outline-none transition-all resize-none leading-relaxed"
        />
      </div>
    </div>
  );
}
