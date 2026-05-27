import { LocationNode, RoadSegment, RideOption, Driver } from '../types';

export const LOCATION_NODES: LocationNode[] = [
  { id: 'POI_DOWNTOWN', name: 'Downtown Plaza', x: 50, y: 50, type: 'business', tagline: 'Central Business Hub & Civic district' },
  { id: 'POI_SUBURBS', name: 'Oakwood Estates', x: 15, y: 20, type: 'residential', tagline: 'Quiet leafy suburbs and family complexes' },
  { id: 'POI_TECHPARK', name: 'Silicon District', x: 80, y: 20, type: 'business', tagline: 'Tech incubators, server clusters & offices' },
  { id: 'POI_MALL', name: 'Galleria Mall', x: 45, y: 80, type: 'retail', tagline: 'Premium retail stores and luxury brands' },
  { id: 'POI_HOSPITAL', name: 'General Medical Center', x: 75, y: 70, type: 'business', tagline: '24/7 emergency medical care units' },
  { id: 'POI_AIRPORT', name: 'International Airport', x: 15, y: 80, type: 'transport', tagline: 'Global departure terminal & skyport' },
  { id: 'POI_HARBOR', name: 'Old Waterfront Marina', x: 10, y: 50, type: 'transport', tagline: 'Vintage ship piers and seaside market' },
  { id: 'POI_LAKES', name: 'Greenwood Lake Park', x: 85, y: 85, type: 'recreational', tagline: 'Picturesque pine woods and recreational lakes' },
  { id: 'POI_ARTS', name: 'Art Museum & Theatre', x: 55, y: 25, type: 'recreational', tagline: 'Symphony halls and modern art galleries' },
  { id: 'POI_COLLEGE', name: 'Metropolitan University', x: 30, y: 45, type: 'business', tagline: 'Stately brick lecture halls & green campus' }
];

export const ROAD_SEGMENTS: RoadSegment[] = [
  { id: 'R1', from: 'POI_SUBURBS', to: 'POI_COLLEGE', congestion: 'low' },
  { id: 'R2', from: 'POI_SUBURBS', to: 'POI_ARTS', congestion: 'moderate' },
  { id: 'R3', from: 'POI_HARBOR', to: 'POI_COLLEGE', congestion: 'low' },
  { id: 'R4', from: 'POI_HARBOR', to: 'POI_AIRPORT', congestion: 'moderate' },
  { id: 'R5', from: 'POI_AIRPORT', to: 'POI_MALL', congestion: 'moderate' },
  { id: 'R6', from: 'POI_COLLEGE', to: 'POI_DOWNTOWN', congestion: 'heavy' },
  { id: 'R7', from: 'POI_ARTS', to: 'POI_DOWNTOWN', congestion: 'low' },
  { id: 'R8', from: 'POI_ARTS', to: 'POI_TECHPARK', congestion: 'low' },
  { id: 'R9', from: 'POI_DOWNTOWN', to: 'POI_TECHPARK', congestion: 'heavy' },
  { id: 'R10', from: 'POI_DOWNTOWN', to: 'POI_MALL', congestion: 'heavy' },
  { id: 'R11', from: 'POI_DOWNTOWN', to: 'POI_HOSPITAL', congestion: 'moderate' },
  { id: 'R12', from: 'POI_TECHPARK', to: 'POI_HOSPITAL', congestion: 'low' },
  { id: 'R13', from: 'POI_MALL', to: 'POI_LAKES', congestion: 'low' },
  { id: 'R14', from: 'POI_HOSPITAL', to: 'POI_LAKES', congestion: 'low' }
];

export const RIDE_OPTIONS: RideOption[] = [
  {
    id: 'ride_subcompact',
    name: 'EcoRide',
    mode: 'ride',
    description: 'Compact hybrid electric cars for everyday budget commutes.',
    baseFare: 3.50,
    ratePerKm: 1.20,
    etaBase: 4,
    capacity: '1-4 passengers',
    icon: 'Car',
    tierName: 'Budget'
  },
  {
    id: 'ride_premium',
    name: 'Black Cruiser',
    mode: 'ride',
    description: 'Premium executive saloons with top-tier interior styling and leather seating.',
    baseFare: 7.00,
    ratePerKm: 2.50,
    etaBase: 6,
    capacity: '1-4 passengers (VIP)',
    icon: 'Sparkles',
    tierName: 'Premium'
  },
  {
    id: 'ride_suv',
    name: 'Comfort XL',
    mode: 'ride',
    description: 'Spacious high-ground clearance SUVs, perfect for heavy luggage and group travel.',
    baseFare: 6.00,
    ratePerKm: 1.80,
    etaBase: 5,
    capacity: '1-6 passengers',
    icon: 'Users',
    tierName: 'Standard'
  },
  {
    id: 'ride_moto',
    name: 'Moto-Swift',
    mode: 'ride',
    description: 'Bypass traffic blocks with expert motorcycle riders. Single passenger limit.',
    baseFare: 2.00,
    ratePerKm: 0.80,
    etaBase: 2,
    capacity: '1 passenger',
    icon: 'Bike',
    tierName: 'Eco'
  },
  {
    id: 'deliv_bike',
    name: 'Bike Courier',
    mode: 'delivery',
    description: 'Ultra-fast bicycle and scooter distribution for small packages, documents & meals.',
    baseFare: 1.80,
    ratePerKm: 0.60,
    etaBase: 3,
    capacity: 'Up to 5 kg',
    icon: 'Zap',
    tierName: 'Eco'
  },
  {
    id: 'deliv_cargo',
    name: 'Standard Van',
    mode: 'delivery',
    description: 'Full cargo vans and trucks for heavy deliveries, boxed items, and home furniture.',
    baseFare: 12.00,
    ratePerKm: 3.20,
    etaBase: 8,
    capacity: 'Up to 250 kg',
    icon: 'Truck',
    tierName: 'Standard'
  }
];

