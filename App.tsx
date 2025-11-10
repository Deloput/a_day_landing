
import React, { useState, useEffect, useRef } from 'react';
import Map from './components/Map';
import EventCard from './components/EventCard';
import StoryDialog from './components/StoryDialog';
import { getGeoLocation } from './services/geo';
import { fetchEventsFromGemini } from './services/gemini';
import { EventItem, GeoLocation } from './types';

function App() {
  const [location, setLocation] = useState<GeoLocation | null>(null);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [storyEvent, setStoryEvent] = useState<EventItem | null>(null);

  const cardsRef = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // 1. INITIAL LOAD
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const loc = await getGeoLocation();
        setLocation(loc);
        const evts = await fetchEventsFromGemini(loc);
        setEvents(evts);
        if (evts.length > 0) setSelectedEventId(evts[0].id);
      } catch (e: any) {
        setError(e.message || "Could not load events.");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // 2. BIDIRECTIONAL SYNC: Scroll list when selectedEventId changes
  useEffect(() => {
    if (selectedEventId && cardsRef.current[selectedEventId]) {
      cardsRef.current[selectedEventId]?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center'
      });
    }
  }, [selectedEventId]);

  // --- RENDER STATES ---

  if (loading) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-neutral-950 text-white space-y-6">
        <div className="font-brand text-4xl tracking-tighter text-retro-outline animate-pulse">
          A DAY<br/>TODAY
        </div>
        <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin"/>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-neutral-100 p-6">
        <div className="max-w-sm text-center space-y-4">
          <div className="font-brand text-2xl text-neutral-900">OOPS</div>
          <p className="text-neutral-600">{error}</p>
          <button onClick={() => window.location.reload()} className="px-6 py-3 bg-black text-white font-bold rounded-full active:scale-95 transition-transform">
            RETRY
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full overflow-hidden bg-neutral-100 relative">
      
      {/* === DESKTOP SIDEBAR (LEFT) === */}
      <div className="hidden md:flex w-[400px] lg:w-[480px] flex-col bg-white z-20 shadow-2xl h-full shrink-0 relative">
        {/* Desktop Header */}
        <div className="p-8 pb-6 border-b border-neutral-100 shrink-0">
          <div className="font-brand text-3xl leading-none tracking-tighter text-neutral-900 mb-6">
            A DAY<br/>TODAY
          </div>
          <div>
            <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Happening Now in</p>
            <h1 className="text-2xl font-extrabold tracking-tight text-neutral-900">{location?.city}</h1>
          </div>
        </div>
        {/* Desktop List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
            {events.map(event => (
              <div key={event.id} ref={el => { cardsRef.current[event.id] = el; }}>
                <EventCard
                  event={event}
                  isActive={selectedEventId === event.id}
                  onClick={() => {
                    setSelectedEventId(event.id);
                    setStoryEvent(event);
                  }}
                />
              </div>
            ))}
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white pointer-events-none"/>
      </div>

      {/* === MAP CONTAINER (RIGHT on Desktop, FULL on Mobile) === */}
      <div className="flex-1 h-full relative z-10">
        
        {/* Mobile Floating Header */}
        <div className="md:hidden absolute top-0 left-0 z-[500] p-5 pointer-events-none">
           <div className="font-brand text-2xl leading-none tracking-tighter text-retro-outline drop-shadow-lg mb-2">
            A DAY<br/>TODAY
          </div>
          <div className="bg-neutral-900/80 backdrop-blur-md text-white px-3 py-1.5 rounded-full inline-flex items-center shadow-lg">
            <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
            <span className="text-xs font-bold uppercase tracking-wide">{location?.city}</span>
          </div>
        </div>

        {/* THE MAP */}
        {location && (
          <Map
            center={{ lat: location.latitude, lng: location.longitude }}
            events={events}
            selectedEventId={selectedEventId}
            onMarkerClick={(event) => setSelectedEventId(event.id)}
          />
        )}

        {/* Mobile Bottom Carousel */}
        <div className="md:hidden absolute bottom-0 left-0 right-0 z-[500] pb-6 pt-24 bg-gradient-to-t from-neutral-900/50 via-neutral-900/10 to-transparent pointer-events-none">
          <div className="flex overflow-x-auto snap-x snap-mandatory px-4 space-x-3 no-scrollbar pointer-events-auto">
            {events.map(event => (
              <div key={event.id} className="snap-center shrink-0 first:pl-2 last:pr-6" ref={el => { cardsRef.current[event.id] = el; }}>
                <EventCard
                  event={event}
                  isActive={selectedEventId === event.id}
                  onClick={() => setStoryEvent(event)}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* === MODAL === */}
      <StoryDialog event={storyEvent} onClose={() => setStoryEvent(null)} />
    </div>
  );
}

export default App;
