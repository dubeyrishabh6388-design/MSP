import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

export interface UserLocation {
  formatted: string;        // e.g. "Bandra West, Mumbai (400050)"
  shortArea: string;        // e.g. "Bandra West"
  city: string;             // e.g. "Mumbai"
  area?: string;            // e.g. "Bandra West, Mumbai Suburban"
  state?: string;           // e.g. "Maharashtra"
  pincode?: string;         // e.g. "400050"
  fullAddress?: string;     // e.g. "Bandra West, Mumbai Suburban, Maharashtra - 400050"
  latitude?: number;
  longitude?: number;
  isLive: boolean;
  timestamp?: number;
}

interface LocationContextType {
  location: UserLocation;
  isDetecting: boolean;
  error: string | null;
  detectLiveLocation: () => Promise<void>;
  setManualLocation: (cityOrLoc: string | Partial<UserLocation>) => void;
  clearError: () => void;
}

const DEFAULT_LOCATION: UserLocation = {
  formatted: 'Connaught Place, New Delhi (110001)',
  shortArea: 'Connaught Place',
  city: 'New Delhi',
  area: 'Central Delhi',
  state: 'Delhi',
  pincode: '110001',
  fullAddress: 'Connaught Place, Central Delhi, Delhi - 110001',
  isLive: false,
};

