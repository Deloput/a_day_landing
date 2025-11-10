
import React, { useState, useEffect, useRef } from 'react';
import Map from './components/Map';
import EventCard from './components/EventCard';
import SkeletonCard from './components/SkeletonCard';
import StoryDialog from './components/StoryDialog';
import { getGeoLocation } from './services/geo';
import { fetchEventsFromGemini } from './services/gemini';
import { EventItem, GeoLocation } from './types';

function App() {
  const [location, setLocation] = useState<GeoLocation | null>(null);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showSkeleton, setShowSkeleton] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [storyEvent, setStoryEvent] = useState<EventItem | null>(null);

  const cardsRef = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 1. INITIAL LOAD
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        
        // Set timeout to show skeleton UI after 2 seconds
        loadingTimeoutRef.current = setTimeout(() => {
          console.log("⏱️ Loading taking longer than 2s, showing skeleton UI...");
          setLoading(false);
          setShowSkeleton(true);
        }, 2000);
        
        const loc = await getGeoLocation();
        setLocation(loc);
        
        const evts = await fetchEventsFromGemini(loc);
        
        // Clear timeout if data loaded successfully
        if (loadingTimeoutRef.current) {
          clearTimeout(loadingTimeoutRef.current);
        }
        
        // Check if we got fallback events
        if (evts && evts.length > 0) {
          setEvents(evts);
          if (evts[0].id.startsWith('fallback_')) {
            console.info("Showing demo events (API unavailable)");
          }
          setSelectedEventId(evts[0].id);
          setShowSkeleton(false); // Hide skeleton when data arrives
        } else {
          throw new Error("No events available");
        }
      } catch (e: any) {
        // Clear timeout on error
        if (loadingTimeoutRef.current) {
          clearTimeout(loadingTimeoutRef.current);
        }
        
        // Only set error if we truly have no data and skeleton is not showing
        if (!events || events.length === 0) {
          if (showSkeleton) {
            // If skeleton is showing, keep trying in background
            console.warn("Error while loading, keeping skeleton:", e.message);
          } else {
            setError(e.message || "Could not load events.");
          }
        }
      } finally {
        setLoading(false);
      }
    }
    loadData();
    
    // Cleanup timeout on unmount
    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
    };
  }, []);

  // 2. BACKGROUND LOADING: Keep trying to load data if skeleton is showing
  useEffect(() => {
    if (!showSkeleton || !location) return;
    
    let retryCount = 0;
    const maxRetries = 5;
    const retryInterval = 3000; // 3 seconds between retries
    
    const retryTimer = setInterval(async () => {
      retryCount++;
      console.log(`🔄 Background retry ${retryCount}/${maxRetries}...`);
      
      try {
        const evts = await fetchEventsFromGemini(location);
        if (evts && evts.length > 0) {
          console.log("✅ Background loading successful!");
          setEvents(evts);
          setSelectedEventId(evts[0].id);
          setShowSkeleton(false);
          clearInterval(retryTimer);
        }
      } catch (e) {
        console.warn(`Background retry ${retryCount} failed:`, e);
        if (retryCount >= maxRetries) {
          console.log("❌ Max retries reached, stopping background loading");
          clearInterval(retryTimer);
        }
      }
    }, retryInterval);
    
    return () => clearInterval(retryTimer);
  }, [showSkeleton, location]);

  // 3. BIDIRECTIONAL SYNC: Scroll list when selectedEventId changes
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
    // Check if it's an API overload error
    const isApiError = error.includes('503') || error.includes('overloaded') || error.includes('UNAVAILABLE');
    
    return (
      <div className="flex h-screen w-full items-center justify-center bg-neutral-100 p-6">
        <div className="max-w-md text-center space-y-4">
          <div className="font-brand text-2xl text-neutral-900">
            {isApiError ? '⏳ SERVICE BUSY' : 'OOPS'}
          </div>
          <p className="text-neutral-600">
            {isApiError 
              ? "Our AI service is experiencing high demand right now. We'll show you demo events while we retry in the background."
              : error
            }
          </p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-6 py-3 bg-black text-white font-bold rounded-full active:scale-95 transition-transform hover:bg-neutral-800"
          >
            {isApiError ? 'TRY AGAIN' : 'RETRY'}
          </button>
          {isApiError && (
            <p className="text-xs text-neutral-400 mt-2">
              Demo events are being shown. Refresh to try loading real events.
            </p>
          )}
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
          {/* Loading indicator when skeleton is showing */}
          {showSkeleton && events.length === 0 && (
            <div className="mt-4 flex items-center gap-2 text-neutral-500 text-sm">
              <div className="w-4 h-4 border-2 border-neutral-300 border-t-neutral-700 rounded-full animate-spin"></div>
              <span>Loading events...</span>
            </div>
          )}
        </div>
        {/* Desktop List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
            {showSkeleton && events.length === 0 ? (
              // Show skeleton cards while loading
              <>
                {[1, 2, 3, 4].map(i => (
                  <SkeletonCard key={`skeleton-${i}`} />
                ))}
              </>
            ) : (
              // Show real events
              events.map(event => (
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
              ))
            )}
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
            {showSkeleton && events.length === 0 ? (
              // Show skeleton cards while loading (mobile)
              <>
                {[1, 2, 3, 4].map(i => (
                  <div key={`skeleton-mobile-${i}`} className="snap-center shrink-0 first:pl-2 last:pr-6">
                    <SkeletonCard />
                  </div>
                ))}
              </>
            ) : (
              // Show real events (mobile)
              events.map(event => (
                <div key={event.id} className="snap-center shrink-0 first:pl-2 last:pr-6" ref={el => { cardsRef.current[event.id] = el; }}>
                  <EventCard
                    event={event}
                    isActive={selectedEventId === event.id}
                    onClick={() => setStoryEvent(event)}
                  />
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* === MODAL === */}
      <StoryDialog event={storyEvent} onClose={() => setStoryEvent(null)} />
    </div>
  );
}

export default App;
