import React, { useEffect, useRef, useState } from 'react';
import { LocationNode, RoadSegment, BookingStatus } from '../types';
import { LOCATION_NODES, ROAD_SEGMENTS } from '../utils/mockData';
import { 
  MapPin, 
  Navigation, 
  ShieldCheck, 
  Compass, 
  Activity, 
  Radio, 
  Maximize2 
} from 'lucide-react';

interface MapSimulationProps {
  pickup: LocationNode | null;
  dropoff: LocationNode | null;
  onSelectNode: (node: LocationNode) => void;
  status: BookingStatus;
  carPos: { x: number; y: number } | null;
  carRotation: number;
}

export default function MapSimulation({
  pickup,
  dropoff,
  onSelectNode,
  status,
  carPos,
  carRotation
}: MapSimulationProps) {
  const [hoveredNode, setHoveredNode] = useState<LocationNode | null>(null);
  const [satelliteView, setSatelliteView] = useState<boolean>(false);
  const [gpsDrift, setGpsDrift] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [gpsSignal, setGpsSignal] = useState<'strong' | 'moderate' | 'weak'>('strong');

  // Simulate subtle atmospheric GPS drift to make HUD/telemetry look incredibly organic
  useEffect(() => {
    const driftInterval = setInterval(() => {
      setGpsDrift({
        x: (Math.random() - 0.5) * 0.08,
        y: (Math.random() - 0.5) * 0.08
      });
      
      // Randomly flicker signal quality slightly
      const rand = Math.random();
      if (rand > 0.95) setGpsSignal('weak');
      else if (rand > 0.85) setGpsSignal('moderate');
      else setGpsSignal('strong');
    }, 1500);

    return () => clearInterval(driftInterval);
  }, []);

  // Compute current display coordinates for HUD
  const activeLat = carPos 
    ? (37.7749 + (carPos.y - 50) * 0.0015 + gpsDrift.y).toFixed(6) 
    : pickup
    ? (37.7749 + (pickup.y - 50) * 0.0015 + gpsDrift.y).toFixed(6)
    : "37.774929";

  const activeLng = carPos 
    ? (-122.4194 + (carPos.x - 50) * 0.0018 + gpsDrift.x).toFixed(6) 
    : pickup
    ? (-122.4194 + (pickup.x - 50) * 0.0018 + gpsDrift.x).toFixed(6)
    : "-122.419412";

  return (
    <div id="map-canvas-container" className="relative w-full h-full min-h-[450px] md:min-h-[550px] bg-[#070A13] flex-1 rounded-2xl overflow-hidden border border-slate-800/80 shadow-2xl flex flex-col">
      {/* HUD Telemetry Overlay */}
      <div className="absolute top-4 left-4 right-4 z-10 flex flex-wrap justify-between gap-2 pointer-events-none">
        {/* Connection Status panel */}
        <div className="bg-[#0B1528]/95 border border-slate-700/60 rounded-xl px-4 py-2 text-xs flex items-center space-x-3 backdrop-blur-md shadow-lg pointer-events-auto transition-all">
          <div className="relative flex h-2 w-2">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
              gpsSignal === 'strong' ? 'bg-cyan-400' : gpsSignal === 'moderate' ? 'bg-amber-400' : 'bg-rose-400'
            }`}></span>
            <span className={`relative inline-flex rounded-full h-2 w-2 ${
              gpsSignal === 'strong' ? 'bg-cyan-500' : gpsSignal === 'moderate' ? 'bg-amber-500' : 'bg-rose-500'
            }`}></span>
          </div>
          <span className="text-gray-300 font-mono tracking-wider text-[10px] sm:text-xs">
            GPS: {gpsSignal.toUpperCase()}
          </span>
          <div className="h-4 w-px bg-slate-800" />
          <span className="text-gray-400 font-mono text-[10px] sm:text-xs">
            SAT_LNK: 4.88 GHz
          </span>
        </div>

        {/* Coordinate Stream Panel */}
        <div className="bg-[#0B1528]/95 border border-slate-700/60 rounded-xl px-4 py-2 text-xs flex items-center space-x-4 backdrop-blur-md shadow-lg pointer-events-auto select-none">
          <div className="text-right font-mono">
            <div className="text-[10px] text-gray-500 uppercase tracking-widest leading-none">LATITUDE</div>
            <div className="text-cyan-400 tracking-wider font-semibold font-mono text-xs">{activeLat}°</div>
          </div>
          <div className="text-right font-mono border-l border-slate-800 pl-4">
            <div className="text-[10px] text-gray-500 uppercase tracking-widest leading-none">LONGITUDE</div>
            <div className="text-cyan-400 tracking-wider font-semibold font-mono text-xs">{activeLng}°</div>
          </div>
        </div>
      </div>

      {/* Floating Action Controls on Map */}
      <div className="absolute bottom-4 right-4 z-10 flex flex-col space-y-2">
        <button 
          id="map-view-toggle"
          onClick={() => setSatelliteView(p => !p)}
          className="bg-[#0D1527] hover:bg-[#16233C] text-gray-300 border border-slate-700/60 rounded-xl p-2.5 transition-all shadow-lg backdrop-blur-md flex items-center justify-center pointer-events-auto"
          title="Toggle Satellite Details"
        >
          <Compass className={`h-5 w-5 text-gray-200 transition-transform duration-700 ${satelliteView ? 'rotate-180' : ''}`} />
        </button>
        <div className="bg-[#0D1527]/95 border border-slate-700/60 rounded-xl px-3 py-1.5 font-mono text-[10px] text-gray-400 backdrop-blur-md flex items-center space-x-1 select-none pointer-events-none shadow-lg">
          <Activity className="h-3 w-3 text-cyan-500 animate-pulse" />
          <span>SIM_GRID: 10x10</span>
        </div>
      </div>

      {/* Main Svg-based Vector Map Canvas */}
      <div className="w-full h-full relative cursor-crosshair select-none flex-1 overflow-hidden">
        <svg 
          id="svg-city-map"
          viewBox="0 0 100 100" 
          className="w-full h-full transition-all duration-300"
          style={{ 
            backgroundColor: satelliteView ? '#02040A' : '#070A13',
            backgroundImage: satelliteView 
              ? 'radial-gradient(circle, rgba(14,28,54,0.15) 1px, transparent 1px)' 
              : 'radial-gradient(circle, rgba(14,24,45,0.3) 1px, transparent 1px)',
            backgroundSize: '3% 3%'
          }}
        >
          <defs>
            {/* Soft shadow effects for glowing icons */}
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="1.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            
            {/* Highly striking cyan pulse halo */}
            <filter id="neon-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="1" result="blur" />
              <feComponentTransfer in="blur" result="glow1">
                <feFuncA type="linear" slope="0.8"/>
              </feComponentTransfer>
              <feMerge>
                <feMergeNode in="glow1" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Custom linear gradient for roads */}
            <linearGradient id="roadGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1B2640" />
              <stop offset="100%" stopColor="#25355C" />
            </linearGradient>

            <linearGradient id="routeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#06B6D4" />
              <stop offset="100%" stopColor="#10B981" />
            </linearGradient>
          </defs>

          {/* BACKGROUND LANDFORMS (PARKS & WATER) */}
          {/* Estuary/River running across top-left to bottom-right */}
          <path 
            d="M -5,35 Q 25,25 40,30 T 70,60 T 105,75 L 105,105 L -5,105 Z" 
            fill={satelliteView ? '#060B18' : '#0B1324'} 
            className="transition-colors duration-500"
            opacity="0.6"
          />
          <path 
            d="M 80,10 C 90,15 95,25 90,35 C 85,45 80,48 84,60 C 88,72 105,80 105,80 L 105,100 L 70,100 Z" 
            fill={satelliteView ? '#040F1D' : '#0D1A30'} 
            className="transition-colors duration-500"
            opacity="0.4"
          />

          {/* Large Forest/Park Greenery Area */}
          <rect 
            x="60" 
            y="70" 
            width="35" 
            height="25" 
            rx="4" 
            fill={satelliteView ? '#041710' : '#0B1E16'} 
            className="transition-colors duration-500"
            opacity="0.5"
          />
          <circle 
            cx="25" 
            cy="15" 
            r="12" 
            fill={satelliteView ? '#041710' : '#0A1C14'} 
            className="transition-colors duration-500"
            opacity="0.4"
          />

          {/* GRID DECORATIVE ROAD SEGMENTS */}
          {ROAD_SEGMENTS.map((road) => {
            const nodeFrom = LOCATION_NODES.find(n => n.id === road.from);
            const nodeTo = LOCATION_NODES.find(n => n.id === road.to);
            if (!nodeFrom || !nodeTo) return null;

            const isCongested = road.congestion === 'heavy';
            const isModerate = road.congestion === 'moderate';

            return (
              <g id={`road-${road.id}`} key={road.id} className="opacity-90">
                {/* Thick underlying buffer road layout */}
                <line
                  x1={nodeFrom.x}
                  y1={nodeFrom.y}
                  x2={nodeTo.x}
                  y2={nodeTo.y}
                  stroke={satelliteView ? '#101726' : '#141D33'}
                  strokeWidth="2.8"
                  strokeLinecap="round"
                />
                {/* Fine interactive asphalt road core */}
                <line
                  x1={nodeFrom.x}
                  y1={nodeFrom.y}
                  x2={nodeTo.x}
                  y2={nodeTo.y}
                  stroke={isCongested ? '#451D24' : isModerate ? '#3C2E1F' : 'url(#roadGrad)'}
                  strokeWidth="1.4"
                  strokeLinecap="round"
                />
                {/* Visual lanes details */}
                <line
                  x1={nodeFrom.x}
                  y1={nodeFrom.y}
                  x2={nodeTo.x}
                  y2={nodeTo.y}
                  stroke="#334155"
                  strokeWidth="0.15"
                  strokeDasharray="2, 3"
                  className="opacity-40"
                />
              </g>
            );
          })}

          {/* ACTIVE GPS BOOKING ROUTE PATH RENDERER */}
          {pickup && dropoff && (
            <g id="active-booking-path" filter="url(#glow)">
              {/* Highlight route connection between pickup node & dropoff node */}
              <line
                x1={pickup.x}
                y1={pickup.y}
                x2={dropoff.x}
                y2={dropoff.y}
                stroke="url(#routeGrad)"
                strokeWidth="2.2"
                strokeLinecap="round"
                className="opacity-30"
              />
              <line
                x1={pickup.x}
                y1={pickup.y}
                x2={dropoff.x}
                y2={dropoff.y}
                stroke="#06B6D4"
                strokeWidth="1.0"
                strokeLinecap="round"
                strokeDasharray="3, 3"
                className="animate-[dash_10s_linear_infinite]"
              />
            </g>
          )}

          {/* MAP STATION NODES */}
          {LOCATION_NODES.map((node) => {
            const isPickup = pickup?.id === node.id;
            const isDropoff = dropoff?.id === node.id;
            const isHovered = hoveredNode?.id === node.id;

            return (
              <g 
                id={`node-${node.id}`}
                key={node.id}
                transform={`translate(${node.x}, ${node.y})`}
                className="cursor-pointer select-none group"
                onClick={() => onSelectNode(node)}
                onMouseEnter={() => setHoveredNode(node)}
                onMouseLeave={() => setHoveredNode(null)}
              >
                {/* Anchor pulse waves for state nodes */}
                {(isPickup || isDropoff) && (
                  <circle
                    cx="0"
                    cy="0"
                    r="6.5"
                    fill="none"
                    stroke={isPickup ? '#06b6d4' : '#10b981'}
                    strokeWidth="1"
                    className="animate-ping"
                    opacity="0.8"
                  />
                )}

                {/* Micro outer mouse glow trigger bounding box */}
                <circle 
                  cx="0" 
                  cy="0" 
                  r="4.5" 
                  fill="transparent" 
                  className="group-hover:fill-slate-700/10" 
                />

                {/* Stately outer ring */}
                <circle
                  cx="0"
                  cy="0"
                  r={isHovered ? '2.8' : '2.0'}
                  fill={isPickup ? '#06b6d4' : isDropoff ? '#10b981' : '#0B1528'}
                  stroke={isPickup ? '#22d3ee' : isDropoff ? '#34d399' : isHovered ? '#64748b' : '#334155'}
                  strokeWidth={isHovered || isPickup || isDropoff ? 1.0 : 0.6}
                  className="transition-all duration-200"
                  filter={isPickup || isDropoff ? 'url(#neon-glow)' : undefined}
                />

                {/* Centered focal core */}
                <circle
                  cx="0"
                  cy="0"
                  r="0.8"
                  fill={isPickup ? '#ffffff' : isDropoff ? '#ffffff' : '#475569'}
                />

                {/* Micro Floating Labels for Selected Landmarks */}
                {(isPickup || isDropoff || isHovered) && (
                  <g transform="translate(0, -5.5)" filter="url(#glow)">
                    <rect
                      x="-18"
                      y="-4.5"
                      width="36"
                      height="7.5"
                      rx="2.0"
                      fill="#0B1528"
                      stroke={isPickup ? '#06b6d4' : isDropoff ? '#10b981' : '#475569'}
                      strokeWidth="0.4"
                      className="opacity-95"
                    />
                    <text
                      x="0"
                      y="1"
                      textAnchor="middle"
                      fill={isPickup ? '#22d3ee' : isDropoff ? '#34d399' : '#e2e8f0'}
                      fontSize="1.9"
                      fontFamily="monospace"
                      fontWeight="bold"
                    >
                      {isPickup ? 'PICKUP' : isDropoff ? 'DROP' : node.name.substring(0, 16)}
                    </text>
                  </g>
                )}
              </g>
            );
          })}

          {/* ACTIVE GPS POSITION CAR / VEHICLE INDICATOR */}
          {carPos && (
            <g 
              id="simulated-vehicle-marker"
              transform={`translate(${carPos.x}, ${carPos.y}) rotate(${carRotation})`}
              className="transition-transform duration-[45ms] ease-linear"
              filter="url(#neon-glow)"
            >
              {/* Outer halo */}
              <circle
                cx="0"
                cy="0"
                r="3.5"
                fill="none"
                stroke="#06b6d4"
                strokeWidth="0.4"
                className="animate-pulse"
                opacity="0.5"
              />

              {/* Headlights cone beam projection */}
              <path
                d="M 0,0 L 5,-12 L -5,-12 Z"
                fill="url(#routeGrad)"
                opacity="0.12"
                className="transform rotate-180 origin-top"
              />

              {/* Sophisticated arrow / vehicle representation */}
              <g transform="translate(-1.4, -1.8)">
                {/* Triangular arrow nose direction marker */}
                <path
                  d="M1.4,0 L2.8,3.2 L1.4,2.3 L0,3.2 Z"
                  fill="#22d3ee"
                  stroke="#0891b2"
                  strokeWidth="0.4"
                />
              </g>

              {/* Little telemetry core dot */}
              <circle cx="0" cy="0" r="0.6" fill="#ffffff" />
            </g>
          )}
        </svg>

        {/* Floating Node Quick Selection List / Status Banner */}
        <div className="absolute bottom-4 left-4 right-4 z-10 pointer-events-none">
          {hoveredNode && (
            <div className="bg-[#0B1528]/95 border border-slate-700/60 rounded-xl px-4 py-2.5 shadow-xl backdrop-blur-md max-w-sm pointer-events-auto transform transition-all translate-y-0 opacity-100 font-sans">
              <div className="flex items-center space-x-1.5 text-cyan-400 font-semibold text-xs sm:text-sm">
                <MapPin className="h-3.5 w-3.5" />
                <span>{hoveredNode.name}</span>
              </div>
              <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5 font-normal leading-relaxed">
                {hoveredNode.tagline}
              </p>
              <div className="flex space-x-2 mt-1.5">
                <span className="text-[9px] font-semibold bg-cyan-950/70 text-cyan-400 border border-cyan-800/40 px-1.5 py-0.5 rounded uppercase font-mono">
                  {hoveredNode.type}
                </span>
                <span className="text-[9px] text-gray-500 font-mono self-center">
                  Coord: {hoveredNode.x}X, {hoveredNode.y}Y
                </span>
              </div>
            </div>
          )}

          {/* Quick instructions indicator when map is idle */}
          {!hoveredNode && status === 'idle' && (
            <div className="bg-slate-900/95 border border-slate-800/80 rounded-xl px-4 py-3 shadow-xl backdrop-blur-md max-w-sm pointer-events-auto font-sans mx-auto text-center md:mx-0 md:text-left transition-all">
              <div className="flex items-center justify-center md:justify-start space-x-2">
                <Radio className="h-4 w-4 text-cyan-400 select-none animate-pulse" />
                <span className="text-xs font-semibold text-gray-200">Interactive Simulation Active</span>
              </div>
              <p className="text-[10px] text-gray-400 mt-1 font-normal leading-normal">
                Click on any node pin on the grid to instantly assign Pick-up or Drop-off locations.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