// Hyperlocal Hubs for Major Indian Cities with exact sub-localities
export const POPULAR_HYPERLOCAL_AREAS = [
  // Mumbai & MMR
  { area: 'Bandra West', city: 'Mumbai', state: 'Maharashtra', pincode: '400050', label: 'Bandra West, Mumbai', lat: 19.0596, lng: 72.8295 },
  { area: 'Andheri East', city: 'Mumbai', state: 'Maharashtra', pincode: '400069', label: 'Andheri East, Mumbai', lat: 19.1136, lng: 72.8697 },
  { area: 'Powai (Hiranandani)', city: 'Mumbai', state: 'Maharashtra', pincode: '400076', label: 'Powai, Mumbai', lat: 19.1176, lng: 72.9060 },
  { area: 'Juhu & Vile Parle', city: 'Mumbai', state: 'Maharashtra', pincode: '400049', label: 'Juhu, Mumbai', lat: 19.1025, lng: 72.8262 },
  { area: 'Colaba & Fort', city: 'Mumbai', state: 'Maharashtra', pincode: '400005', label: 'Colaba, South Mumbai', lat: 18.9067, lng: 72.8147 },
  { area: 'Borivali West', city: 'Mumbai', state: 'Maharashtra', pincode: '400092', label: 'Borivali West, Mumbai', lat: 19.2307, lng: 72.8567 },
  { area: 'Vashi Sector 17', city: 'Navi Mumbai', state: 'Maharashtra', pincode: '400703', label: 'Vashi, Navi Mumbai', lat: 19.0771, lng: 72.9986 },
  { area: 'Thane West (Majiwada)', city: 'Thane', state: 'Maharashtra', pincode: '400601', label: 'Thane West, MMR', lat: 19.2183, lng: 72.9781 },

  // Delhi NCR
  { area: 'Saket & Malviya Nagar', city: 'New Delhi', state: 'Delhi', pincode: '110017', label: 'Saket, South Delhi', lat: 28.5244, lng: 77.2167 },
  { area: 'Connaught Place', city: 'New Delhi', state: 'Delhi', pincode: '110001', label: 'Connaught Place, Central Delhi', lat: 28.6315, lng: 77.2167 },
  { area: 'Dwarka Sector 10', city: 'New Delhi', state: 'Delhi', pincode: '110075', label: 'Dwarka, South West Delhi', lat: 28.5823, lng: 77.0500 },
  { area: 'Sector 62', city: 'Noida', state: 'Uttar Pradesh', pincode: '201301', label: 'Sector 62, Noida', lat: 28.6258, lng: 77.3649 },
  { area: 'Cyber Hub & DLF Phase 2', city: 'Gurugram', state: 'Haryana', pincode: '122002', label: 'Cyber City, Gurugram', lat: 28.4950, lng: 77.0895 },
  { area: 'Indirapuram', city: 'Ghaziabad', state: 'Uttar Pradesh', pincode: '201014', label: 'Indirapuram, NCR', lat: 28.6415, lng: 77.3714 },

  // Bengaluru
  { area: 'Indiranagar 100ft Rd', city: 'Bengaluru', state: 'Karnataka', pincode: '560038', label: 'Indiranagar, Bengaluru', lat: 12.9784, lng: 77.6408 },
  { area: 'Koramangala 4th Block', city: 'Bengaluru', state: 'Karnataka', pincode: '560034', label: 'Koramangala, Bengaluru', lat: 12.9352, lng: 77.6245 },
  { area: 'Whitefield (ITPL)', city: 'Bengaluru', state: 'Karnataka', pincode: '560066', label: 'Whitefield, Bengaluru', lat: 12.9698, lng: 77.7500 },
  { area: 'HSR Layout Sector 1', city: 'Bengaluru', state: 'Karnataka', pincode: '560102', label: 'HSR Layout, Bengaluru', lat: 12.9121, lng: 77.6446 },
  { area: 'Electronic City Phase 1', city: 'Bengaluru', state: 'Karnataka', pincode: '560100', label: 'Electronic City, Bengaluru', lat: 12.8452, lng: 77.6602 },

  // Pune
  { area: 'Hinjewadi Phase 1', city: 'Pune', state: 'Maharashtra', pincode: '411057', label: 'Hinjewadi IT Hub, Pune', lat: 18.5913, lng: 73.7389 },
  { area: 'Baner & Balewadi', city: 'Pune', state: 'Maharashtra', pincode: '411045', label: 'Baner, Pune', lat: 18.5590, lng: 73.7868 },
  { area: 'Viman Nagar', city: 'Pune', state: 'Maharashtra', pincode: '411014', label: 'Viman Nagar, Pune', lat: 18.5679, lng: 73.9143 },

  // Hyderabad
  { area: 'HITEC City & Madhapur', city: 'Hyderabad', state: 'Telangana', pincode: '500081', label: 'HITEC City, Hyderabad', lat: 17.4474, lng: 78.3762 },
  { area: 'Gachibowli Financial Dist', city: 'Hyderabad', state: 'Telangana', pincode: '500032', label: 'Gachibowli, Hyderabad', lat: 17.4401, lng: 78.3489 },
  { area: 'Jubilee Hills Road No. 36', city: 'Hyderabad', state: 'Telangana', pincode: '500033', label: 'Jubilee Hills, Hyderabad', lat: 17.4319, lng: 78.4073 },

  // Other Metros
  { area: 'OMR & Thoraipakkam', city: 'Chennai', state: 'Tamil Nadu', pincode: '600097', label: 'OMR IT Corridor, Chennai', lat: 12.9416, lng: 80.2362 },
  { area: 'Salt Lake Sector 5', city: 'Kolkata', state: 'West Bengal', pincode: '700091', label: 'Salt Lake, Kolkata', lat: 22.5804, lng: 88.4378 },
  { area: 'Malviya Nagar', city: 'Jaipur', state: 'Rajasthan', pincode: '302017', label: 'Malviya Nagar, Jaipur', lat: 26.8530, lng: 75.8050 },
  { area: 'SG Highway & Prahlad Nagar', city: 'Ahmedabad', state: 'Gujarat', pincode: '380015', label: 'SG Highway, Ahmedabad', lat: 23.0120, lng: 72.5108 },
];

