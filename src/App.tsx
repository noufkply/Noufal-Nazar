import React, { useState, useEffect } from 'react';
import { 
  ServiceMode, 
  LocationNode, 
  BookingStatus, 
  BookingDetails, 
  Driver, 
  ChatMessage,
  DriverReview
} from './types';
import { 
  LOCATION_NODES, 
  RIDE_OPTIONS, 
  MOCK_DRIVERS, 
  findShortestPath, 
  calculateEstDistance 
} from './utils/mockData';
import { INITIAL_REVIEWS } from './utils/initialReviews';
import MapSimulation from './components/MapSimulation';
import RideSelector from './components/RideSelector';
import DeliverySelector from './components/DeliverySelector';
import PaymentModal from './components/PaymentModal';
import DriverCard from './components/DriverCard';
import InvoiceModal from './components/InvoiceModal';
import DriverReviewRegistry from './components/DriverReviewRegistry';

import { 
  Car, 
  Navigation, 
  MapPin, 
  Clock, 
  Info, 
  RefreshCw, 
  AlertCircle, 
  ArrowRight, 
  CreditCard, 
  ShieldCheck, 
  MessageSquare,
  Activity,
  User,
  Zap,
  PackageCheck
} from 'lucide-react';

export default function App() {
  // --- STATE SYSTEM ---
  const [drivers, setDrivers] = useState<Driver[]>(() => {
    const saved = localStorage.getItem('local_drivers_v1');
    return saved ? JSON.parse(saved) : MOCK_DRIVERS;
  });

  const [reviews, setReviews] = useState<DriverReview[]>(() => {
    const saved = localStorage.getItem('local_reviews_v1');
    return saved ? JSON.parse(saved) : INITIAL_REVIEWS;
  });

  useEffect(() => {
    localStorage.setItem('local_drivers_v1', JSON.stringify(drivers));
  }, [drivers]);

  useEffect(() => {
    localStorage.setItem('local_reviews_v1', JSON.stringify(reviews));
  }, [reviews]);

  const handleAddReview = (driverId: string, ratingValue: number, commentText: string, serviceMode: ServiceMode) => {
    const newId = `new_rev_${Date.now()}`;
    const newReview: DriverReview = {
      id: newId,
      driverId,
      passengerName: activeBooking?.passengerName || passengerName || 'Anonymous',
      rating: ratingValue,
      comment: commentText.trim() || undefined,
      timestamp: new Date().toISOString(),
      serviceMode
    };

    const updatedReviews = [newReview, ...reviews];
    setReviews(updatedReviews);

    // Re-calculate the driver's dynamic score and trip stats
    setDrivers(prev => prev.map(d => {
      if (d.id === driverId) {
        const dReviews = updatedReviews.filter(r => r.driverId === d.id);
        const sum = dReviews.reduce((acc, r) => acc + r.rating, 0);
        const avg = sum / dReviews.length;
        return {
          ...d,
          rating: Number(avg.toFixed(2)),
          completedTrips: d.completedTrips + 1
        };
      }
      return d;
    }));

    // If active driver is assigned, refresh state
    if (assignedDriver && assignedDriver.id === driverId) {
      setAssignedDriver(prev => {
        if (!prev) return null;
        const dReviews = updatedReviews.filter(r => r.driverId === prev.id);
        const sum = dReviews.reduce((acc, r) => acc + r.rating, 0);
        const avg = sum / dReviews.length;
        return {
          ...prev,
          rating: Number(avg.toFixed(2)),
          completedTrips: prev.completedTrips + 1
        };
      });
    }
  };

  const [activeServiceMode, setActiveServiceMode] = useState<ServiceMode>('ride');
  const [pickup, setPickup] = useState<LocationNode | null>(null);
  const [dropoff, setDropoff] = useState<LocationNode | null>(null);
  const [selectedOptionId, setSelectedOptionId] = useState<string>('ride_subcompact');

  // Contact / Dispatcher Credentials
  const [passengerName, setPassengerName] = useState<string>('Jonathan Vance');
  const [passengerPhone, setPassengerPhone] = useState<string>('+1 (555) 789-4422');

  // Courier/Delivery specific credentials
  const [packageType, setPackageType] = useState<string>('docs');
  const [recipientName, setRecipientName] = useState<string>('');
  const [recipientPhone, setRecipientPhone] = useState<string>('');
  const [deliveryNotes, setDeliveryNotes] = useState<string>('');
  const [weightCategory, setWeightCategory] = useState<string>('light');

  // App Session Status
  const [bookingStatus, setBookingStatus] = useState<BookingStatus>('idle');
  const [paymentConfirmed, setPaymentConfirmed] = useState<boolean>(false);
  const [activeBooking, setActiveBooking] = useState<BookingDetails | null>(null);
  const [assignedDriver, setAssignedDriver] = useState<Driver | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  
  // Payment gateway trigger
  const [isPaymentOpen, setIsPaymentOpen] = useState<boolean>(false);

  // Simulated GPS Telemetry states
  const [carPos, setCarPos] = useState<{ x: number; y: number } | null>(null);
  const [carRotation, setCarRotation] = useState<number>(0);
  const [routePoints, setRoutePoints] = useState<{ x: number; y: number }[]>([]);
  const [currentPointIndex, setCurrentPointIndex] = useState<number>(0);
  const [congestionMultiplier, setCongestionMultiplier] = useState<number>(1.0);

  // Automatic state management: update default selected tier when changing service mode
  useEffect(() => {
    if (activeServiceMode === 'ride') {
      setSelectedOptionId('ride_subcompact');
    } else {
      setSelectedOptionId('deliv_bike');
    }
  }, [activeServiceMode]);

  // Compute calculated statistics
  let distanceKm = 0;
  let durationMin = 0;
  if (pickup && dropoff) {
    const stats = calculateEstDistance(pickup, dropoff);
    distanceKm = stats.distanceKm;
    durationMin = stats.durationMin;
  }

  const selectedOption = RIDE_OPTIONS.find(o => o.id === selectedOptionId) || RIDE_OPTIONS[0];
  const finalFare = distanceKm > 0 
    ? Number((selectedOption.baseFare + distanceKm * selectedOption.ratePerKm).toFixed(2)) 
    : selectedOption.baseFare;

  // Click on a node in the vector map sets pickup or dropoff automatically
  const handleSelectNodeFromMap = (node: LocationNode) => {
    if (bookingStatus !== 'idle') return; // state locked during bookings

    if (!pickup) {
      setPickup(node);
    } else if (pickup.id === node.id) {
      // Clear pickup if clicked again
      setPickup(null);
      setDropoff(null);
    } else if (!dropoff) {
      setDropoff(node);
    } else if (dropoff.id === node.id) {
      setDropoff(null);
    } else {
      // Replace dropoff
      setDropoff(node);
    }
  };

  const handleSwapAddresses = () => {
    if (bookingStatus !== 'idle') return;
    const temp = pickup;
    setPickup(dropoff);
    setDropoff(temp);
  };

  // --- BOOKING STATE MACHINE MECHANICS ---
  const handleInitiateSourcing = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pickup || !dropoff) return;

    // Form validating depending on service categories
    if (!passengerName.trim() || !passengerPhone.trim()) {
      alert("Please provide complete Passenger / Sender credentials to authorize checkout.");
      return;
    }
    if (activeServiceMode === 'delivery' && (!recipientName.trim() || !recipientPhone.trim())) {
      alert("Please specify Package Recipient name & mobile contact coordinates.");
      return;
    }

    // Launch secure payment portal
    setIsPaymentOpen(true);
  };

  const handlePaymentSucceeded = (method: string) => {
    if (!pickup || !dropoff) return;
    setPaymentConfirmed(true);

    // Save finalized booking data
    const booking: BookingDetails = {
      id: Math.random().toString(36).substring(2, 8).toUpperCase(),
      mode: activeServiceMode,
      pickup,
      dropoff,
      option: selectedOption,
      fare: finalFare,
      paymentMethod: method,
      distanceKm,
      durationMin,
      passengerName,
      phone: passengerPhone,
      packageType: activeServiceMode === 'delivery' ? packageType : undefined,
      recipientName: activeServiceMode === 'delivery' ? recipientName : undefined,
      recipientPhone: activeServiceMode === 'delivery' ? recipientPhone : undefined,
      deliveryNotes: activeServiceMode === 'delivery' ? deliveryNotes : undefined,
    };

    setActiveBooking(booking);
    setBookingStatus('searching_driver');

    // Fast simulation sequence: Driver search matches in 2 seconds
    setTimeout(() => {
      // Select driver matching preference from stateful drivers list
      let drv = drivers[0]; // tesla driver for luxury/standard
      if (selectedOptionId === 'ride_moto' || selectedOptionId === 'deliv_bike') {
        drv = drivers[3]; // leo with moto scrambler
      } else if (selectedOptionId === 'ride_suv') {
        drv = drivers[2]; // kofi with CR-V
      } else if (Math.random() > 0.5) {
        drv = drivers[1]; // evelyn with camry
      }

      setAssignedDriver(drv);
      setBookingStatus('driver_enroute');

      // Define driver's spawn starting coordinate (starts at a random neighboring node)
      const nonActiveNodes = LOCATION_NODES.filter(n => n.id !== pickup.id);
      const spawnNode = nonActiveNodes[Math.floor(Math.random() * nonActiveNodes.length)] || LOCATION_NODES[0];
      
      // Calculate full track list from SpawnNode -> PickupNode
      const driverPickupPath = findShortestPath(spawnNode.id, pickup.id);
      
      setRoutePoints(driverPickupPath);
      setCurrentPointIndex(0);
      setCarPos({ x: spawnNode.x, y: spawnNode.y });

      // Add driver greeting message automatically
      const greetingMsg: ChatMessage = {
        id: 'msg_greet',
        sender: 'driver',
        text: `Hi ${passengerName}, I am Marcus Vance. I'm assigned to your ${
          activeServiceMode === 'ride' ? 'commute request' : 'courier dispatch'
        }. I'm driving a ${drv.color} ${drv.vehicleModel} and navigating to your pickup area right now.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      
      setChatMessages([
        { id: 'sys_connect', sender: 'system', text: 'Secure encrypted dispatch channel opened', timestamp: '' },
        greetingMsg
      ]);
    }, 2000);
  };

  // --- REAL-TIME GPS RE-RENDER LOOP STATE ---
  useEffect(() => {
    let loopTimer: NodeJS.Timeout;

    if (bookingStatus === 'idle' || bookingStatus === 'searching_driver' || bookingStatus === 'trip_completed') {
      return;
    }

    const driveVelocity = 0.52 / congestionMultiplier;

    // Tick every 45ms for butter-smooth rotation and micro movements
    loopTimer = setInterval(() => {
      if (!carPos || routePoints.length === 0) return;

      const targetDestinationPoint = routePoints[currentPointIndex];
      if (!targetDestinationPoint) return;

      const dx = targetDestinationPoint.x - carPos.x;
      const dy = targetDestinationPoint.y - carPos.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < driveVelocity) {
        // Vehicle has reached the immediate road junction / node
        setCarPos({ x: targetDestinationPoint.x, y: targetDestinationPoint.y });
        
        const nextSegmentIndex = currentPointIndex + 1;
        if (nextSegmentIndex < routePoints.length) {
          setCurrentPointIndex(nextSegmentIndex);
        } else {
          // Finished the active pathfinder routing! Check status
          if (bookingStatus === 'driver_enroute') {
            // Driver arrived at candidate pickup!
            setBookingStatus('driver_arrived');
            
            const arriveMsg: ChatMessage = {
              id: 'msg_arrive',
              sender: 'driver',
              text: `I've arrived at your pickup node (${pickup?.name})! I'm parked near the loading street lane with hazard lights flashing.`,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            setChatMessages(prev => [...prev, arriveMsg]);

            // Auto boarding transition after brief passenger delay
            setTimeout(() => {
              setBookingStatus('trip_started');
              if (pickup && dropoff) {
                // Calculate new GPS sequence: Pickup -> Dropoff
                const tripRoadSegments = findShortestPath(pickup.id, dropoff.id);
                setRoutePoints(tripRoadSegments);
                setCurrentPointIndex(0);
                
                const startMsg: ChatMessage = {
                  id: 'msg_start',
                  sender: 'driver',
                  text: `Welcome aboard! Commencing drive to ${dropoff.name}. Settle in comfortably.`,
                  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                };
                setChatMessages(prev => [...prev, startMsg]);
              }
            }, 4500);

          } else if (bookingStatus === 'trip_started') {
            // Reached dropoff node!
            setBookingStatus('trip_completed');
            setCarPos(null);
          }
        }
      } else {
        // Linearly interpolate coordinates
        const bearingAngle = Math.atan2(dy, dx);
        const movingX = carPos.x + Math.cos(bearingAngle) * driveVelocity;
        const movingY = carPos.y + Math.sin(bearingAngle) * driveVelocity;
        
        // Convert radian to compass heading degree
        const compassHeadingDec = (bearingAngle * 180) / Math.PI;

        setCarPos({ x: movingX, y: movingY });
        setCarRotation(compassHeadingDec);
      }
    }, 45);

    return () => clearInterval(loopTimer);
  }, [bookingStatus, carPos, routePoints, currentPointIndex, congestionMultiplier, pickup, dropoff]);


  // Send interactive message to Driver
  const handleSendMessageToDriver = (text: string) => {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      sender: 'passenger',
      text,
      timestamp
    };

    setChatMessages(prev => [...prev, userMsg]);

    // Simple keyword-matching simulated driver replies
    setTimeout(() => {
      let replyText = "Understood. Maintaining constant heading.";
      const query = text.toLowerCase();

      if (query.includes('where') || query.includes('map') || query.includes('far')) {
        replyText = bookingStatus === 'driver_enroute'
          ? "Just crossing the intersections now. I am approx 1-2 mins away from your location!"
          : "Navigating along designated city lanes. ETA is perfectly on track.";
      } else if (query.includes('hurry') || query.includes('late') || query.includes('fast')) {
        replyText = "Sure thing! Optimizing route navigation speeds while maintaining safety limits.";
      } else if (query.includes('hello') || query.includes('hi ') || query.includes('hey')) {
        replyText = "Hello! Sourcing complete. Let me know if you need temperature adjustment or phone chargers.";
      } else if (query.includes('wait') || query.includes('minute') || query.includes('coming')) {
        replyText = "No worries, take your time! I'm parked safely to hold dispatch lanes.";
      }

      const driverReply: ChatMessage = {
        id: `drv_${Date.now()}`,
        sender: 'driver',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatMessages(prev => [...prev, driverReply]);
    }, 1200);
  };

  // --- CHEAT ENGINE fast-forwards routing teleports ---
  const handleSimulateFastForward = () => {
    if (routePoints.length > 0) {
      // Teleport car instantly to the final node in active list
      const finalDest = routePoints[routePoints.length - 1];
      if (finalDest) {
        setCarPos({ x: finalDest.x, y: finalDest.y });
        setCurrentPointIndex(routePoints.length - 1);
      }
    }
  };

  const handleToggleCongestion = () => {
    setCongestionMultiplier(prev => (prev > 1.0 ? 1.0 : 3.0));
  };

  const handleResetSession = () => {
    setPickup(null);
    setDropoff(null);
    setBookingStatus('idle');
    setPaymentConfirmed(false);
    setActiveBooking(null);
    setAssignedDriver(null);
    setChatMessages([]);
    setCarPos(null);
    setRoutePoints([]);
    setCongestionMultiplier(1.0);
    setRecipientName('');
    setRecipientPhone('');
    setDeliveryNotes('');
  };

  return (
    <div id="app-root-shell" className="min-h-screen bg-[#060913] text-gray-100 flex flex-col font-sans transition-all selection:bg-cyan-500 selection:text-cyan-950">
      
      {/* GLOBAL HIGH-FIDELITY NAVIGATION BAR */}
      <header className="border-b border-slate-800 bg-[#0B0F19]/90 px-6 py-4 flex items-center justify-between sticky top-0 z-40 backdrop-blur-md select-none">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 bg-cyan-950 border border-cyan-700/60 rounded-xl flex items-center justify-center text-cyan-400 font-black tracking-tight shadow-md filter drop-shadow-[0_0_6px_rgba(6,182,212,0.15)] animate-[pulse_3s_ease_infinite]">
            <Navigation className="h-5.5 w-5.5 rotate-45 transform text-cyan-400 fill-cyan-400/10" />
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-bold text-white tracking-wide">
              Local Transport & Delivery
            </h1>
            <p className="text-[10px] text-gray-500 font-semibold font-mono tracking-widest leading-none mt-1">
              METROPOLITAN ON-DEMAND CONNECT
            </p>
          </div>
        </div>

        {/* Dispatch Operator Telemetry Bar */}
        <div className="hidden md:flex items-center space-x-6 font-mono text-[11px] text-slate-400 bg-slate-950 px-4 py-2 rounded-xl border border-slate-800">
          <div className="flex items-center space-x-2">
            <User className="h-3.5 w-3.5 text-slate-500" />
            <span className="text-gray-300">noufalprivate1@gmail.com</span>
          </div>
          <div className="h-4 w-px bg-slate-800" />
          <div className="flex items-center space-x-2">
            <Clock className="h-3.5 w-3.5 text-cyan-500 animate-[pulse_2s_infinite]" />
            <span className="text-cyan-400 font-bold">2026-05-27 21:34:38 UTC</span>
          </div>
        </div>
      </header>

      {/* DUAL MODE SELECTOR HEADER BAR */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 pt-6 select-none">
        <div className="bg-[#0B0F19]/80 border border-slate-800 p-2 rounded-2xl flex max-w-md mx-auto md:mx-0 shadow-lg">
          <button
            id="service-tab-ride"
            onClick={() => bookingStatus === 'idle' && setActiveServiceMode('ride')}
            disabled={bookingStatus !== 'idle'}
            className={`flex-1 py-3 text-sm font-semibold rounded-xl flex items-center justify-center space-x-2 transition-all cursor-pointer ${
              activeServiceMode === 'ride'
                ? 'bg-cyan-600 text-cyan-950 shadow-md font-bold'
                : 'text-gray-400 hover:text-gray-200 disabled:opacity-50'
            }`}
          >
            <Car className="h-4.5 w-4.5" />
            <span>Passenger Rides</span>
          </button>
          
          <button
            id="service-tab-devlivery"
            onClick={() => bookingStatus === 'idle' && setActiveServiceMode('delivery')}
            disabled={bookingStatus !== 'idle'}
            className={`flex-1 py-3 text-sm font-semibold rounded-xl flex items-center justify-center space-x-2 transition-all cursor-pointer ${
              activeServiceMode === 'delivery'
                ? 'bg-emerald-600 text-emerald-950 shadow-md font-bold'
                : 'text-gray-400 hover:text-gray-200 disabled:opacity-50'
            }`}
          >
            <PackageCheck className="h-4.5 w-4.5" />
            <span>Courier Delivery</span>
          </button>
        </div>
      </div>

      {/* CORE SPLIT SCREEN VIEW DASHBOARD */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: INTERACTIVE NAVIGATION MAP (LARGER SPACE) */}
        <div className="lg:col-span-7 xl:col-span-8 flex flex-col h-full bg-[#0B0F19]/20 rounded-2xl">
          <MapSimulation
            pickup={pickup}
            dropoff={dropoff}
            onSelectNode={handleSelectNodeFromMap}
            status={bookingStatus}
            carPos={carPos}
            carRotation={carRotation}
          />
        </div>

        {/* RIGHT COLUMN: BOOKING FLOW DIAGRAMS & SESSION TELEMETRIES */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-6">
          
          {/* Booking State Idle Option panel */}
          {bookingStatus === 'idle' && (
            <form onSubmit={handleInitiateSourcing} className="bg-[#0B1222]/90 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-6">
              
              {/* Address Sourcing Node Cards */}
              <div className="relative space-y-3 font-sans">
                {/* Visual connecting connector line */}
                <div className="absolute left-6.5 top-8.5 bottom-8.5 w-0.5 bg-dashed border-l border-slate-700/60 z-0" />

                {/* Pickup Field */}
                <div className="relative">
                  <label className="block text-[10px] uppercase font-semibold font-mono text-gray-400 mb-1 select-none">
                    Departure Pickup Landmark
                  </label>
                  <div className="relative z-10 flex space-x-2">
                    <div className="h-9 w-9 bg-cyan-950 border border-cyan-800/40 rounded-xl flex items-center justify-center text-cyan-400 flex-shrink-0">
                      <MapPin className="h-4.5 w-4.5" />
                    </div>
                    <select
                      id="select-pickup"
                      value={pickup?.id || ''}
                      onChange={(e) => {
                        const node = LOCATION_NODES.find(n => n.id === e.target.value);
                        setPickup(node || null);
                      }}
                      className="flex-1 bg-[#070A13] border border-slate-800 focus:border-cyan-500 text-gray-200 rounded-xl px-3 py-2 text-sm outline-none transition-all cursor-pointer"
                    >
                      <option value="">-- Choose departure pin --</option>
                      {LOCATION_NODES.map((node) => (
                        <option key={node.id} value={node.id} disabled={dropoff?.id === node.id}>
                          {node.name} ({node.type.toUpperCase()})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Central address swap trigger */}
                <div className="flex justify-end pr-2 py-0.5 relative z-10">
                  <button
                    id="swap-addresses"
                    type="button"
                    onClick={handleSwapAddresses}
                    className="p-1 px-2.5 rounded-lg border border-slate-800 bg-[#070A13] hover:bg-slate-900 text-[10px] font-mono font-semibold tracking-wider text-cyan-400 hover:text-cyan-300 transition-all flex items-center space-x-1 outline-none select-none"
                  >
                    <RefreshCw className="h-3 w-3 select-none" />
                    <span>SWAP NODES</span>
                  </button>
                </div>

                {/* Dropoff Field */}
                <div className="relative">
                  <label className="block text-[10px] uppercase font-semibold font-mono text-gray-400 mb-1 select-none">
                    Destination Dropoff Landmark
                  </label>
                  <div className="relative z-10 flex space-x-2">
                    <div className="h-9 w-9 bg-emerald-950 border border-emerald-800/40 rounded-xl flex items-center justify-center text-emerald-400 flex-shrink-0">
                      <MapPin className="h-4.5 w-4.5" />
                    </div>
                    <select
                      id="select-dropoff"
                      value={dropoff?.id || ''}
                      onChange={(e) => {
                        const node = LOCATION_NODES.find(n => n.id === e.target.value);
                        setDropoff(node || null);
                      }}
                      className="flex-1 bg-[#070A13] border border-slate-800 focus:border-emerald-500 text-gray-200 rounded-xl px-3 py-2 text-sm outline-none transition-all cursor-pointer"
                    >
                      <option value="">-- Choose dropoff pin --</option>
                      {LOCATION_NODES.map((node) => (
                        <option key={node.id} value={node.id} disabled={pickup?.id === node.id}>
                          {node.name} ({node.type.toUpperCase()})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* STATS PREVIEW HOVER PANEL */}
              {pickup && dropoff ? (
                <div className="bg-[#070A13] p-4.5 rounded-2xl border border-slate-800/80 space-y-3 font-sans transition-all animate-[slide-down_0.25s_ease-out]">
                  <div className="flex items-center justify-between text-xs font-mono text-slate-500 select-none">
                    <span>COMPUTED ROUTE STATS</span>
                    <span className="text-cyan-500 animate-pulse">● LINK_OK</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/40 text-left">
                      <span className="text-[10px] text-gray-500 font-mono leading-none select-none uppercase block">Sourcing Distance</span>
                      <span className="text-lg sm:text-xl font-bold font-mono text-cyan-400 tracking-tight leading-none mt-1.5 block">
                        {distanceKm} km
                      </span>
                    </div>
                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/40 text-left">
                      <span className="text-[10px] text-gray-500 font-mono leading-none select-none uppercase block">Travel Duration</span>
                      <span className="text-lg sm:text-xl font-bold font-mono text-cyan-400 tracking-tight leading-none mt-1.5 block">
                        {durationMin} mins
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-900 text-center select-none py-6">
                  <Info className="h-5 w-5 text-slate-600 mx-auto" />
                  <p className="text-xs text-slate-500 mt-2 font-normal leading-relaxed max-w-xs mx-auto">
                    To begin, select pickup and dropoff coordinates using the maps node pins or drop downs.
                  </p>
                </div>
              )}

              {/* RIDE SELECTOR FIELDS */}
              {pickup && dropoff && (
                <div className="animate-[fade-in_0.3s_ease]">
                  <RideSelector
                    selectedOptionId={selectedOptionId}
                    onSelectOption={setSelectedOptionId}
                    serviceMode={activeServiceMode}
                    distanceKm={distanceKm}
                    durationMin={durationMin}
                    passengerName={passengerName}
                    setPassengerName={setPassengerName}
                    passengerPhone={passengerPhone}
                    setPassengerPhone={setPassengerPhone}
                  />

                  {/* Courier delivery section expansion */}
                  {activeServiceMode === 'delivery' && (
                    <div className="mt-6 border-t border-slate-800 pt-6">
                      <DeliverySelector
                        packageType={packageType}
                        setPackageType={setPackageType}
                        recipientName={recipientName}
                        setRecipientName={setRecipientName}
                        recipientPhone={recipientPhone}
                        setRecipientPhone={setRecipientPhone}
                        deliveryNotes={deliveryNotes}
                        setDeliveryNotes={setDeliveryNotes}
                        weightCategory={weightCategory}
                        setWeightCategory={setWeightCategory}
                      />
                    </div>
                  )}

                  {/* AUTHORIZE BOOKING PROCEED CTA */}
                  <div className="pt-6 border-t border-slate-800 mt-6">
                    <button
                      id="request-booking"
                      type="submit"
                      className="w-full bg-cyan-600 hover:bg-cyan-500 text-cyan-950 font-extrabold py-4 px-4 rounded-2xl text-sm transition-all shadow-xl flex items-center justify-center space-x-2 select-none"
                    >
                      <CreditCard className="h-4.5 w-4.5" />
                      <span>Proceed to Integrated Payments (${finalFare.toFixed(2)})</span>
                    </button>
                    <p className="text-[10px] text-gray-500 font-normal text-center mt-3 select-none leading-normal">
                      Holding security auth code bypass verified on card billing authorization. Cancel anytime.
                    </p>
                  </div>
                </div>
              )}
            </form>
          )}

          {/* Booking State Searching Driver Loader */}
          {bookingStatus === 'searching_driver' && (
            <div className="bg-[#0B1222]/95 border border-slate-800 rounded-2xl p-6 shadow-xl text-center space-y-6 flex flex-col items-center py-12 animate-[fade-in_0.3s_ease]">
              <div className="relative flex items-center justify-center h-16 w-16">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-20"></span>
                <div className="rounded-full h-12 w-12 border-2 border-dashed border-cyan-400 animate-spin flex items-center justify-center bg-slate-900">
                  <Activity className="h-5 w-5 text-cyan-400" />
                </div>
              </div>

              <div className="text-center font-sans space-y-1.5">
                <span className="text-[10px] uppercase font-semibold font-mono tracking-widest text-[#06B6D4] select-none block">
                  Metropolitan Sourcing Active
                </span>
                <h4 className="text-base font-bold text-gray-200">Matching Nearest Delivery Fleet...</h4>
                <p className="text-xs text-gray-400 leading-normal max-w-xs mx-auto">
                  Sourcing grid coordinate nodes for available hybrid drivers or motorcycle couriers close to {pickup?.name}.
                </p>
              </div>

              {/* Simple simulated ping console logging lines */}
              <div className="bg-[#070A13] border border-slate-800/80 rounded-xl px-4 py-3 font-mono text-[10px] text-left text-cyan-500 select-none w-full space-y-1">
                <div className="flex justify-between">
                  <span>PINGING_NODE_ID:</span>
                  <span className="text-slate-500">{pickup?.id}</span>
                </div>
                <div className="flex justify-between">
                  <span>DISPATCH_RATE:</span>
                  <span className="text-emerald-400">${finalFare.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>GATEWAY_STATUS:</span>
                  <span className="text-cyan-400 font-bold">SECURE_CARD_HOLD_OK</span>
                </div>
              </div>
            </div>
          )}

          {/* ACTIVE LIVE TRIP TRACKING TERMINAL DIAGRAM */}
          {assignedDriver && (bookingStatus === 'driver_enroute' || bookingStatus === 'driver_arrived' || bookingStatus === 'trip_started') && (
            <div className="space-y-6">
              <DriverCard
                driver={assignedDriver}
                status={bookingStatus}
                chatMessages={chatMessages}
                onSendMessage={handleSendMessageToDriver}
                onFastForward={handleSimulateFastForward}
                congestionMultiplier={congestionMultiplier}
                onToggleCongestion={handleToggleCongestion}
              />

              {/* Interactive Telemetry HUD Dashboard Card */}
              <div className="bg-[#070A13] border border-slate-800 rounded-2xl p-4.5 space-y-4 font-mono text-xs">
                <div className="flex items-center justify-between text-slate-500 select-none text-[10px] uppercase font-semibold">
                  <span>VEHICLE TELEMETRY CONSOLE</span>
                  <Activity className="h-3.5 w-3.5 text-cyan-400 animate-pulse animate-[pulse_1s_infinite]" />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-[#0B1222] border border-slate-800/60 p-2.5 rounded-xl">
                    <span className="text-gray-500 text-[9px] block">CURRENT VEHICLE SPEED</span>
                    <span className="text-sm font-bold text-gray-200 mt-1 block">
                      {bookingStatus === 'driver_arrived' ? '0.0 km/h (PARKED)' : `${(45 / congestionMultiplier).toFixed(0)} km/h`}
                    </span>
                  </div>
                  <div className="bg-[#0B1222] border border-slate-800/60 p-2.5 rounded-xl">
                    <span className="text-gray-505 text-[9px] block">ACTIVE COMPASS BEARING</span>
                    <span className="text-sm font-bold text-gray-200 mt-1 block">
                      {carRotation.toFixed(0)}° NE-GRID
                    </span>
                  </div>
                </div>

                {/* Telemetry checkmarks */}
                <div className="space-y-1.5 text-[10px] text-gray-400 bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/20 leading-none">
                  <div className="flex items-center space-x-2">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Metropolitan Sourcing Insurance Covered</span>
                  </div>
                  <div className="flex items-center space-x-2 mt-1">
                    <Zap className="h-3.5 w-3.5 text-cyan-400" />
                    <span>Route navigation authorized on grid channels</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ACTIVE INVOICE FINAL SCREEN MODAL */}
          {bookingStatus === 'trip_completed' && activeBooking && assignedDriver && (
            <InvoiceModal
              booking={activeBooking}
              driver={assignedDriver}
              onSubmitReview={(ratingVal, commentText) => {
                handleAddReview(assignedDriver.id, ratingVal, commentText, activeBooking?.mode || 'ride');
              }}
              onFinished={handleResetSession}
            />
          )}

        </div>
      </main>

      {/* DRIVER REGISTRY AND REVIEWS SYSTEM */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 pb-12">
        <DriverReviewRegistry
          drivers={drivers}
          reviews={reviews}
          onAddReview={handleAddReview}
        />
      </section>

      {/* FOOTER DESCRIPTIVE METRICS */}
      <footer className="border-t border-slate-800/80 bg-[#0B0F19]/40 py-6 px-4 text-center text-xs text-gray-500 font-mono select-none mt-auto">
        <p>© 2026 Local Transport & Delivery Simulator Systems Corp.</p>
        <p className="mt-1 text-[10px] text-gray-600">
          Crafted securely under Sandboxed Iframe Permissions and React 19 rules.
        </p>
      </footer>

      {/* INJECTED INTEGRATED STRIPE CHECKOUT MODAL WINDOWS */}
      <PaymentModal
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        amount={finalFare}
        onPaymentSuccess={handlePaymentSucceeded}
      />
    </div>
  );
}