export const MOCK_DRIVERS: Driver[] = [
  {
    id: 'drv_1',
    name: 'Marcus Vance',
    rating: 4.96,
    vehicleModel: 'Tesla Model 3',
    color: 'Cosmic Silver',
    licensePlate: 'LV-77Y-99',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    phone: '+1 (555) 789-0122',
    completedTrips: 4850
  },
  {
    id: 'drv_2',
    name: 'Evelyn Parker',
    rating: 4.89,
    vehicleModel: 'Toyota Camry Hybrid',
    color: 'Pacific Blue',
    licensePlate: 'DX-11Z-50',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    phone: '+1 (555) 345-6711',
    completedTrips: 1220
  },
  {
    id: 'drv_3',
    name: 'Kofi Thompson',
    rating: 4.93,
    vehicleModel: 'Honda CR-V XL',
    color: 'Charcoal Grey',
    licensePlate: 'TX-44R-88',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
    phone: '+1 (555) 901-2388',
    completedTrips: 3410
  },
  {
    id: 'drv_4',
    name: 'Leo Nakamura',
    rating: 4.82,
    vehicleModel: 'Ducati Scrambler 800',
    color: 'Solar Yellow',
    licensePlate: 'MC-22X-01',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    phone: '+1 (555) 465-9922',
    completedTrips: 940
  }
];

// Helper to find the shortest path in the graph using BFS
export function findShortestPath(startNodeId: string, endNodeId: string): LocationNode[] {
  if (startNodeId === endNodeId) {
    const node = LOCATION_NODES.find(n => n.id === startNodeId);
    return node ? [node] : [];
  }

  // Build adjacency list (undirected graph)
  const adjList: Record<string, string[]> = {};
  LOCATION_NODES.forEach(n => {
    adjList[n.id] = [];
  });

  ROAD_SEGMENTS.forEach(road => {
    adjList[road.from].push(road.to);
    adjList[road.to].push(road.from);
  });

  const queue: string[][] = [[startNodeId]];
  const visited = new Set<string>([startNodeId]);

  while (queue.length > 0) {
    const path = queue.shift()!;
    const currentNodeId = path[path.length - 1];

    if (currentNodeId === endNodeId) {
      // Decode into full node objects
      return path.map(id => LOCATION_NODES.find(n => n.id === id)!);
    }

    const neighbors = adjList[currentNodeId] || [];
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push([...path, neighbor]);
      }
    }
  }

  // Fallback: search failed, just connect straight
  const startNode = LOCATION_NODES.find(n => n.id === startNodeId);
  const endNode = LOCATION_NODES.find(n => n.id === endNodeId);
  return startNode && endNode ? [startNode, endNode] : [];
}

// Calculate driving distance (Euclidean distance with a routing adjustment factor)
export function calculateEstDistance(n1: LocationNode, n2: LocationNode): { distanceKm: number, durationMin: number } {
  const dx = n1.x - n2.x;
  const dy = n1.y - n2.y;
  const straightLine = Math.sqrt(dx * dx + dy * dy);
  
  // Let's assume each unit is around 150 meters, so 0-100 grid represents approximately 15 x 15 km area.
  // Straight line gets multiplied by a realistic city street factor (1.35) and grid multiplier (0.15 km per unit).
  const distanceKm = Number((straightLine * 1.35 * 0.15).toFixed(1));
  
  // Calculate duration assuming average city speeds (e.g. 40 km/h is 1.5 minutes per km) + traffic addition
  const durationMin = Math.max(Math.ceil(distanceKm * 1.75 + 3), 4);
  
  return { distanceKm, durationMin };
}