function getClosestHyperlocalArea(lat: number, lng: number) {
  let closest = POPULAR_HYPERLOCAL_AREAS[0];
  let minDistance = Infinity;

  for (const c of POPULAR_HYPERLOCAL_AREAS) {
    const dLat = (c.lat - lat) * (Math.PI / 180);
    const dLng = (c.lng - lng) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat * (Math.PI / 180)) *
        Math.cos(c.lat * (Math.PI / 180)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const distance = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    if (distance < minDistance) {
      minDistance = distance;
      closest = c;
    }
  }

  return closest;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useState<UserLocation>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('serviqa_user_location');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && parsed.formatted) {
            return parsed;
          }
        }
      } catch (e) {
        console.error('Failed to parse cached location', e);
      }
    }
    return DEFAULT_LOCATION;
  });

  const [isDetecting, setIsDetecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Save changes to localStorage
  const saveLocation = useCallback((loc: UserLocation) => {
    setLocation(loc);
    try {
      localStorage.setItem('serviqa_user_location', JSON.stringify(loc));
    } catch (e) {
      console.error('Failed to save location', e);
    }
  }, []);

  // Live Location Detection using Browser Geolocation + High-Precision Reverse Geocoding
  const detectLiveLocation = useCallback(async (): Promise<void> => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }

    setIsDetecting(true);
    setError(null);

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude, accuracy } = position.coords;
          console.log(`[Geolocation] GPS coordinates acquired: ${latitude}, ${longitude} (Accuracy: ~${Math.round(accuracy)}m)`);

          // STEP 1: Attempt OpenStreetMap Nominatim with zoom=18 for sub-locality, street & ward precision
          try {
            const nomRes = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
              { headers: { Accept: 'application/json' } }
            );

            if (nomRes.ok) {
              const nomData = await nomRes.json();
              const addr = nomData.address || {};

              // Extract sub-locality / neighborhood
              const specificArea =
                addr.suburb ||
                addr.neighbourhood ||
                addr.residential ||
                addr.subdivision ||
                addr.quarter ||
                addr.commercial ||
                addr.road ||
                '';

              // Extract city / metro
              const city =
                addr.city ||
                addr.town ||
                addr.city_district ||
                addr.municipality ||
                addr.county ||
                addr.state_district ||
                '';

              const district = addr.city_district || addr.state_district || addr.county || '';
              const state = addr.state || '';
              const pincode = addr.postcode || '';

              // Clean display shortArea
              const shortArea = specificArea || district || city || 'Local Area';
              
              // Full hyper-local display string (e.g. "Bandra West, Mumbai (400050)")
              let formatted = shortArea;
              if (city && city.toLowerCase() !== shortArea.toLowerCase()) {
                formatted = `${shortArea}, ${city}`;
              }
              if (pincode) {
                formatted += ` (${pincode})`;
              }

              // Complete multi-part address for invoices, forms & maps
              const fullAddressParts = [
                specificArea,
                district && district !== specificArea && district !== city ? district : '',
                city,
                state,
                pincode ? `- ${pincode}` : '',
              ].filter(Boolean);

              const fullAddress = fullAddressParts.join(', ');

              saveLocation({
                formatted,
                shortArea,
                city: city || shortArea,
                area: specificArea || district,
                state,
                pincode,
                fullAddress,
                latitude,
                longitude,
                isLive: true,
                timestamp: Date.now(),
              });
              setIsDetecting(false);
              resolve();
              return;
            }
          } catch (nomErr) {
            console.warn('Nominatim reverse geocode failed, trying BigDataCloud...', nomErr);
          }

          // STEP 2: Attempt BigDataCloud high-resolution client API fallback
          try {
            const res = await fetch(
              `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
            );

            if (res.ok) {
              const data = await res.json();
              const city = data.city || data.locality || data.principalSubdivision || 'Mumbai';
              
              // Find deepest locality level from administrative / informative blocks
              const adminLevels = data.localityInfo?.administrative || [];
              const subAreaObj = adminLevels.find((l: any) => l.adminLevel >= 4 && l.name && l.name !== city);
              const specificArea = data.locality && data.locality !== city ? data.locality : (subAreaObj?.name || '');

              const state = data.principalSubdivision || '';
              const pincode = data.postcode || '';
              const shortArea = specificArea || city;

              let formatted = shortArea;
              if (city && city.toLowerCase() !== shortArea.toLowerCase()) {
                formatted = `${shortArea}, ${city}`;
              }
              if (pincode) {
                formatted += ` (${pincode})`;
              }

              const fullAddress = [specificArea, city, state, pincode ? `- ${pincode}` : '']
                .filter(Boolean)
                .join(', ');

              saveLocation({
                formatted,
                shortArea,
                city,
                area: specificArea,
                state,
                pincode,
                fullAddress,
                latitude,
                longitude,
                isLive: true,
                timestamp: Date.now(),
              });
              setIsDetecting(false);
              resolve();
              return;
            }
          } catch (apiErr) {
            console.warn('BigDataCloud geocode failed, using closest hyperlocal fallback...', apiErr);
          }

          // STEP 3: Offline mathematical nearest hyperlocal Indian hub fallback
          const closest = getClosestHyperlocalArea(latitude, longitude);
          const formatted = `${closest.area}, ${closest.city} (${closest.pincode})`;
          const fullAddress = `${closest.area}, ${closest.city}, ${closest.state} - ${closest.pincode}`;

          saveLocation({
            formatted,
            shortArea: closest.area,
            city: closest.city,
            area: closest.area,
            state: closest.state,
            pincode: closest.pincode,
            fullAddress,
            latitude,
            longitude,
            isLive: true,
            timestamp: Date.now(),
          });
          setIsDetecting(false);
          resolve();
        },
        (geoErr) => {
          setIsDetecting(false);
          let message = 'Unable to retrieve your live GPS location.';
          if (geoErr.code === geoErr.PERMISSION_DENIED) {
            message = 'Browser location permission was blocked. Please enable GPS permissions.';
          } else if (geoErr.code === geoErr.POSITION_UNAVAILABLE) {
            message = 'GPS position is currently unavailable.';
          } else if (geoErr.code === geoErr.TIMEOUT) {
            message = 'GPS request timed out. Please try again.';
          }
          setError(message);
          resolve();
        },
        {
          enableHighAccuracy: true,
          timeout: 12000,
          maximumAge: 30000,
        }
      );
    });
  }, [saveLocation]);

  // Manual city / locality selection override
  const setManualLocation = useCallback(
    (cityOrLoc: string | Partial<UserLocation>) => {
      setError(null);
      if (typeof cityOrLoc === 'string') {
        const matched = POPULAR_HYPERLOCAL_AREAS.find(
          (c) =>
            c.area.toLowerCase() === cityOrLoc.toLowerCase() ||
            c.label.toLowerCase().includes(cityOrLoc.toLowerCase()) ||
            c.city.toLowerCase() === cityOrLoc.toLowerCase()
        );

        if (matched) {
          const formatted = `${matched.area}, ${matched.city} (${matched.pincode})`;
          const fullAddress = `${matched.area}, ${matched.city}, ${matched.state} - ${matched.pincode}`;

          saveLocation({
            formatted,
            shortArea: matched.area,
            city: matched.city,
            area: matched.area,
            state: matched.state,
            pincode: matched.pincode,
            fullAddress,
            latitude: matched.lat,
            longitude: matched.lng,
            isLive: false,
            timestamp: Date.now(),
          });
        } else {
          saveLocation({
            formatted: cityOrLoc,
            shortArea: cityOrLoc,
            city: cityOrLoc,
            fullAddress: cityOrLoc,
            isLive: false,
            timestamp: Date.now(),
          });
        }
      } else {
        saveLocation({
          ...DEFAULT_LOCATION,
          ...cityOrLoc,
          isLive: false,
          timestamp: Date.now(),
        });
      }
    },
    [saveLocation]
  );

  const clearError = () => setError(null);

  // Auto-detect on mount if permission was previously granted
  useEffect(() => {
    if (typeof window !== 'undefined' && 'permissions' in navigator) {
      navigator.permissions
        .query({ name: 'geolocation' })
        .then((permissionStatus) => {
          if (permissionStatus.state === 'granted') {
            detectLiveLocation();
          }
        })
        .catch(() => {});
    }
  }, [detectLiveLocation]);

  return (
    <LocationContext.Provider
      value={{
        location,
        isDetecting,
        error,
        detectLiveLocation,
        setManualLocation,
        clearError,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
}

export function useLocationContext() {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocationContext must be used within a LocationProvider');
  }
  return context;
}
