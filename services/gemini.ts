
import { GoogleGenAI } from "@google/genai";
import { EventItem, GeoLocation } from "../types";

// Highly optimized fallback images that fit the categories generally
const CATEGORY_IMAGES: { [key: string]: string } = {
  NEWS: "https://images.unsplash.com/photo-1586339949916-3e9457bef6d3?w=800&q=80",
  CINEMA: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&q=80",
  CITY: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=800&q=80",
  FOOD: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&q=80",
  CULTURE: "https://images.unsplash.com/photo-1508997449629-303059a039c0?w=800&q=80",
  BEAUTY: "https://images.unsplash.com/photo-1560750588-73207b1ef5b8?w=800&q=80",
  MUSIC: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80",
  COMMUNITY: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&q=80",
  GAMES: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&q=80",
  INTERNET: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&q=80",
  DEFAULT: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&q=80"
};

export async function fetchEventsFromGemini(location: GeoLocation): Promise<EventItem[]> {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API Key missing.");

  try {
    const ai = new GoogleGenAI({ apiKey });
    const now = new Date();
    const todayStr = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    // The exact list of categories requested
    const categories = [
      "NEWS (public talks, rallies)",
      "CINEMA (showtimes today)",
      "CITY (active public spaces)",
      "FOOD (markets, openings)",
      "CULTURE (exhibits, plays)",
      "BEAUTY (pop-ups, specials)",
      "MUSIC (live shows tonight)",
      "COMMUNITY (meetups, volunteering)",
      "GAMES (tournaments, sports)",
      "INTERNET (tech meetups, lans)"
    ].join(", ");

    const prompt = `You are a real-time local event finder. Find 8-12 REAL, VERIFIABLE events happening EXACTLY TODAY, ${todayStr}, in ${location.city}, ${location.country_name}.

    Focus on these categories: ${categories}.

    CRITICAL RULES:
    1. TIME SENSITIVE: Must be confirmed for TODAY. Do not list generic "always open" businesses unless they have a specific event today.
    2. REAL LOCATIONS: Must have a specific, mappable venue name.
    3. NO HALLUCINATIONS: If a category has nothing TODAY, skip it. Quality over quantity.
    4. FORMAT: 'highlights' must be an array starting with the CATEGORY name in ALL CAPS (e.g., ["MUSIC", "8:00 PM", "Live Band"]).

    Return strictly a JSON array of objects:
    [
      {
        "id": "unique_id_1",
        "title": "Short Catchy Title",
        "description": "Very brief summary (max 12 words).",
        "fullDescription": "Detailed info, including exact times, entry fees, and why it's worth going today.",
        "highlights": ["CATEGORY", "Time", "Vibe Tag"],
        "latitude": 12.3456 (number),
        "longitude": 67.8901 (number),
        "rating": 4.5 (number 1-5 based on predicted popularity),
        "distance": "approx distance string",
        "locationName": "Exact Venue Name"
      }
    ]`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        temperature: 0.3, // Low temp for accuracy
      }
    });

    const jsonMatch = response.text?.match(/\[([\s\S]*)]/);
    if (!jsonMatch) throw new Error("Failed to parse event data from AI.");

    const rawData = JSON.parse(jsonMatch[0]);
    if (!Array.isArray(rawData) || rawData.length === 0) {
      throw new Error(`Nothing specific found for today in ${location.city}. Try again later!`);
    }

    // Post-process for robust image fallback
    return rawData.map((item: any, index: number) => {
      const categoryTag = item.highlights?.[0]?.toUpperCase() || 'DEFAULT';
      
      // Find best matching category image
      let imageUrl = CATEGORY_IMAGES.DEFAULT;
      for (const key of Object.keys(CATEGORY_IMAGES)) {
         if (categoryTag.includes(key)) {
             imageUrl = CATEGORY_IMAGES[key];
             break;
         }
      }

      return {
        id: item.id || `evt_${index}_${Date.now()}`,
        title: item.title || "Local Event",
        description: item.description || "Happening today.",
        fullDescription: item.fullDescription || item.description,
        highlights: item.highlights || ["TODAY"],
        latitude: Number(item.latitude) || location.latitude,
        longitude: Number(item.longitude) || location.longitude,
        rating: Number(item.rating) || 4.0,
        distance: item.distance || "",
        locationName: item.locationName || location.city,
        imageUrl: imageUrl
      };
    });

  } catch (error) {
    console.error("Event Fetch Error:", error);
    throw error; // Re-throw to be caught by App.tsx error state
  }
}
