import { GeoLocation } from '../types';

export async function getGeoLocation(): Promise<GeoLocation> {
  try {
    const response = await fetch('https://ipapi.co/json/');
    if (!response.ok) throw new Error('Failed to fetch location');
    const data = await response.json();
    return {
      city: data.city || 'Unknown City',
      country_name: data.country_name || '',
      latitude: data.latitude || 51.5074, // Fallback to London
      longitude: data.longitude || -0.1278,
    };
  } catch (error) {
    console.warn('Geo-IP failed, using fallback.', error);
    return {
      city: 'Limassol',
      country_name: 'Cyprus',
      latitude: 34.6786,
      longitude: 33.0413,
    };
  }
}
