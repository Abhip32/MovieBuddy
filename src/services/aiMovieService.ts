import tmdbApi from "./tmdbApi";

export interface AiMovieRecommendation {
  title: string;
  year?: string;
  mediaType: "movie" | "tv";
  reason: string;
  vibeTags?: string[];
  // TMDB populated fields
  id?: number;
  posterPath?: string | null;
  backdropPath?: string | null;
  voteAverage?: number;
  overview?: string;
  name?: string;
  genreIds?: number[];
}

export interface AiCineResponse {
  commentary: string;
  movies: AiMovieRecommendation[];
}

const FALLBACK_COLLECTIONS: Record<string, { commentary: string; movies: AiMovieRecommendation[] }> = {
  mindbending: {
    commentary: "Here are mind-bending cinematic masterworks that question reality and challenge your perceptions.",
    movies: [
      {
        title: "Inception",
        year: "2010",
        mediaType: "movie",
        reason: "Christopher Nolan's dream-heist masterpiece with stunning visuals and layers of psychological depth.",
        vibeTags: ["Mind-Bending", "Dream World", "High Concept"],
      },
      {
        title: "Interstellar",
        year: "2014",
        mediaType: "movie",
        reason: "An emotional, scientifically rooted space odyssey exploring gravitational anomalies and the bounds of human love.",
        vibeTags: ["Cosmic Sci-Fi", "Emotional", "Atmospheric"],
      },
      {
        title: "Shutter Island",
        year: "2010",
        mediaType: "movie",
        reason: "A psychological thriller that descends into a maze of paranoia, grief, and unforgettable plot twists.",
        vibeTags: ["Psychological", "Twist Ending", "Mystery"],
      },
      {
        title: "Dark",
        year: "2019",
        mediaType: "tv",
        reason: "The definitive time-travel puzzle box series connecting four families across generations.",
        vibeTags: ["Time Travel", "Complex Puzzle", "German Sci-Fi"],
      },
      {
        title: "Arrival",
        year: "2016",
        mediaType: "movie",
        reason: "A poetic exploration of linguistics, alien contact, and non-linear memory.",
        vibeTags: ["Philosophical", "Aliens", "Poetic"],
      },
      {
        title: "Severance",
        year: "2022",
        mediaType: "tv",
        reason: "A razor-sharp dystopian office thriller about separating work and personal consciousness.",
        vibeTags: ["Dystopian", "Workplace Mystery", "Suspense"],
      },
    ],
  },
  binge: {
    commentary: "Gripping, high-stakes series that make it impossible to hit 'Pause'.",
    movies: [
      {
        title: "Breaking Bad",
        year: "2008",
        mediaType: "tv",
        reason: "The gold standard of television storytelling chronicling Walter White's descent.",
        vibeTags: ["Crime Drama", "Masterpiece", "Tense"],
      },
      {
        title: "Stranger Things",
        year: "2016",
        mediaType: "tv",
        reason: "Nostalgic 80s supernatural mystery packed with heart, friendship, and monsters.",
        vibeTags: ["80s Nostalgia", "Supernatural", "Adventure"],
      },
      {
        title: "The Last of Us",
        year: "2023",
        mediaType: "tv",
        reason: "A deeply moving post-apocalyptic journey through an infected America.",
        vibeTags: ["Post-Apocalyptic", "Emotional", "Survival"],
      },
      {
        title: "Succession",
        year: "2018",
        mediaType: "tv",
        reason: "Shakespearean corporate drama with biting wit, brilliant performances, and fierce rivalry.",
        vibeTags: ["Satire", "Power Struggle", "Drama"],
      },
    ],
  },
  chill: {
    commentary: "Warm, cozy, and uplifting films designed to soothe your soul.",
    movies: [
      {
        title: "The Grand Budapest Hotel",
        year: "2014",
        mediaType: "movie",
        reason: "Wes Anderson's whimsical, pastel-hued caper filled with charm and eccentric characters.",
        vibeTags: ["Whimsical", "Aesthetic", "Comedy"],
      },
      {
        title: "La La Land",
        year: "2016",
        mediaType: "movie",
        reason: "A dazzling modern musical celebration of dreamers, jazz, and bittersweet romance.",
        vibeTags: ["Musical", "Romance", "Dreamy"],
      },
      {
        title: "Spirited Away",
        year: "2001",
        mediaType: "movie",
        reason: "Studio Ghibli's enchanting fantasy masterpiece about courage, wonder, and spirit bathhouses.",
        vibeTags: ["Ghibli", "Enchanting", "Classic Anime"],
      },
      {
        title: "About Time",
        year: "2013",
        mediaType: "movie",
        reason: "A heartfelt time-travel romance that turns into a profound tribute to family and everyday joy.",
        vibeTags: ["Feel-Good", "Tearjerker", "Romantic"],
      },
    ],
  },
};

const getEffectiveGeminiKey = (customKey?: string): string => {
  if (customKey && customKey.trim()) return customKey.trim();
  try {
    const saved = localStorage.getItem("moviebuddy_gemini_key");
    if (saved && saved.trim()) return saved.trim();
  } catch {}
  return import.meta.env.VITE_GEMINI_API_KEY || "";
};

