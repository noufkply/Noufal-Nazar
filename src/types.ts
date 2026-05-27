export type ServiceMode = 'ride' | 'delivery';

export interface LocationNode {
  id: string;
  name: string;
  x: number; // 0 to 100 coordinates
  y: number; // 0 to 100 coordinates
  type: 'residential' | 'business' | 'retail' | 'transport' | 'recreational';
  tagline: string;
}

export interface RoadSegment {
  id: string;
  from: string; // Node ID
  to: string;   // Node ID
  congestion: 'low' | 'moderate' | 'heavy';
}

export interface RideOption {
  id: string;
  name: string;
  mode: ServiceMode;
  description: string;
  baseFare: number;
  ratePerKm: number;
  etaBase: number; // base eta in minutes
  capacity: string;
  icon: string; // lucide icon identifier
  tierName: 'Budget' | 'Standard' | 'Premium' | 'Eco';
}

export interface Driver {
  id: string;
  name: string;
  rating: number;
  vehicleModel: string;
  color: string;
  licensePlate: string;
  avatar: string;
  phone: string;
  completedTrips: number;
}

export type BookingStatus =
  | 'idle'
  | 'searching_driver'
  | 'driver_enroute'  // Driver driving to pickup
  | 'driver_arrived'  // Driver waiting at pickup
  | 'trip_started'    // Passenger inside, driving to dropoff
  | 'trip_completed'; // Finished, show invoice

export interface BookingDetails {
  id: string;
  mode: ServiceMode;
  pickup: LocationNode;
  dropoff: LocationNode;
  option: RideOption;
  fare: number;
  paymentMethod: string;
  distanceKm: number;
  durationMin: number;
  passengerName: string;
  phone: string;
  // Delivery-specific fields
  packageType?: string;
  recipientName?: string;
  recipientPhone?: string;
  deliveryNotes?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'passenger' | 'driver' | 'system';
  text: string;
  timestamp: string;
}

export interface CardDetails {
  number: string;
  name: string;
  expiry: string;
  cvv: string;
}

export interface DriverReview {
  id: string;
  driverId: string;
  passengerName: string;
  rating: number;
  comment?: string;
  timestamp: string;
  serviceMode: ServiceMode;
}

