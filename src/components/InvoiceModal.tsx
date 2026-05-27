import React, { useState } from 'react';
import { BookingDetails, LocationNode, Driver } from '../types';
import { 
  CheckCircle2, 
  MapPin, 
  Star, 
  TrendingUp, 
  Clock, 
  CreditCard, 
  ArrowRight, 
  ThumbsUp, 
  FileText 
} from 'lucide-react';

interface InvoiceModalProps {
  booking: BookingDetails;
  driver: Driver;
  onFinished: () => void;
  onSubmitReview: (rating: number, comment: string) => void;
}

export default function InvoiceModal({
  booking,
  driver,
  onFinished,
  onSubmitReview,
}: InvoiceModalProps) {
  const [rating, setRating] = useState<number>(5);
  const [tip, setTip] = useState<number>(0);
  const [submittedReview, setSubmittedReview] = useState<boolean>(false);
  const [reviewText, setReviewText] = useState<string>('');
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);

  const baseFare = booking.option.baseFare;
  const mileageFare = booking.distanceKm * booking.option.ratePerKm;
  const techSurcharge = 1.15;
  const subtotal = baseFare + mileageFare + techSurcharge;
  const tax = subtotal * 0.08;
  const totalDue = subtotal + tax + tip;

  const handleReviewSubmission = () => {
    onSubmitReview(rating, reviewText);
    setSubmittedReview(true);
  };


  return (
    <div id="invoice-receipt-portal" className="fixed inset-0 bg-[#02050D]/90 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div 
        id="invoice-inner-sheet" 
        className="bg-[#0B1222] border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden font-sans my-8 transition-all duration-300"
      >
        {/* Banner Success Illustration */}
        <div className="bg-gradient-to-r from-emerald-950/20 via-teal-950/20 to-slate-900/20 px-6 py-8 border-b border-slate-800 text-center space-y-3 relative">
          <div className="h-14 w-14 bg-emerald-950/80 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto text-emerald-400 filter drop-shadow-[0_0_8px_rgba(16,185,129,0.2)]">
            <CheckCircle2 className="h-9 w-9" />
          </div>
          <div>
            <h4 className="text-lg font-bold text-emerald-400 select-none">Logistics Operation Completed!</h4>
            <p className="text-xs text-gray-400 mt-0.5 select-none">
              Thank you for dispatching with Local Transport & Delivery
            </p>
          </div>
          <div className="text-[10px] text-gray-500 font-mono tracking-widest select-none uppercase">
            Receipt ID: INV-{booking.id.toUpperCase()}
          </div>
        </div>

        {/* Invoice PDF Body content */}
        <div className="p-6 space-y-6">
          {/* Node landmark route flow */}
          <div className="bg-[#070A13] border border-slate-800 rounded-2xl p-4 space-y-3.5">
            <div className="flex items-center space-x-2 text-xs text-slate-500 font-mono select-none">
              <TrendingUp className="h-3.5 w-3.5 text-cyan-500 animate-pulse" />
              <span>ROUTING LOGS</span>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm font-sans">
              <div className="flex items-start space-x-2.5">
                <div className="mt-1 h-2 h-2 rounded-full bg-cyan-400 outline outline-4 outline-cyan-950" />
                <div>
                  <div className="text-[10px] text-slate-500 font-mono uppercase leading-none">PICKUP HUB</div>
                  <span className="font-semibold text-gray-200 mt-1 block">{booking.pickup.name}</span>
                </div>
              </div>

              <div className="self-center hidden sm:block">
                <ArrowRight className="h-5 w-5 text-slate-700" />
              </div>

              <div className="flex items-start space-x-2.5">
                <div className="mt-1 h-2 h-2 rounded-full bg-emerald-400 outline outline-4 outline-emerald-950" />
                <div>
                  <div className="text-[10px] text-slate-500 font-mono uppercase leading-none">DROPOFF STATION</div>
                  <span className="font-semibold text-gray-200 mt-1 block">{booking.dropoff.name}</span>
                </div>
              </div>
            </div>

            {/* Micro stats telemetry row */}
            <div className="h-px bg-slate-800" />
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-center text-xs font-mono">
              <div className="text-left">
                <span className="text-slate-500 text-[10px]">TOTAL DISTANCE</span>
                <span className="block font-bold text-cyan-400 text-sm mt-0.5">{booking.distanceKm} km</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px]">TOTAL DURATION</span>
                <span className="block font-bold text-cyan-400 text-sm mt-0.5">{booking.durationMin} mins</span>
              </div>
              <div className="col-span-2 sm:col-span-1 text-right">
                <span className="text-slate-500 text-[10px]">CARRIER ACCOUNT</span>
                <span className="block font-bold text-gray-300 truncate mt-0.5 capitalize">{booking.option.name}</span>
              </div>
            </div>
          </div>

          {/* ITEM COST BREAK DOWN SHEET */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-xs text-slate-500 font-mono select-none">
              <FileText className="h-3.5 w-3.5 text-cyan-500" />
              <span>TRANSMISSION CHARGES</span>
            </div>

            {/* Cost Ledger table */}
            <div className="border border-slate-800 rounded-xl overflow-hidden font-sans text-xs bg-[#070A13]">
              {/* Table rows */}
              <div className="p-3 border-b border-slate-800/80 flex justify-between">
                <span className="text-gray-400">Base Sourcing Fee ({booking.option.tierName} Fleet)</span>
                <span className="font-mono font-medium text-gray-200">${baseFare.toFixed(2)}</span>
              </div>
              <div className="p-3 border-b border-slate-800/80 flex justify-between">
                <span className="text-gray-400">Road Transport Mileage ({booking.distanceKm} km x ${booking.option.ratePerKm}/km)</span>
                <span className="font-mono font-medium text-gray-200">${mileageFare.toFixed(2)}</span>
              </div>
              <div className="p-3 border-b border-slate-800/80 flex justify-between">
                <span className="text-gray-400">Safe Surcharges & Digital Toll Licensing</span>
                <span className="font-mono font-medium text-gray-200">${techSurcharge.toFixed(2)}</span>
              </div>
              <div className="p-3 border-b border-slate-800/80 flex justify-between bg-slate-950/30">
                <span className="text-gray-400">State Logistics Tax (8.0%)</span>
                <span className="font-mono font-medium text-gray-200">${tax.toFixed(2)}</span>
              </div>
              {tip > 0 && (
                <div className="p-3 border-b border-slate-800/80 flex justify-between bg-emerald-950/10 text-emerald-300">
                  <span>Assigned Driver Express Gratuity / Tip</span>
                  <span className="font-mono font-bold">+${tip.toFixed(2)}</span>
                </div>
              )}
              {/* Grand summary row */}
              <div className="p-4 bg-slate-950 flex justify-between items-center">
                <div>
                  <span className="font-bold text-sm text-gray-100">Paid Amount</span>
                  <p className="text-[10px] text-gray-500 mt-0.5 max-w-[150px] leading-tight flex items-center">
                    <CreditCard className="h-3 w-3 mr-1 text-slate-500" />
                    <span>via {booking.paymentMethod}</span>
                  </p>
                </div>
                <span className="text-xl font-bold font-mono text-cyan-400 tracking-tight">
                  ${totalDue.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* RATING & TIPS GRID PANEL */}
          <div className="border-t border-slate-800/80 pt-5 space-y-4">
            {submittedReview ? (
              <div className="bg-slate-900/40 p-5 rounded-2xl border border-slate-800 text-center space-y-2 py-6 animate-[fade-in_0.3s_ease]">
                <div className="h-10 w-10 bg-emerald-950/60 border border-emerald-800/30 rounded-full flex items-center justify-center mx-auto text-emerald-400">
                  <ThumbsUp className="h-5 w-5" />
                </div>
                <span className="text-sm font-bold text-gray-200 leading-tight block select-none">
                  Feedback Logged!
                </span>
                <p className="text-xs text-gray-400 leading-normal max-w-xs mx-auto select-none">
                  Thank you! Your coordinates & driver rating have been uploaded to {driver.name.split(' ')[0]}&apos;s dispatch profile.
                </p>
              </div>
            ) : (
              <div className="bg-[#070A13] p-4.5 rounded-2xl border border-slate-800/80 space-y-4">
                <div className="text-center">
                  <span className="text-[10px] uppercase font-semibold font-mono text-cyan-500 select-none tracking-wider block">
                    HOW'S YOUR LOGISTICS DRIVE?
                  </span>
                  <p className="text-xs text-gray-400 mt-0.5 select-none">
                    Rate carrier & courier parcel handling to maintain standards
                  </p>
                </div>

                {/* Star review grid */}
                <div className="flex justify-center space-x-1.5 py-1">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const isFilled = (hoveredStar !== null ? hoveredStar : rating) >= star;
                    return (
                      <button
                        id={`star-btn-${star}`}
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoveredStar(star)}
                        onMouseLeave={() => setHoveredStar(null)}
                        className="p-1 transition-all hover:scale-110 outline-none select-none"
                      >
                        <Star className={`h-8 w-8 transition-colors ${
                          isFilled 
                            ? 'text-amber-400 fill-amber-400 filter drop-shadow-[0_0_4px_rgba(245,158,11,0.3)]' 
                            : 'text-slate-700'
                        }`} />
                      </button>
                    );
                  })}
                </div>

                {/* Driver Express Tips selection */}
                <div className="space-y-2 pt-1 font-sans">
                  <label className="block text-[10px] uppercase font-semibold font-mono text-slate-500 text-center select-none">
                    Support {driver.name.split(' ')[0]} with a custom tip
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[0, 2, 5, 10].map((tipVal) => {
                      const isSelected = tip === tipVal;
                      return (
                        <button
                          id={`tip-value-${tipVal}`}
                          key={tipVal}
                          type="button"
                          onClick={() => setTip(tipVal)}
                          className={`py-2 rounded-xl text-xs font-semibold border font-mono select-none transition-all ${
                            isSelected
                              ? 'border-cyan-500 text-cyan-300 bg-cyan-950/30 ring-1 ring-cyan-500/10'
                              : 'border-slate-800 text-gray-400 bg-slate-950/60 hover:border-slate-700 hover:text-gray-200'
                          }`}
                        >
                          {tipVal === 0 ? 'No Tip' : `+$${tipVal}`}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Text Review comments */}
                <div className="space-y-2 pt-1 font-sans">
                  <textarea
                    id="input-review-comments"
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    placeholder="Wrote comments for driver... (optional)"
                    rows={2}
                    className="w-full bg-[#0D1526] border border-slate-800 focus:border-cyan-500 text-xs text-gray-200 placeholder-slate-600 rounded-xl px-4 py-2 outline-none transition-all resize-none leading-relaxed"
                  />
                  <button
                    id="submit-review"
                    type="button"
                    onClick={handleReviewSubmission}
                    className="w-full py-2 px-3 bg-[#0A1121] text-xs font-semibold hover:bg-slate-900 border border-slate-800 text-gray-300 rounded-xl hover:text-white transition-all select-none"
                  >
                    Submit Feedback Rating
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Sourcing reset button */}
          <button
            id="invoice-complete-action"
            type="button"
            onClick={onFinished}
            className="w-full bg-cyan-600 hover:bg-cyan-500 text-cyan-950 font-bold py-3.5 px-4 rounded-xl text-sm transition-all shadow-lg flex items-center justify-center select-none"
          >
            Acknowledge Receipt & Start New Booking
          </button>
        </div>
      </div>
    </div>
  );
}
