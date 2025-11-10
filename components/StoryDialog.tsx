import React, { useState, useEffect } from 'react';
import { EventItem } from '../types';

interface StoryDialogProps {
  event: EventItem | null;
  onClose: () => void;
}

const StoryDialog: React.FC<StoryDialogProps> = ({ event, onClose }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const totalSlides = 3;

  useEffect(() => {
    if (event) {
      setCurrentSlide(0);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [event]);

  if (!event) return null;

  const nextSlide = () => {
    if (currentSlide < totalSlides - 1) {
      setCurrentSlide(c => c + 1);
    } else {
      onClose();
    }
  };

  const prevSlide = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentSlide > 0) {
      setCurrentSlide(c => c - 1);
    }
  };

  const renderSlideContent = () => {
    switch (currentSlide) {
      case 0: // Highlights
        return (
          <div className="flex flex-col h-full justify-end p-8 pb-32 bg-gradient-to-t from-neutral-900 via-neutral-900/50 to-transparent text-white">
            <div className="mb-4">
              <span className="bg-white text-neutral-900 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Happening Today
              </span>
            </div>
            <h2 className="text-4xl font-bold mb-4 leading-tight">{event.title}</h2>
            <p className="text-lg text-white/90">{event.description}</p>
          </div>
        );
      case 1: // What to Expect
        return (
          <div className="flex flex-col h-full bg-white text-neutral-900 p-8 pt-24">
             <h3 className="text-2xl font-bold text-neutral-900 mb-6">What to Expect</h3>
             <p className="text-lg leading-relaxed text-neutral-700 mb-8">
               {event.fullDescription}
             </p>
             
             {event.highlights && (
               <div className="space-y-4">
                 <h4 className="font-medium text-neutral-900 uppercase tracking-wider text-sm">Highlights</h4>
                 <ul className="space-y-3">
                   {event.highlights.map((highlight, idx) => (
                     <li key={idx} className="flex items-start">
                       <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-neutral-100 text-neutral-900 mr-3 flex-shrink-0">
                         <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                           <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                         </svg>
                       </span>
                       <span className="text-neutral-700">{highlight}</span>
                     </li>
                   ))}
                 </ul>
               </div>
             )}
          </div>
        );
      case 2: // Plan Today
        // Create deep link to Flutter app with event data
        const eventData = encodeURIComponent(JSON.stringify({
          id: event.id,
          title: event.title,
          description: event.description,
          fullDescription: event.fullDescription,
          latitude: event.latitude,
          longitude: event.longitude,
          locationName: event.locationName,
          distance: event.distance,
          rating: event.rating,
          highlights: event.highlights,
          imageUrl: event.imageUrl
        }));
        const deepLink = `https://aday.today/#/main?event=${eventData}`;
        
        return (
          <div className="flex flex-col h-full bg-neutral-50 p-8 pt-32 items-center text-center">
            <div className="w-24 h-24 bg-neutral-900 rounded-full flex items-center justify-center mb-6 text-white shadow-xl">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
              </svg>
            </div>
            <h3 className="text-3xl font-bold text-neutral-900 mb-2">{event.locationName}</h3>
            <p className="text-neutral-500 mb-12">{event.distance} away</p>

            <a 
              href={deepLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-4 bg-neutral-900 text-white font-bold rounded-full shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
              </svg>
              <span>Plan Today</span>
            </a>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm">
      <div 
        className="relative w-full h-full md:max-w-md md:h-[85vh] md:rounded-3xl overflow-hidden bg-neutral-900"
        onClick={nextSlide}
      >
        {currentSlide === 0 && (
           <div className="absolute inset-0">
             <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover opacity-80" />
           </div>
        )}

        {/* Progress Bar */}
        <div className="absolute top-0 left-0 right-0 z-20 flex p-2 space-x-1.5 pt-4 px-4">
          {Array.from({ length: totalSlides }).map((_, idx) => (
            <div key={idx} className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden backdrop-blur-md">
              <div 
                className={`h-full bg-white transition-all duration-300 ease-out ${
                  idx < currentSlide ? 'w-full' : idx === currentSlide ? 'w-full' : 'w-0'
                }`}
              />
            </div>
          ))}
        </div>

        <button 
          onClick={(e) => { e.stopPropagation(); onClose(); }}
          className="absolute top-6 right-4 z-30 p-2 bg-black/10 backdrop-blur-md text-white rounded-full"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div 
          className="absolute top-0 left-0 w-[30%] h-full z-10"
          onClick={prevSlide}
        />

        <div className="relative z-0 h-full">
          {renderSlideContent()}
        </div>
      </div>
    </div>
  );
};

export default StoryDialog;