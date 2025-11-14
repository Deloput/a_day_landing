
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
          setShowSkeleton(false);
          clearInterval(retryTimer);
          
          // Add events one by one with staggered animation
          const isFirstLoad = events.length === 0;
          evts.forEach((evt, index) => {
            setTimeout(() => {
              setEvents(prev => [...prev, evt]);
              // Select SECOND card (index 1) ONLY on first load
              if (isFirstLoad && index === 1 && !selectedEventId) {
                setSelectedEventId(evt.id);
              }
            }, index * 200); // 200ms delay between each card
          });
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
              events.map((event, index) => (
                <div 
                  key={event.id} 
                  ref={el => { cardsRef.current[event.id] = el; }}
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
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
        <div className="md:hidden absolute inset-x-0 bottom-0 h-[420px] z-[500] bg-gradient-to-t from-neutral-900/60 via-neutral-900/10 to-transparent pointer-events-none flex flex-col justify-end">
          <div className="flex items-end overflow-x-auto snap-x snap-mandatory px-4 pb-28 space-x-3 no-scrollbar pointer-events-auto" style={{ paddingTop: '37px' }}>
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
              events.map((event, index) => (
                <div 
                  key={event.id} 
                  className="snap-center shrink-0 first:pl-2 last:pr-6 animate-fade-in"
                  style={{ animationDelay: `${index * 0.05}s` }}
                  ref={el => { cardsRef.current[event.id] = el; }}
                >
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

      {/* === CTA BUTTON: PLAN A DAY === */}
      <a
        onClick={(e) => {
          e.preventDefault();
          const isLocalhost = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
          const url = isLocalhost 
            ? 'http://localhost:8081/main/index.html#/main?action=plan'
            : 'https://aday.today/#/main?action=plan';
          console.log('Navigating to:', url);
          window.location.replace(url);
        }}
        href="#"
        className="fixed z-[600] bottom-6 left-1/2 -translate-x-1/2 
                   md:bottom-8 md:right-8 md:left-auto md:translate-x-0
                   bg-neutral-900 text-white font-brand text-xl tracking-tighter 
                   px-8 py-4 md:px-6 md:py-3.5
                   rounded-full md:rounded-[50px]
                   shadow-2xl hover:scale-105 active:scale-95 transition-transform duration-200
                   flex items-center justify-center gap-3 md:gap-2.5 
                   whitespace-nowrap group"
        style={{ textShadow: '2px 2px 0px #000, -1px -1px 0px #000, 1px -1px 0px #000, -1px 1px 0px #000, 1px 1px 0px #000' }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 group-hover:rotate-12 transition-transform">
          <path d="M11.25 5.337c0-.355-.186-.676-.401-.959a1.647 1.647 0 01-.349-1.003c0-1.036 1.007-1.875 2.25-1.875S15 2.34 15 3.375c0 .369-.128.713-.349 1.003-.215.283-.401.604-.401.959 0 .332.278.598.61.578 1.91-.114 3.79-.342 5.632-.676a.75.75 0 01.878.645 49.17 49.17 0 01.376 5.452.657.657 0 01-.66.664c-.354 0-.675-.186-.958-.401a1.647 1.647 0 00-1.003-.349c-1.035 0-1.875 1.007-1.875 2.25s.84 2.25 1.875 2.25c.369 0 .713-.128 1.003-.349.283-.215.604-.401.959-.401.31 0 .557.262.534.571a48.774 48.774 0 01-.595 4.845.75.75 0 01-.61.61c-1.82.317-3.673.533-5.555.642a.58.58 0 01-.611-.581c0-.355.186-.676.401-.959.221-.29.349-.634.349-1.003 0-1.035-1.007-1.875-2.25-1.875s-2.25.84-2.25 1.875c0 .369.128.713.349 1.003.215.283.401.604.401.959a.641.641 0 01-.658.643 49.118 49.118 0 01-4.708-.36.75.75 0 01-.645-.878c.293-1.614.504-3.257.629-4.924A.53.53 0 005.337 15c-.355 0-.676.186-.959.401-.29.221-.634.349-1.003.349-1.036 0-1.875-1.007-1.875-2.25s.84-2.25 1.875-2.25c.369 0 .713.128 1.003.349.283.215.604.401.959.401a.656.656 0 00.659-.663 47.703 47.703 0 00-.31-4.82.75.75 0 01.83-.832c1.343.155 2.703.254 4.077.294a.64.64 0 00.657-.642z" />
        </svg>
        <span>PLAN A DAY</span>
      </a>

      {/* === MODAL === */}
      <StoryDialog event={storyEvent} onClose={() => setStoryEvent(null)} />
    </div>
  );
}

export default App;
