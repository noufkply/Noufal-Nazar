import React from 'react';
import { RideOption } from '../types';
import { RIDE_OPTIONS } from '../utils/mockData';
import { 
  Car, 
  Sparkles, 
  Users, 
  Bike, 
  Zap, 
  Truck, 
  User, 
  Smartphone, 
  ChevronRight, 
  Clock 
} from 'lucide-react';

interface RideSelectorProps {
  selectedOptionId: string;
  onSelectOption: (id: string) => void;
  serviceMode: 'ride' | 'delivery';
  distanceKm: number;
  durationMin: number;
  passengerName: string;
  setPassengerName: (val: string) => void;
  passengerPhone: string;
  setPassengerPhone: (val: string) => void;
}

export default function RideSelector({
  selectedOptionId,
  onSelectOption,
  serviceMode,
  distanceKm,
  durationMin,
  passengerName,
  setPassengerName,
  passengerPhone,
  setPassengerPhone
}: RideSelectorProps) {

  // Dynamically map icon strings to actual icons
  const renderRideIcon = (iconName: string, colorClass: string) => {
    const cls = `h-6 w-6 ${colorClass}`;
    switch (iconName) {
      case 'Car': return <Car className={cls} />;
      case 'Sparkles': return <Sparkles className={cls} />;
      case 'Users': return <Users className={cls} />;
      case 'Bike': return <Bike className={cls} />;
      case 'Zap': return <Zap className={cls} />;
      case 'Truck': return <Truck className={cls} />;
      default: return <Car className={cls} />;
    }
  };

  // Filter based on the selected mode
  const options = RIDE_OPTIONS.filter(opt => opt.mode === serviceMode);

  const calculateFullFare = (opt: RideOption) => {
    if (distanceKm === 0) return opt.baseFare;
    return Number((opt.baseFare + distanceKm * opt.ratePerKm).toFixed(2));
  };

  return (
    <div id="ride-selector-card" className="space-y-6">
      <div className="border-b border-slate-800 pb-4">
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-widest font-mono select-none">
          {serviceMode === 'ride' ? '1. Contact & Driver Preferences' : '1. Sender Details'}
        </h3>
        <p className="text-xs text-gray-500 mt-0.5 select-none">
          Provide basic dispatcher credentials for live notifications and invoicing
        </p>
      </div>

      {/* Dispatcher Forms */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="relative">
          <label className="block text-[10px] uppercase font-semibold font-mono text-gray-400 mb-1.5 select-none">
            {serviceMode === 'ride' ? 'Passenger Full Name' : 'Sender Full Name'} <span className="text-cyan-400">*</span>
          </label>
          <div className="relative">
            <User className="absolute left-3 top-2.5 h-4.5 w-4.5 text-gray-500" />
            <input
              id="input-passenger-name"
              type="text"
              required
              value={passengerName}
              onChange={(e) => setPassengerName(e.target.value)}
              placeholder="e.g. Johnathan Doe"
              className="w-full bg-[#0D1526] border border-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/20 text-gray-200 placeholder-slate-600 rounded-xl pl-10 pr-4 py-2 text-sm outline-none transition-all"
            />
          </div>
        </div>

        <div className="relative">
          <label className="block text-[10px] uppercase font-semibold font-mono text-gray-400 mb-1.5 select-none">
            Mobile Number <span className="text-cyan-400">*</span>
          </label>
          <div className="relative">
            <Smartphone className="absolute left-3 top-2.5 h-4.5 w-4.5 text-gray-500" />
            <input
              id="input-passenger-phone"
              type="tel"
              required
              value={passengerPhone}
              onChange={(e) => setPassengerPhone(e.target.value)}
              placeholder="e.g. +1 (555) 456-7890"
              className="w-full bg-[#0D1526] border border-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/20 text-gray-200 placeholder-slate-600 rounded-xl pl-10 pr-4 py-2 text-sm outline-none transition-all"
            />
          </div>
        </div>
      </div>

      {/* Vehicle Tier Fleet Grid */}
      <div className="border-b border-slate-800 pt-2 pb-4">
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-widest font-mono select-none">
          {serviceMode === 'ride' ? '2. Select Fleet Tier' : '2. Select Courier Method'}
        </h3>
        <p className="text-xs text-gray-500 mt-0.5 select-none">
          Transparent rates calculated dynamically according to trip metrics
        </p>
      </div>

      <div className="space-y-3">
        {options.map((opt) => {
          const isSelected = selectedOptionId === opt.id;
          const totalFare = calculateFullFare(opt);
          const currentEta = Math.max(Math.ceil(opt.etaBase + durationMin * 0.2), 2);

          // Aesthetic badge color mappings
          let tierBadgeColor = "text-slate-400 bg-slate-950/40 border-slate-800";
          let iconColor = "text-amber-400";
          
          if (opt.tierName === 'Premium') {
            tierBadgeColor = "text-amber-400 bg-amber-950/20 border-amber-900/40";
            iconColor = "text-amber-400";
          } else if (opt.tierName === 'Eco') {
            tierBadgeColor = "text-emerald-400 bg-emerald-950/20 border-emerald-900/40";
            iconColor = "text-emerald-400";
          } else if (opt.tierName === 'Budget') {
            tierBadgeColor = "text-cyan-400 bg-cyan-950/20 border-cyan-900/40";
            iconColor = "text-cyan-400";
          }

          return (
            <div
              id={`ride-option-${opt.id}`}
              key={opt.id}
              onClick={() => onSelectOption(opt.id)}
              className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer select-none transition-all duration-200 bg-[#0B1120]/60 ${
                isSelected 
                  ? 'border-cyan-500 ring-1 ring-cyan-500/10 bg-[#0B1428] shadow-lg shadow-cyan-950/20' 
                  : 'border-slate-800/80 hover:border-slate-700/80 hover:bg-[#0D1526]/50'
              }`}
            >
              <div className="flex items-center space-x-3.5">
                <div className={`p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-center ${
                  isSelected ? 'border-cyan-800/80 bg-[#061B2E]' : ''
                }`}>
                  {renderRideIcon(opt.icon, isSelected ? 'text-cyan-400' : iconColor)}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-gray-200 text-sm sm:text-base leading-tight">
                      {opt.name}
                    </span>
                    <span className={`text-[9px] font-semibold px-2 py-0.5 border rounded uppercase font-mono ${tierBadgeColor}`}>
                      {opt.tierName}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 mt-1 leading-normal max-w-xs select-none">
                    {opt.description}
                  </p>
                  
                  {/* Fleet details bar */}
                  <div className="flex items-center space-x-4 mt-2 text-[10px] text-gray-400 font-mono">
                    <span className="flex items-center space-x-1">
                      <Users className="h-3 w-3 text-slate-500" />
                      <span>{opt.capacity}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Clock className="h-3 w-3 text-slate-500" />
                      <span>ETA {currentEta}m</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Price Panel */}
              <div className="text-right pl-3">
                <div className="text-xs text-slate-500 font-mono select-none">EST_FARE</div>
                <div className="text-lg sm:text-xl font-bold font-mono text-cyan-400 tracking-tight leading-none mt-0.5">
                  ${totalFare.toFixed(2)}
                </div>
                <div className="text-[10px] text-gray-500 font-mono mt-1 select-none">
                  ${opt.ratePerKm}/km
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
