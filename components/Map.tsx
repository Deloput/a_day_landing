import React, { useEffect, useRef } from 'react';
import * as L from 'leaflet';
import { EventItem } from '../types';

interface MapProps {
  center: { lat: number; lng: number };
  events: EventItem[];
  selectedEventId: string | null;
  onMarkerClick: (event: EventItem) => void;
}

const Map: React.FC<MapProps> = ({ center, events, selectedEventId, onMarkerClick }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [id: string]: L.Marker }>({});

  // 1. Init Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [center.lat, center.lng],
      zoom: 13,
      zoomControl: false, // clean look
      attributionControl: false 
    });

    // Minimalist light tiles to make markers pop
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap &copy; CARTO',
      subdomains: 'abcd',
      maxZoom: 20
    }).addTo(map);

    mapInstanceRef.current = map;

    // Cleanup
    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // 2. Update View on Selected ID Change (Bidirectional Sync)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !selectedEventId) return;

    const selectedEvent = events.find(e => e.id === selectedEventId);
    if (selectedEvent) {
      // Smooth fly to the selected event, offset slightly if on mobile to not be hidden by carousel
      const isMobile = window.innerWidth < 768;
      const targetLat = isMobile ? selectedEvent.latitude - 0.005 : selectedEvent.latitude;
      
      map.flyTo([targetLat, selectedEvent.longitude], 14, {
        animate: true,
        duration: 0.8
      });
    }
  }, [selectedEventId, events]);

  // 3. Manage Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    events.forEach(event => {
      const isSelected = event.id === selectedEventId;

      // Custom monochrome marker design
      // Inactive: grey dot. Active: larger black pin with white border.
      const iconHtml = `
        <div class="relative flex items-center justify-center transition-all duration-500 ease-out origin-bottom ${isSelected ? 'z-50 scale-110' : 'z-10 scale-100 opacity-80 hover:opacity-100'}">
          <div class="
            ${isSelected ? 'w-8 h-8 bg-neutral-900' : 'w-4 h-4 bg-neutral-400'} 
            rounded-full border-[3px] border-white shadow-lg transition-all duration-500
          "></div>
          ${isSelected ? '<div class="absolute -bottom-2 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[8px] border-l-transparent border-r-transparent border-t-neutral-900"></div>' : ''}
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'leaflet-div-icon',
        html: iconHtml,
        iconSize: isSelected ? [32, 32] : [16, 16],
        iconAnchor: isSelected ? [16, 34] : [8, 8], // Anchor tip of pin vs center of dot
      });

      if (markersRef.current[event.id]) {
        markersRef.current[event.id].setIcon(customIcon);
        markersRef.current[event.id].setZIndexOffset(isSelected ? 1000 : 0);
      } else {
        const marker = L.marker([event.latitude, event.longitude], { icon: customIcon })
          .addTo(map)
          .on('click', () => onMarkerClick(event));
        markersRef.current[event.id] = marker;
      }
    });

    // Cleanup old markers
    Object.keys(markersRef.current).forEach(id => {
      if (!events.find(e => e.id === id)) {
        markersRef.current[id].remove();
        delete markersRef.current[id];
      }
    });
  }, [events, selectedEventId, onMarkerClick]);

  return <div ref={mapContainerRef} className="w-full h-full outline-none" />;
};

export default Map;