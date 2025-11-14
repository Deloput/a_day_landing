import React from 'react';
import { EventItem } from '../types';

interface EventCardProps {
  event: EventItem;
  isActive: boolean;
  onClick: () => void;
}

const EventCard: React.FC<EventCardProps> = ({ event, isActive, onClick }) => {
  return (
    <div 
      onClick={onClick}
      className={`
        group relative rounded-3xl cursor-pointer transition-all duration-300 ease-out
        /* Mobile: Fixed width for carousel. Desktop: Full width of sidebar */
        w-[240px] md:w-full
        h-[280px] md:h-auto md:min-h-0
        bg-white
        overflow-hidden
        flex flex-col
        ${isActive 
          ? 'ring-[3px] ring-neutral-900 shadow-xl scale-[1.02] md:scale-[1.01]' 
          : 'ring-1 ring-neutral-200 shadow-sm hover:shadow-md hover:-translate-y-0.5'
        }
      `}
      style={{ marginTop: '25px', paddingTop: '0' }}
    >
      {/* Image Container - with extra space at top to prevent clipping */}
      <div className="relative bg-neutral-100 rounded-t-3xl overflow-hidden" style={{ height: 'calc(90px + 29px)', marginTop: '-25px', paddingTop: '29px' }}>
        <img 
          src={event.imageUrl} 
          alt={event.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
          style={{ height: '90px', width: '100%', marginTop: '-29px' }}
        />
        {/* Rating Badge - Arrival style black & white */}
        <div className="absolute top-3 right-3 bg-white border-2 border-black px-2.5 py-1 rounded-sm text-xs font-bold text-black flex items-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] z-10">
          <span className="arrival-star text-black mr-1.5 text-sm">★</span>
          <span className="font-mono">{event.rating.toFixed(1)}</span>
        </div>
        {/* Category Badge (using first highlight) */}
        {event.highlights?.[0] && (
           <div className="absolute bottom-3 left-3 bg-neutral-900/80 backdrop-blur-md px-2.5 py-1 rounded-md text-[10px] font-bold text-white uppercase tracking-wider z-10">
             {event.highlights[0]}
           </div>
        )}
      </div>
      
      {/* Content */}
      <div className="pt-4 px-5 pb-5 flex-1 flex flex-col">
        <h3 className={`font-bold text-base leading-tight mb-1.5 line-clamp-2 ${isActive ? 'text-black' : 'text-neutral-800'}`}>
          {event.title}
        </h3>
        <p className="text-xs text-neutral-500 line-clamp-2 mb-3 flex-1">{event.description}</p>
        
        <div className="flex items-center text-xs font-semibold text-neutral-400 uppercase tracking-wide mt-auto">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 mr-1.5 text-neutral-300">
            <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
          </svg>
          <span className="truncate">{event.distance} • {event.locationName}</span>
        </div>
      </div>
    </div>
  );
};

export default EventCard;