// Concurrently resolve movie/tv entries against TMDB search API
export const enrichMoviesWithTmdb = async (
  recommendations: AiMovieRecommendation[]
): Promise<AiMovieRecommendation[]> => {
  const resolvedList = await Promise.all(
    recommendations.map(async (item) => {
      try {
        const searchType = item.mediaType === "tv" ? "tv" : "movie";
        const res = await tmdbApi.search<any>(searchType, item.title);
        const results = res.data?.results || [];

        // Match by title and optionally release year
        let match = results[0];
        if (item.year && results.length > 1) {
          const yearMatch = results.find((r: any) => {
            const dateStr = r.release_date || r.first_air_date || "";
            return dateStr.startsWith(item.year || "");
          });
          if (yearMatch) match = yearMatch;
        }

        if (match) {
          return {
            ...item,
            id: match.id,
            posterPath: match.poster_path,
            backdropPath: match.backdrop_path,
            voteAverage: match.vote_average ? Math.round(match.vote_average * 10) / 10 : undefined,
            overview: match.overview,
            name: match.title || match.name || item.title,
            genreIds: match.genre_ids,
          };
        }
      } catch (e) {
        console.warn(`TMDB lookup skipped for: ${item.title}`);
      }
      return item;
    })
  );

  return resolvedList;
};

export const getAiMovieRecommendations = async (
  prompt: string,
  contextItem?: { title?: string; name?: string; mediaType?: string; genres?: string[] },
  customApiKey?: string
): Promise<AiCineResponse> => {
  const cleanPrompt = prompt.trim();
  const apiKey = getEffectiveGeminiKey(customApiKey);

  if (!apiKey) {
    // Graceful fallback to curated collections if no key
    const pLower = cleanPrompt.toLowerCase();
    let selected = FALLBACK_COLLECTIONS.mindbending;
    if (pLower.includes("chill") || pLower.includes("feel-good") || pLower.includes("romance") || pLower.includes("fun")) {
      selected = FALLBACK_COLLECTIONS.chill;
    } else if (pLower.includes("binge") || pLower.includes("series") || pLower.includes("show")) {
      selected = FALLBACK_COLLECTIONS.binge;
    }
    const enriched = await enrichMoviesWithTmdb(selected.movies);
    return {
      commentary: selected.commentary,
      movies: enriched,
    };
  }

  const systemInstruction = `You are MovieBuddy CineBot, an elite, passionate film critic and cinema curator.
The user will describe a mood, cinematic vibe, plot concept, or ask for recommendations like a specific film.
Return a STRICT JSON object with NO markdown formatting, matching this exact shape:
{
  "commentary": "Engaging 1-2 sentence cinema critic intro matching their vibe",
  "movies": [
    {
      "title": "Exact Title of Film or TV Series",
      "year": "YYYY",
      "mediaType": "movie", // or "tv"
      "reason": "Specific 1-2 sentence explanation of why this movie fits the request",
      "vibeTags": ["Genre/Vibe 1", "Genre/Vibe 2"]
    }
  ]
}
Recommend 6 to 8 recognizable, acclaimed or cult classic movies/series that truly capture the mood. Include a mix of modern and iconic classics.`;

  const userQuery = contextItem
    ? `Currently viewing: "${contextItem.title || contextItem.name}" (${contextItem.mediaType || "film"}). User request: "${cleanPrompt || "recommend deeply similar films and vibe matches"}"`
    : `Curate movies for: "${cleanPrompt || "mind-bending sci-fi thrillers"}"`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: `${systemInstruction}\n\n${userQuery}` }],
            },
          ],
          generationConfig: {
            temperature: 0.75,
            responseMimeType: "application/json",
          },
        }),
      }
    );

    if (response.ok) {
      const data = await response.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
      const parsed = JSON.parse(rawText);

      if (Array.isArray(parsed?.movies) && parsed.movies.length > 0) {
        const enriched = await enrichMoviesWithTmdb(parsed.movies);
        return {
          commentary: parsed.commentary || "Here is your custom curated cinema watchlist.",
          movies: enriched,
        };
      }
    }
  } catch (err) {
    console.error("Gemini CineBot API error, using fallback:", err);
  }

  // Fallback if request failed or timed out
  const fallback = FALLBACK_COLLECTIONS.mindbending;
  const enrichedFallback = await enrichMoviesWithTmdb(fallback.movies);
  return {
    commentary: fallback.commentary,
    movies: enrichedFallback,
  };
};

export const getSurpriseMovie = async (
  vibe: string,
  era: string = "Any Era",
  customApiKey?: string
): Promise<AiMovieRecommendation | null> => {
  const prompt = `Surprise me with 1 absolute hidden gem or masterpiece film for a ${vibe} mood from ${era}.`;
  const result = await getAiMovieRecommendations(prompt, undefined, customApiKey);
  return result.movies[0] || null;
};
