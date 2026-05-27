import React, { useState, useEffect, useRef } from 'react';
import { Driver, BookingStatus, ChatMessage } from '../types';
import { 
  Star, 
  MessageSquare, 
  Phone, 
  Send, 
  User, 
  Navigation, 
  Zap, 
  FastForward, 
  AlertTriangle 
} from 'lucide-react';

interface DriverCardProps {
  driver: Driver;
  status: BookingStatus;
  chatMessages: ChatMessage[];
  onSendMessage: (text: string) => void;
  onFastForward: () => void;
  congestionMultiplier: number;
  onToggleCongestion: () => void;
}

export default function DriverCard({
  driver,
  status,
  chatMessages,
  onSendMessage,
  onFastForward,
  congestionMultiplier,
  onToggleCongestion
}: DriverCardProps) {
  const [inputText, setInputText] = useState<string>('');
  const [showChat, setShowChat] = useState<boolean>(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to latest chat
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, showChat]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText);
    setInputText('');
  };

  const statusLabel = () => {
    switch (status) {
      case 'searching_driver': return 'Securing nearest driver...';
      case 'driver_enroute': return 'Driver heading to pickup';
      case 'driver_arrived': return 'Arrived! Meet at pickup node';
      case 'trip_started': return 'Trip in progress';
      case 'trip_completed': return 'Arrived at Drop-off!';
      default: return 'Active Session';
    }
  };

  const statusColorCls = () => {
    switch (status) {
      case 'driver_enroute': return 'text-cyan-400 bg-cyan-950/40 border-cyan-800/30';
      case 'driver_arrived': return 'text-amber-400 bg-amber-950/40 border-amber-800/30 ring-1 ring-amber-500/10';
      case 'trip_started': return 'text-emerald-400 bg-emerald-950/40 border-emerald-800/30';
      default: return 'text-gray-400 bg-slate-950';
    }
  };

  return (
    <div id="driver-telemetry-panel" className="bg-[#0B1222]/95 border border-slate-800 rounded-2xl p-5 shadow-xl font-sans space-y-5">
      {/* Session Dispatch Header */}
      <div className="flex justify-between items-center border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-2">
          <div className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </div>
          <div>
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-widest font-mono">
              Live Logistics Dispatch
            </h4>
          </div>
        </div>
        <div className={`px-2.5 py-0.5 rounded text-[10px] sm:text-xs font-semibold font-mono border ${statusColorCls()}`}>
          {statusLabel().toUpperCase()}
        </div>
      </div>

      {/* Driver profile visual grid */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <img 
              id="driver-avatar"
              src={driver.avatar} 
              alt={driver.name} 
              referrerPolicy="no-referrer"
              className="h-12 w-12 rounded-xl object-cover border border-slate-700 bg-slate-800 shadow-md"
            />
            <div className="absolute -bottom-1 -right-1 bg-cyan-900 border border-cyan-700/60 rounded-full p-0.5 flex items-center justify-center">
              <Zap className="h-3 w-3 text-cyan-400 fill-cyan-400" />
            </div>
          </div>
          <div>
            <span className="text-sm font-bold text-gray-100 flex items-center space-x-1">
              <span>{driver.name}</span>
            </span>
            <div className="flex items-center space-x-2.5 mt-0.5 text-xs text-slate-400 font-mono">
              <span className="flex items-center space-x-0.5 text-amber-400">
                <Star className="h-3.5 w-3.5 fill-amber-400" />
                <span className="font-semibold text-[11px] leading-none">{driver.rating}</span>
              </span>
              <span className="text-slate-600">|</span>
              <span className="text-[11px]">{driver.completedTrips} trips</span>
            </div>
          </div>
        </div>

        {/* Vehicle Telemetry Details */}
        <div className="text-right">
          <div className="text-xs font-bold text-gray-200 uppercase tracking-wide">
            {driver.vehicleModel}
          </div>
          <p className="text-[10px] text-gray-500 font-medium tracking-normal mt-0.5">
            {driver.color}
          </p>
          <div className="bg-slate-900 border border-slate-800 text-slate-300 font-mono text-[9px] sm:text-[10px] px-2 py-0.5 rounded font-bold uppercase inline-block mt-1.5 shadow-sm tracking-wider">
            {driver.licensePlate}
          </div>
        </div>
      </div>

      {/* Control buttons */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <button
          id="toggle-driver-chat"
          onClick={() => setShowChat(p => !p)}
          className={`py-2 px-3 rounded-xl border font-semibold flex items-center justify-center space-x-2 transition-all select-none ${
            showChat 
              ? 'bg-cyan-950/50 border-cyan-800 text-cyan-400'
              : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-gray-300'
          }`}
        >
          <MessageSquare className="h-4 w-4" />
          <span>Driver Chat</span>
          {chatMessages.length > 0 && !showChat && (
            <span className="bg-cyan-500 text-cyan-950 font-bold h-4 w-4 rounded-full flex items-center justify-center text-[10px] font-mono select-none animate-bounce">
              {chatMessages.filter(m => m.sender === 'driver').length}
            </span>
          )}
        </button>

        <a
          id="call-driver-action"
          href={`tel:${driver.phone}`}
          className="py-2 px-3 bg-[#0A1121] hover:bg-[#121D35] border border-slate-800 rounded-xl font-semibold text-gray-300 flex items-center justify-center space-x-2 transition-all outline-none"
        >
          <Phone className="h-4 w-4 text-cyan-500" />
          <span>Call Carrier</span>
        </a>
      </div>

      {/* CHAT THREAD EXPANSION DRAW */}
      {showChat && (
        <div className="border border-slate-800 bg-[#070B14] rounded-xl overflow-hidden shadow-inner flex flex-col h-56 transition-all animate-[slide-down_0.2s_ease-out]">
          <div className="bg-slate-950 border-b border-slate-800/80 px-3 py-1.5 flex justify-between items-center text-[10px] text-gray-500 font-mono">
            <span>SECURE ENCRYPTED CHANNEL</span>
            <span className="text-cyan-500 animate-pulse">● LIVE CONNECTED</span>
          </div>

          {/* Messages list */}
          <div className="flex-1 p-3 overflow-y-auto space-y-2.5">
            {chatMessages.map((msg) => {
              const isMe = msg.sender === 'passenger';
              const isSys = msg.sender === 'system';

              if (isSys) {
                return (
                  <div key={msg.id} className="text-center text-[9px] text-slate-500 font-mono select-none uppercase tracking-wider">
                    {msg.text}
                  </div>
                );
              }

              return (
                <div 
                  key={msg.id} 
                  className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[80%] rounded-xl px-3 py-2 text-xs leading-relaxed ${
                    isMe 
                      ? 'bg-cyan-600 text-cyan-950 font-medium rounded-tr-none' 
                      : 'bg-slate-900 border border-slate-800 text-gray-100 rounded-tl-none'
                  }`}>
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                    <span className={`block text-[8px] text-right mt-1 font-mono ${
                      isMe ? 'text-cyan-900' : 'text-slate-500'
                    }`}>
                      {msg.timestamp}
                    </span>
                  </div>
                </div>
              );
            })}
            <div ref={chatEndRef} />
          </div>

          {/* Message input field form */}
          <form onSubmit={handleSubmit} className="p-2 border-t border-slate-800 bg-slate-950/60 flex items-center space-x-2">
            <input
              id="chat-message-input"
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Txt driver..."
              className="flex-1 bg-[#060A13] border border-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/10 text-xs text-gray-200 placeholder-slate-700 rounded-lg px-3 py-1.5 outline-none transition-all"
            />
            <button
              id="send-chat-message"
              type="submit"
              className="p-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-400 text-cyan-950 transition-all shadow"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </form>
        </div>
      )}

      {/* SIMULATOR ACCELERATION SYSTEM & CHEAT DRAWER */}
      <div className="bg-[#050811] border border-slate-800/40 rounded-xl p-3 space-y-2.5 font-sans">
        <div className="flex justify-between items-center text-[10px] font-mono text-cyan-500 select-none uppercase tracking-widest font-bold">
          <span>SIMULATED SYSTEM DRIVES</span>
          <span className="text-slate-500">SPEED CONTROL PANEL</span>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          {/* Fast-forward driver */}
          <button
            id="sim-fast-forward"
            onClick={onFastForward}
            className="flex-1 py-1.5 px-3 bg-cyan-950/40 hover:bg-cyan-900/40 border border-cyan-800/30 text-cyan-400 rounded-lg font-mono text-[10px] text-left flex items-center justify-between transition-all outline-none"
            title="Teleports client along coordinate paths instantly"
          >
            <span className="flex items-center space-x-1 font-semibold uppercase">
              <FastForward className="h-3.5 w-3.5 animate-pulse" />
              <span>Fast Forward GPS</span>
            </span>
            <span className="text-[9px] bg-cyan-900/50 border border-cyan-700/60 px-1 py-0.2 rounded text-cyan-200">
              ⚡️ Skip Waiting
            </span>
          </button>

          {/* Congestion block multiplier */}
          <button
            id="sim-toggle-congestion"
            onClick={onToggleCongestion}
            className={`flex-1 py-1.5 px-3 border rounded-lg font-mono text-[10px] text-left flex items-center justify-between transition-all outline-none ${
              congestionMultiplier > 1
                ? 'bg-rose-950/20 border-rose-900/40 text-rose-400'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-gray-300 hover:border-slate-700'
            }`}
          >
            <span className="flex items-center space-x-1 font-semibold uppercase">
              <AlertTriangle className="h-3.5 w-3.5" />
              <span>{congestionMultiplier > 1 ? 'Heavy Traffic ON' : 'Trigger Traffic Gridlock'}</span>
            </span>
            <span className={`text-[9px] px-1 py-0.2 rounded ${
              congestionMultiplier > 1 
                ? 'bg-rose-900/50 border border-rose-700/60 text-rose-200' 
                : 'bg-slate-800 text-slate-400'
            }`}>
              {congestionMultiplier > 1 ? 'SLOWER (0.3x)' : 'CLEAR ROAD'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
