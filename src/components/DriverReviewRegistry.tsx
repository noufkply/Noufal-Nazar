import React, { useState } from 'react';
import { Driver, DriverReview, ServiceMode } from '../types';
import { 
  Star, 
  MessageSquare, 
  Filter, 
  User, 
  Car, 
  Tag, 
  SlidersHorizontal,
  Plus, 
  CheckCircle2, 
  Clock, 
  ShieldAlert,
  Sparkles,
  Smile
} from 'lucide-react';

interface DriverReviewRegistryProps {
  drivers: Driver[];
  reviews: DriverReview[];
  onAddReview: (driverId: string, rating: number, comment: string, serviceMode: ServiceMode) => void;
}

export default function DriverReviewRegistry({
  drivers,
  reviews,
  onAddReview,
}: DriverReviewRegistryProps) {
  const [selectedDriverId, setSelectedDriverId] = useState<string>(drivers[0]?.id || '');
  
  // Filtering states
  const [starFilter, setStarFilter] = useState<string>('all'); // 'all', '5', '4', 'critical' (1-3)
  const [modeFilter, setModeFilter] = useState<string>('all'); // 'all', 'ride', 'delivery'

  // Testing manual review form states
  const [writeReviewOpen, setWriteReviewOpen] = useState<boolean>(false);
  const [newRating, setNewRating] = useState<number>(5);
  const [newComment, setNewComment] = useState<string>('');
  const [customPassengerName, setCustomPassengerName] = useState<string>('');
  const [selectedMode, setSelectedMode] = useState<ServiceMode>('ride');
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [formSuccess, setFormSuccess] = useState<boolean>(false);

  const activeDriver = drivers.find(d => d.id === selectedDriverId) || drivers[0];

  if (!activeDriver) return null;

  // Filter reviews for THIS active driver
  const driverReviews = reviews.filter(r => r.driverId === activeDriver.id);

  // Apply visual and functional filters
  const filteredReviews = driverReviews.filter(review => {
    // Star filter
    if (starFilter === '5' && review.rating !== 5) return false;
    if (starFilter === '4' && review.rating !== 4) return false;
    if (starFilter === 'critical' && review.rating >= 4) return false;

    // Service mode filter
    if (modeFilter !== 'all' && review.serviceMode !== modeFilter) return false;

    return true;
  });

  // Calculate stats specifically for this driver from current reviews list
  const reviewCount = driverReviews.length;
  const ratingSum = driverReviews.reduce((sum, r) => sum + r.rating, 0);
  const currentAvgRating = reviewCount > 0 ? (ratingSum / reviewCount) : activeDriver.rating;

  // Percentage bar calculated helpers
  const getRatingSummaryPercentages = () => {
    const total = driverReviews.length || 1;
    const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    driverReviews.forEach(r => {
      const star = r.rating as 5 | 4 | 3 | 2 | 1;
      if (counts[star] !== undefined) counts[star]++;
    });
    return {
      5: Math.round((counts[5] / total) * 100),
      4: Math.round((counts[4] / total) * 100),
      3: Math.round(((counts[3] + counts[2] + counts[1]) / total) * 100)
    };
  };

  const distribution = getRatingSummaryPercentages();

  const handleLocalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim() === '' && newRating < 4) {
      alert("Please write a comment explaining critical review feedback to help drivers improve.");
      return;
    }
    
    const passenger = customPassengerName.trim() || 'Valued Passenger';
    onAddReview(activeDriver.id, newRating, newComment, selectedMode);
    
    setFormSuccess(true);
    setNewComment('');
    setNewRating(5);
    setCustomPassengerName('');

    setTimeout(() => {
      setFormSuccess(false);
      setWriteReviewOpen(false);
    }, 2200);
  };

  const getDriverBadge = (dri: Driver) => {
    if (dri.id === 'drv_1') return 'VIP Electric Saloon';
    if (dri.id === 'drv_2') return 'EcoCommute Scholar';
    if (dri.id === 'drv_3') return 'Heavy Load / Luggage Champion';
    return 'Hyper-Swift Moto Specialist';
  };

  return (
    <div id="driver-review-directory-hub" className="bg-[#0B1222]/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden font-sans">
      
      {/* Background visual detail */}
      <div className="absolute -top-12 -right-12 h-64 w-64 bg-cyan-500/5 rounded-full filter blur-3xl" />
      <div className="absolute -bottom-12 -left-12 h-64 w-64 bg-emerald-500/5 rounded-full filter blur-3xl" />

      {/* Grid title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-6 mb-6">
        <div>
          <span className="text-[10px] sm:text-xs uppercase font-bold tracking-widest text-cyan-400 font-mono flex items-center gap-1.5 leading-none">
            <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
            METROPOLITAN CARRIER FEEDBACK
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-white mt-1.5 tracking-tight">
            Carrier Directory & Reviews Database
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Verify real customer feedback logs and dynamically computed average rating parameters for your driver list.
          </p>
        </div>

        <div>
          <button
            id="register-quick-review"
            onClick={() => setWriteReviewOpen(p => !p)}
            className="py-2.5 px-4 bg-cyan-950/40 hover:bg-cyan-900/40 border border-cyan-700/50 text-cyan-300 hover:text-cyan-200 text-xs font-bold rounded-xl transition-all shadow flex items-center gap-2 select-none"
          >
            <Plus className="h-4 w-4" />
            <span>Leave {activeDriver.name.split(' ')[0]} a Review</span>
          </button>
        </div>
      </div>

      {/* Manual Rating Submission Drawer Modal if opened */}
      {writeReviewOpen && (
        <div className="bg-[#070A13] border border-cyan-500/20 rounded-2xl p-5 mb-6 animate-[slide-down_0.25s_ease-out] relative">
          
          {formSuccess ? (
            <div className="py-8 text-center space-y-3">
              <div className="h-12 w-12 bg-emerald-950 border border-emerald-500 rounded-full flex items-center justify-center text-emerald-400 mx-auto filter drop-shadow-[0_0_8px_rgba(16,185,129,0.3)]">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-emerald-400">Review Submitted Successfully!</h4>
                <p className="text-xs text-gray-400 mt-1">
                  Your comments and stars have been indexed. Driver metrics updated.
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleLocalSubmit} className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800/60 pb-2.5">
                <span className="text-xs font-bold font-mono text-gray-300 uppercase">
                  WRITE FEEDBACK LOG FOR {activeDriver.name.toUpperCase()}
                </span>
                <button
                  type="button"
                  onClick={() => setWriteReviewOpen(false)}
                  className="text-xs text-slate-500 hover:text-slate-300 font-mono outline-none"
                >
                  [ CANCEL ]
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Passenger Name Input */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] text-slate-500 font-mono uppercase">Your Identifier / Name</label>
                  <input
                    id="manual-passenger-name"
                    type="text"
                    value={customPassengerName}
                    onChange={(e) => setCustomPassengerName(e.target.value)}
                    placeholder="e.g. Sarah Jenkins (optional)"
                    className="w-full bg-[#0E1526] border border-slate-800 focus:border-cyan-500 text-xs text-gray-200 placeholder-slate-700 rounded-xl px-3.5 py-2 outline-none transition-all"
                  />
                </div>

                {/* Service Mode Selector */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] text-slate-500 font-mono uppercase">Service Experience Type</label>
                  <div className="grid grid-cols-2 gap-1.5 bg-[#0E1526] p-1 rounded-xl border border-slate-800">
                    <button
                      type="button"
                      onClick={() => setSelectedMode('ride')}
                      className={`text-[10px] font-bold py-1 px-2 rounded-lg transition-all ${
                        selectedMode === 'ride' 
                          ? 'bg-cyan-950 text-cyan-300 font-extrabold' 
                          : 'text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      Ride commute
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedMode('delivery')}
                      className={`text-[10px] font-bold py-1 px-2 rounded-lg transition-all ${
                        selectedMode === 'delivery' 
                          ? 'bg-emerald-950 text-emerald-300 font-extrabold' 
                          : 'text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      Delivery
                    </button>
                  </div>
                </div>

                {/* Star rating selection */}
                <div className="space-y-1.5 flex flex-col justify-end">
                  <label className="block text-[10px] text-slate-500 font-mono uppercase text-center sm:text-left">Your Rating ({newRating} Stars)</label>
                  <div className="flex justify-center sm:justify-start space-x-1.5 py-1">
                    {[1, 2, 3, 4, 5].map((star) => {
                      const isFilled = (hoverRating !== null ? hoverRating : newRating) >= star;
                      return (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setNewRating(star)}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(null)}
                          className="hover:scale-110 transition-transform outline-none"
                        >
                          <Star className={`h-5 w-5 ${
                            isFilled ? 'text-amber-400 fill-amber-400' : 'text-slate-700'
                          }`} />
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Text review input */}
              <div className="space-y-1.5">
                <label className="block text-[10px] text-slate-500 font-mono uppercase">Optional Written Comments</label>
                <textarea
                  id="manual-review-comment"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Share details of customer service, vehicle tidiness, safe navigation standards, or response speeds..."
                  rows={2}
                  className="w-full bg-[#0E1526] border border-slate-800 focus:border-cyan-500 text-xs text-gray-100 placeholder-slate-750 rounded-xl px-4 py-2 outline-none transition-all resize-none leading-relaxed"
                />
              </div>

              <div className="flex justify-end pt-1">
                <button
                  id="submit-manual-review"
                  type="submit"
                  className="bg-cyan-600 hover:bg-cyan-500 text-cyan-950 font-bold text-xs py-2 px-4 rounded-xl transition-all shadow"
                >
                  File Feedback to Profile
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Roster & reviews split grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* L-SIDEBAR: DRIVER LIST SELECTOR */}
        <div className="lg:col-span-4 xl:col-span-4 flex flex-col gap-3">
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block select-none">
            CHOOSE ACTIVE DRIVER ENROLLMENT ({drivers.length})
          </span>
          <div className="space-y-2.5">
            {drivers.map((drv) => {
              const worksAsSelected = drv.id === selectedDriverId;
              const rCount = reviews.filter(r => r.driverId === drv.id).length;
              const rSum = reviews.filter(r => r.driverId === drv.id).reduce((s, r) => s + r.rating, 0);
              const liveAvg = rCount > 0 ? (rSum / rCount) : drv.rating;

              return (
                <button
                  id={`driver-selector-${drv.id}`}
                  key={drv.id}
                  onClick={() => {
                    setSelectedDriverId(drv.id);
                  }}
                  className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center justify-between outline-none cursor-pointer ${
                    worksAsSelected
                      ? 'bg-slate-900 border-cyan-800 text-white shadow-xl ring-1 ring-cyan-500/10'
                      : 'bg-slate-950/40 border-slate-800 hover:border-slate-700 text-slate-400 hover:text-gray-200'
                  }`}
                >
                  <div className="flex items-center space-x-3.5 min-w-0">
                    <img
                      src={drv.avatar}
                      alt={drv.name}
                      referrerPolicy="no-referrer"
                      className="h-10 w-10 rounded-xl object-cover border border-slate-700/60 flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold truncate leading-none mb-1">{drv.name}</h4>
                      <p className="text-[10px] text-slate-500 font-mono leading-none truncate">{getDriverBadge(drv)}</p>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <div className="flex items-center space-x-1 justify-end text-amber-400 font-mono text-xs font-bold leading-none select-none">
                      <Star className="h-3.5 w-3.5 fill-amber-400" />
                      <span>{liveAvg.toFixed(2)}</span>
                    </div>
                    <span className="text-[9px] text-slate-500 mt-1 font-mono tracking-normal block leading-none">
                      {rCount} reviews
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* R-SIDEBAR: DETAILED CARD & STATS & REVIEWS LIST */}
        <div className="lg:col-span-8 xl:col-span-8 flex flex-col gap-6 ">
          
          {/* Active Profile Info Banner & Stats */}
          <div className="bg-[#070A13] border border-slate-800 rounded-2xl p-5 sm:p-6 grid grid-cols-1 md:grid-cols-12 gap-5.5 items-center">
            
            {/* Left Col: Photo and vehicle details */}
            <div className="md:col-span-6 flex items-center gap-4">
              <img
                src={activeDriver.avatar}
                alt={activeDriver.name}
                referrerPolicy="no-referrer"
                className="h-16 w-16 rounded-2xl object-cover border border-slate-700 bg-slate-800 shadow-md flex-shrink-0"
              />
              <div className="min-w-0 space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-black text-gray-100 truncate">{activeDriver.name}</h3>
                  <span className="py-0.5 px-2 rounded-md bg-cyan-950 border border-cyan-800 text-[9px] text-cyan-300 font-bold uppercase tracking-wide select-none">
                    Verified Carrier
                  </span>
                </div>
                <p className="text-xs text-slate-500 leading-normal font-mono font-medium">
                  {activeDriver.color} • {activeDriver.vehicleModel}
                </p>
                <div className="bg-slate-900 border border-slate-800 text-slate-400 font-mono text-[9px] px-2 py-0.5 rounded font-bold uppercase inline-block">
                  PLATE: {activeDriver.licensePlate}
                </div>
              </div>
            </div>

            {/* Right Col: Complex calculated reviews stats meters */}
            <div className="md:col-span-6 grid grid-cols-3 gap-3 text-center border-t md:border-t-0 md:border-l border-slate-800/80 pt-4 md:pt-0 md:pl-5 font-mono text-xs">
              <div className="text-left">
                <span className="text-[#64748B] text-[9px] tracking-normal leading-none block uppercase select-none font-semibold">Average Score</span>
                <span className="font-extrabold text-cyan-400 text-base sm:text-lg mt-1 block leading-none">
                  {currentAvgRating.toFixed(2)} / 5.0
                </span>
                <div className="flex items-center space-x-0.5 text-amber-500 mt-1 select-none">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className={`h-2.5 w-2.5 ${Math.round(currentAvgRating) >= s ? 'fill-amber-400' : 'text-slate-800'}`} />
                  ))}
                </div>
              </div>

              <div>
                <span className="text-[#64748B] text-[9px] tracking-normal leading-none block uppercase select-none font-semibold">Trips logged</span>
                <span className="font-bold text-gray-200 text-base sm:text-lg mt-1 block leading-none">
                  {activeDriver.completedTrips + reviews.filter(r => r.driverId === activeDriver.id && r.id.startsWith('new_')).length}
                </span>
                <span className="text-[8px] text-emerald-500 block mt-1 font-bold leading-none select-none">100% SAFETY</span>
              </div>

              <div className="text-right">
                <span className="text-[#64748B] text-[9px] tracking-normal leading-none block uppercase select-none font-semibold font-mono">Feedback Ratio</span>
                <span className="font-semibold text-gray-200 text-base sm:text-lg mt-1 block leading-none">
                  {reviewCount} Logs
                </span>
                <span className="text-[8px] text-slate-500 block mt-1 leading-none select-none">PUBLIC ACCESS</span>
              </div>
            </div>

            {/* Distribution sub-ledger bar */}
            <div className="col-span-1 md:col-span-12 pt-3 border-t border-slate-850 grid grid-cols-3 gap-4.5 text-[9px] font-mono leading-none">
              <div>
                <div className="flex justify-between text-slate-400 mb-1 leading-none">
                  <span>5 STARS Commendable</span>
                  <span>{distribution[5]}%</span>
                </div>
                <div className="h-1 w-full bg-slate-900 rounded overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded" style={{ width: `${distribution[5]}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-slate-400 mb-1 leading-none">
                  <span>4 STARS Standard</span>
                  <span>{distribution[4]}%</span>
                </div>
                <div className="h-1 w-full bg-slate-900 rounded overflow-hidden">
                  <div className="h-full bg-cyan-500 rounded" style={{ width: `${distribution[4]}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-slate-400 mb-1 leading-none text-right">
                  <span>3⭐ or Less Critical</span>
                  <span>{distribution[3]}%</span>
                </div>
                <div className="h-1 w-full bg-slate-900 rounded overflow-hidden">
                  <div className="h-full bg-rose-500 rounded" style={{ width: `${distribution[3]}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* FILTER CRITERIA BOX & LOGS LIST */}
          <div className="space-y-4">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#070A13] border border-slate-800 p-3 rounded-xl select-none">
              <div className="flex items-center space-x-2 text-xs font-mono text-[#64748B]">
                <Filter className="h-4 w-4 text-cyan-500" />
                <span>FILTER LOGS</span>
              </div>
              
              {/* Star controls & service category selections */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="bg-slate-950 p-1 rounded-lg border border-slate-800 flex space-x-1.5">
                  {[
                    { id: 'all', label: 'All Stars' },
                    { id: '5', label: '5 ⭐' },
                    { id: '4', label: '4 ⭐' },
                    { id: 'critical', label: 'Critical' }
                  ].map((btn) => (
                    <button
                      key={btn.id}
                      onClick={() => setStarFilter(btn.id)}
                      className={`px-2 py-0.5 text-[10px] font-bold rounded-md font-mono transition-all uppercase ${
                        starFilter === btn.id 
                          ? 'bg-cyan-600 text-cyan-950'
                          : 'text-slate-400 hover:text-gray-200'
                      }`}
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>

                <div className="bg-slate-950 p-1 rounded-lg border border-slate-800 flex space-x-1.5">
                  {[
                    { id: 'all', label: 'All Modes' },
                    { id: 'ride', label: 'Rides' },
                    { id: 'delivery', label: 'Deliveries' }
                  ].map((btn) => (
                    <button
                      key={btn.id}
                      onClick={() => setModeFilter(btn.id)}
                      className={`px-2 py-0.5 text-[10px] font-bold rounded-md font-mono transition-all uppercase ${
                        modeFilter === btn.id 
                          ? 'bg-emerald-600 text-emerald-950'
                          : 'text-slate-400 hover:text-gray-200'
                      }`}
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* List of filtered reviews */}
            <div className="space-y-3.5 max-h-[380px] overflow-y-auto pr-1">
              {filteredReviews.length === 0 ? (
                <div className="bg-slate-950/40 border border-slate-900 border-dashed p-10 rounded-2xl text-center select-none py-14">
                  <ShieldAlert className="h-6 w-6 text-slate-700 mx-auto" />
                  <p className="text-xs text-slate-500 mt-2 font-mono uppercase font-bold tracking-wider">
                    NO COMPATIBLE REVIEWS FOUND
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1 max-w-xs mx-auto font-sans leading-normal">
                    Try adjusting filters or submit a new custom feedback logs parameter to list active comments.
                  </p>
                </div>
              ) : (
                filteredReviews.map((review) => {
                  return (
                    <div
                      id={`review-card-${review.id}`}
                      key={review.id}
                      className="bg-slate-950/60 p-4 border border-slate-800/80 hover:border-slate-800 rounded-2xl space-y-2.5 transition-all text-sm font-sans relative"
                    >
                      {/* Name, rating and mode headers */}
                      <div className="flex items-center justify-between gap-2.5">
                        <div className="flex items-center space-x-2">
                          <div className="h-6 w-6 bg-[#0E1526] rounded-full flex items-center justify-center text-cyan-400 text-[10px] font-black border border-slate-850">
                            {review.passengerName.slice(0, 1).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-bold text-gray-200 text-xs block">{review.passengerName}</span>
                            <span className="text-[9px] text-slate-500 font-mono block leading-none mt-0.5 select-none">
                              {new Date(review.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })} at {new Date(review.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2.5">
                          {/* Service mode tag */}
                          <span className={`py-0.5 px-2 rounded font-mono text-[8px] tracking-wider uppercase font-extrabold select-none ${
                            review.serviceMode === 'ride' 
                              ? 'bg-cyan-950 text-cyan-400 border border-cyan-700/20' 
                              : 'bg-emerald-950 text-emerald-400 border border-emerald-700/20'
                          }`}>
                            {review.serviceMode === 'ride' ? 'RIDE Commute' : 'COURIER DISPATCH'}
                          </span>

                          {/* Star count rating display */}
                          <div className="flex space-x-0.5 text-amber-400 select-none bg-slate-950 font-bold font-mono px-2 py-1 rounded border border-slate-900 text-xs">
                            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400 mr-0.5 self-center" />
                            <span className="leading-none text-[11px] self-center">{review.rating}</span>
                          </div>
                        </div>
                      </div>

                      {/* Text Comment body */}
                      {review.comment ? (
                        <div className="bg-[#070A13] p-3 rounded-xl border border-slate-900 border-l-2 border-l-cyan-500/50">
                          <p className="text-xs text-gray-300 italic leading-relaxed whitespace-pre-wrap">
                            &ldquo;{review.comment}&rdquo;
                          </p>
                        </div>
                      ) : (
                        <p className="text-[11px] text-slate-600 block pl-3 italic select-none">
                          No written comments provided - Sourcing transaction rated {review.rating} stars.
                        </p>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
