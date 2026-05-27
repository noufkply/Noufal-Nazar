import React, { useState, useEffect } from 'react';
import { CardDetails } from '../types';
import { 
  CreditCard, 
  Lock, 
  Wallet, 
  DollarSign, 
  Loader2, 
  CheckCircle, 
  AlertCircle 
} from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  onPaymentSuccess: (method: string) => void;
}

export default function PaymentModal({
  isOpen,
  onClose,
  amount,
  onPaymentSuccess
}: PaymentModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'wallet' | 'cash'>('card');
  const [card, setCard] = useState<CardDetails>({ number: '', name: '', expiry: '', cvv: '' });
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [otpCode, setOtpCode] = useState<string>('');
  const [otpError, setOtpError] = useState<string | null>(null);
  const [verificationSuccess, setVerificationSuccess] = useState<boolean>(false);
  const [otpTimer, setOtpTimer] = useState<number>(55);

  // Auto-flicker SMS countdown timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isVerifying && otpTimer > 0) {
      timer = setTimeout(() => setOtpTimer(p => p - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [isVerifying, otpTimer]);

  if (!isOpen) return null;

  // Identify card brand on input
  const getCardBrand = (num: string) => {
    const cleanNum = num.replace(/\D/g, '');
    if (cleanNum.startsWith('4')) return { name: 'Visa', color: 'bg-blue-600', text: 'text-white' };
    if (cleanNum.startsWith('5')) return { name: 'Mastercard', color: 'bg-[#FF5F00]', text: 'text-white' };
    if (cleanNum.startsWith('3')) return { name: 'American Express', color: 'bg-[#1565C0]', text: 'text-white' };
    return { name: 'Generic Card', color: 'bg-gradient-to-r from-slate-800 to-slate-950', text: 'text-gray-400' };
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 16) value = value.slice(0, 16);
    // Format card with spaces: 1234 5678 1234 5678
    const formatted = value.match(/.{1,4}/g)?.join(' ') || '';
    setCard(p => ({ ...p, number: formatted }));
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 4) value = value.slice(0, 4);
    if (value.length >= 2) {
      value = `${value.slice(0, 2)}/${value.slice(2)}`;
    }
    setCard(p => ({ ...p, expiry: value }));
  };

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 3);
    setCard(p => ({ ...p, cvv: value }));
  };

  const initiatePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (paymentMethod === 'cash') {
      setIsProcessing(true);
      setTimeout(() => {
        setIsProcessing(false);
        onPaymentSuccess('Cash Payment');
        onClose();
      }, 1500);
      return;
    }

    if (paymentMethod === 'wallet') {
      setIsProcessing(true);
      setTimeout(() => {
        setIsProcessing(false);
        onPaymentSuccess('Digital Wallet (Apple Pay)');
        onClose();
      }, 1800);
      return;
    }

    // Card checkout flow -> Trigger 3D Secure Verification
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsVerifying(true);
      setOtpTimer(59);
    }, 2000);
  };

  const submitOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError(null);
    setIsProcessing(true);

    setTimeout(() => {
      // Allow any 4-digit code as a simulated bypass, but show simple simulation check
      if (otpCode.length !== 4) {
        setIsProcessing(false);
        setOtpError('Invalid security code. Please input any 4-digit OTP code.');
        return;
      }

      setIsProcessing(false);
      setVerificationSuccess(true);
      
      setTimeout(() => {
        setVerificationSuccess(false);
        setIsVerifying(false);
        const cardBrand = getCardBrand(card.number).name;
        onPaymentSuccess(`${cardBrand} (•••• ${card.number.slice(-4)})`);
        onClose();
      }, 1500);
    }, 1800);
  };

  const cardBrandInfo = getCardBrand(card.number);

  return (
    <div id="payment-system-portal" className="fixed inset-0 bg-[#02050D]/85 backdrop-blur-md flex items-center justify-center p-4 z-50">
      <div 
        id="payment-inner-container" 
        className="bg-[#0B1222] border border-slate-800/80 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl transition-all font-sans relative"
      >
        {/* Header decoration */}
        <div className="bg-gradient-to-r from-cyan-950/40 via-blue-950/40 to-slate-900/40 px-6 py-5 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-800/30">
              <Lock className="h-4.5 w-4.5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-200">Secure Payment Channel</h4>
              <p className="text-[10px] text-cyan-500 font-semibold font-mono tracking-widest leading-none mt-1">
                256-BIT CRYPTO SECURITY
              </p>
            </div>
          </div>
          <button 
            id="close-payment-portal"
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-200 transition-colors bg-slate-950/40 p-1 rounded-lg border border-slate-800/40"
          >
            Cancel
          </button>
        </div>

        {/* 3D SECURE INTERACTIVE GATEWAY OVERLAY */}
        {isVerifying ? (
          <div className="p-6 space-y-6 flex flex-col items-center text-center">
            {verificationSuccess ? (
              <div className="space-y-4 py-8 animate-[fade-in_0.3s_ease]">
                <div className="mx-auto h-16 w-16 bg-emerald-950/50 border border-emerald-500/30 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-10 w-10 text-emerald-400" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-emerald-400 select-none">Authentication Passed!</h4>
                  <p className="text-xs text-gray-400 mt-1 select-none">
                    Funds holding authorized successfully. Directing back to pickup queue.
                  </p>
                </div>
                <div className="h-2 w-24 bg-slate-900 overflow-hidden rounded-full mx-auto">
                  <div className="h-full bg-emerald-400 animate-[loading_1.5s_ease-out_infinite]" style={{ width: '40%' }} />
                </div>
              </div>
            ) : (
              <form onSubmit={submitOtp} className="w-full space-y-5">
                <div className="text-center">
                  <div className="text-xs bg-slate-900/60 border border-slate-800 text-gray-400 px-3 py-1 rounded-full inline-block font-mono mb-2">
                    VERIFIED BY SECURE-ID
                  </div>
                  <h4 className="text-base font-bold text-gray-200">Enter Secondary Verification Code</h4>
                  <p className="text-xs text-gray-400 mt-1 leading-relaxed max-w-xs mx-auto">
                    We've triggered an authorization code to your mobile device for security checks.
                  </p>
                </div>

                {/* Amount details for verification */}
                <div className="bg-[#070A13] border border-slate-800/80 rounded-xl px-4 py-3 text-left">
                  <div className="flex justify-between text-xs text-gray-500 font-mono select-none">
                    <span>MERCHANT</span>
                    <span>AMOUNT</span>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-xs font-semibold text-gray-300">Transit & Courier services</span>
                    <span className="text-sm font-bold font-mono text-cyan-400">${amount.toFixed(2)}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] text-gray-400 font-semibold font-mono">
                    <span>SECURITY OPT PASSCODE</span>
                    <span className="text-slate-500">RESEND IN {otpTimer}s</span>
                  </div>
                  <input
                    id="input-payment-otp"
                    type="text"
                    required
                    pattern="\d{4}"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    placeholder="••••"
                    className="w-full text-center bg-[#070A13] border border-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/20 text-gray-200 placeholder-slate-700 rounded-xl py-3 text-xl font-bold font-mono tracking-[0.5em] outline-none transition-all"
                  />
                  {otpError && (
                    <div className="flex items-center space-x-1.5 text-rose-400 text-xs mt-1.5">
                      <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                      <span className="text-left leading-normal">{otpError}</span>
                    </div>
                  )}
                </div>

                <button
                  id="submit-payment-otp"
                  type="submit"
                  disabled={isProcessing}
                  className="w-full bg-cyan-600 hover:bg-cyan-500 text-cyan-950 disabled:opacity-50 disabled:hover:bg-cyan-600 font-bold py-3 px-4 rounded-xl text-sm transition-all shadow-lg flex items-center justify-center space-x-2"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin text-cyan-950" />
                      <span>Validating Security Key...</span>
                    </>
                  ) : (
                    <span>Submit & Confirm Purchase</span>
                  )}
                </button>
                <div className="text-[11px] text-gray-500 flex items-center justify-center space-x-1 uppercase font-mono tracking-wider">
                  <span>Demo Tip: Enter any 4 digits (e.g., 1234)</span>
                </div>
              </form>
            )}
          </div>
        ) : (
          <form onSubmit={initiatePayment} className="p-6 space-y-6">
            {/* Payment Method Selector Tab bar */}
            <div className="grid grid-cols-3 gap-2 bg-[#060B15] p-1 rounded-xl border border-slate-800/80">
              <button
                id="payment-tab-card"
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`py-2 px-1 text-xs font-semibold rounded-lg flex flex-col sm:flex-row items-center justify-center sm:space-x-1.5 transition-all outline-none select-none ${
                  paymentMethod === 'card'
                    ? 'bg-slate-800 text-cyan-300'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-slate-900/40'
                }`}
              >
                <CreditCard className="h-4 w-4" />
                <span className="mt-1 sm:mt-0">Card</span>
              </button>
              <button
                id="payment-tab-wallet"
                type="button"
                onClick={() => setPaymentMethod('wallet')}
                className={`py-2 px-1 text-xs font-semibold rounded-lg flex flex-col sm:flex-row items-center justify-center sm:space-x-1.5 transition-all outline-none select-none ${
                  paymentMethod === 'wallet'
                    ? 'bg-slate-800 text-cyan-300'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-slate-900/40'
                }`}
              >
                <Wallet className="h-4 w-4" />
                <span className="mt-1 sm:mt-0">Digital</span>
              </button>
              <button
                id="payment-tab-cash"
                type="button"
                onClick={() => setPaymentMethod('cash')}
                className={`py-2 px-1 text-xs font-semibold rounded-lg flex flex-col sm:flex-row items-center justify-center sm:space-x-1.5 transition-all outline-none select-none ${
                  paymentMethod === 'cash'
                    ? 'bg-slate-800 text-cyan-300'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-slate-900/40'
                }`}
              >
                <DollarSign className="h-4 w-4" />
                <span className="mt-1 sm:mt-0">Cash</span>
              </button>
            </div>

            {/* CARD DETAILS FORM */}
            {paymentMethod === 'card' && (
              <div className="space-y-4">
                {/* Visual holographic styled card preview */}
                <div 
                  id="holographic-credit-card"
                  className={`relative p-5 rounded-2xl h-44 flex flex-col justify-between border select-none overflow-hidden bg-cover bg-no-repeat bg-center transition-all duration-500 hover:scale-[1.02] shadow-xl ${
                    cardBrandInfo.color
                  }`}
                  style={{
                    backgroundImage: 'radial-gradient(ellipse at top left, rgba(255,255,255,0.08), transparent)'
                  }}
                >
                  <div className="flex justify-between items-center">
                    {/* Golden chip visual */}
                    <div className="h-7 w-9 bg-gradient-to-br from-amber-300 to-yellow-500 rounded-md border border-yellow-600/50 relative overflow-hidden flex items-center justify-center opacity-90">
                      <div className="absolute inset-x-0 top-2 h-px bg-yellow-800/30" />
                      <div className="absolute inset-y-0 left-3 w-px bg-yellow-800/30" />
                      <div className="absolute inset-y-0 right-3 w-px bg-yellow-800/30" />
                    </div>
                    <span className="text-white font-mono font-bold tracking-widest text-[11px] bg-slate-950/40 px-2 py-0.5 rounded border border-slate-800/40">
                      {cardBrandInfo.name.toUpperCase()}
                    </span>
                  </div>

                  <div className="my-2.5">
                    <p className={`font-mono text-base font-bold tracking-[0.14em] text-shadow-sm ${cardBrandInfo.text}`}>
                      {card.number || '•••• •••• •••• ••••'}
                    </p>
                  </div>

                  <div className="flex justify-between items-end">
                    <div>
                      <div className="text-[8px] uppercase font-mono opacity-60 text-stone-200">CARD HOLDER</div>
                      <div className={`font-mono text-xs font-semibold tracking-wide uppercase truncate max-w-[180px] ${cardBrandInfo.text}`}>
                        {card.name || 'FULL NAME'}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[8px] uppercase font-mono opacity-60 text-stone-200">EXPIRY</div>
                      <div className={`font-mono text-xs font-semibold ${cardBrandInfo.text}`}>
                        {card.expiry || 'MM/YY'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Fields inputs */}
                <div className="space-y-3 font-sans">
                  <div>
                    <label className="block text-[10px] uppercase font-semibold font-mono text-gray-400 mb-1 select-none">
                      Cardholder Name
                    </label>
                    <input
                      id="card-holder-name"
                      type="text"
                      required={paymentMethod === 'card'}
                      value={card.name}
                      onChange={(e) => setCard(p => ({ ...p, name: e.target.value }))}
                      placeholder="e.g. Johnathan Doe"
                      className="w-full bg-[#070A13] border border-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/20 text-gray-200 placeholder-slate-700 rounded-xl px-4 py-2 text-sm outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-semibold font-mono text-gray-400 mb-1 select-none">
                      Card Number
                    </label>
                    <input
                      id="card-number"
                      type="text"
                      required={paymentMethod === 'card'}
                      value={card.number}
                      onChange={handleCardNumberChange}
                      placeholder="4000 1234 5678 9010"
                      className="w-full bg-[#070A13] border border-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/20 text-gray-200 placeholder-slate-700 rounded-xl px-4 py-2 text-sm outline-none transition-all font-mono"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] uppercase font-semibold font-mono text-gray-400 mb-1 select-none">
                        Expiry Date
                      </label>
                      <input
                        id="card-expiry"
                        type="text"
                        required={paymentMethod === 'card'}
                        value={card.expiry}
                        onChange={handleExpiryChange}
                        placeholder="MM/YY"
                        className="w-full bg-[#070A13] border border-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/20 text-gray-200 placeholder-slate-700 rounded-xl px-4 py-2 text-sm outline-none transition-all font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-semibold font-mono text-gray-400 mb-1 select-none">
                        CVV / CVC
                      </label>
                      <input
                        id="card-cvv"
                        type="password"
                        required={paymentMethod === 'card'}
                        value={card.cvv}
                        onChange={handleCvvChange}
                        placeholder="•••"
                        className="w-full bg-[#070A13] border border-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/20 text-gray-200 placeholder-slate-700 rounded-xl px-4 py-2 text-sm outline-none transition-all font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* WALLET SELECTOR */}
            {paymentMethod === 'wallet' && (
              <div className="bg-[#070A13] p-6 rounded-2xl border border-slate-800/80 text-center space-y-4">
                <div className="h-12 w-12 bg-cyan-950/40 border border-cyan-500/10 rounded-full flex items-center justify-center mx-auto text-cyan-400">
                  <Wallet className="h-6 w-6" />
                </div>
                <div>
                  <h5 className="text-sm font-semibold text-gray-200">Express Digital Wallet</h5>
                  <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto leading-relaxed">
                    Instantly sync with Apple Pay, Google Pay or local secure payment tokens.
                  </p>
                </div>
                <div className="h-px bg-slate-800" />
                <div className="text-[10px] text-gray-400 font-mono">
                  DEFAULT_WALLET: token_28F37D9
                </div>
              </div>
            )}

            {/* CASH SELECTOR */}
            {paymentMethod === 'cash' && (
              <div className="bg-[#070A13] p-6 rounded-2xl border border-slate-800/80 text-center space-y-4">
                <div className="h-12 w-12 bg-amber-950/40 border border-amber-500/10 rounded-full flex items-center justify-center mx-auto text-amber-500">
                  <DollarSign className="h-6 w-6" />
                </div>
                <div>
                  <h5 className="text-sm font-semibold text-gray-200">Pay Driver via Cash</h5>
                  <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto leading-relaxed">
                    Settle payment manually with driver at pickup or drop off. System logs invoice upon delivery.
                  </p>
                </div>
                <div className="h-px bg-slate-800" />
                <div className="text-[10px] text-gray-400 font-mono">
                  MOCK_LIMIT: Approved under $500 max
                </div>
              </div>
            )}

            {/* Footer Summary & Proceed button */}
            <div className="space-y-4 pt-2">
              <div className="flex justify-between items-center text-sm font-sans">
                <span className="text-slate-400 font-medium select-none">Total Authorized Funds</span>
                <span className="text-xl font-bold font-mono text-cyan-400">${amount.toFixed(2)}</span>
              </div>

              <button
                id="submit-payment"
                type="submit"
                disabled={isProcessing}
                className="w-full bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-cyan-950 font-bold py-3.5 px-4 rounded-xl text-sm transition-all shadow-lg flex items-center justify-center space-x-2 select-none"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin text-cyan-950" />
                    <span>Processing Secure Gateway...</span>
                  </>
                ) : (
                  <span>Authorize Booking Funds</span>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
