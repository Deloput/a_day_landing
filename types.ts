export interface GeoLocation {
  city: string;
  country_name: string;
  latitude: number;
  longitude: number;
}

export interface EventItem {
  id: string;
  title: string;
  description: string;
  fullDescription?: string;
  latitude: number;
  longitude: number;
  imageUrl: string;
  rating: number;
  distance: string;
  locationName: string;
  highlights?: string[];
}
