import axios from "axios";

export interface AniListTitle {
  english?: string;
  romaji?: string;
  native?: string;
}

export interface AniListMedia {
  id: number;
  title: AniListTitle;
  coverImage: {
    extraLarge?: string;
    large?: string;
    medium?: string;
  };
  bannerImage?: string;
  description?: string;
  averageScore?: number;
  episodes?: number;
  format?: string;
  status?: string;
  genres?: string[];
  duration?: number;
  seasonYear?: number;
  trailer?: {
    id?: string;
    site?: string;
  };
  studios?: {
    nodes: Array<{ name: string }>;
  };
  characters?: {
    edges: Array<{
      role: string;
      node: {
        id: number;
        name: { full: string };
        image?: { medium: string };
      };
      voiceActors?: Array<{
        name: { full: string };
        image?: { medium: string };
      }>;
    }>;
  };
  recommendations?: {
    nodes: Array<{
      mediaRecommendation?: {
        id: number;
        title: AniListTitle;
        coverImage?: { large: string };
        averageScore?: number;
        format?: string;
      };
    }>;
  };
}

const ANILIST_API_URL = "https://graphql.anilist.co";

const LIST_QUERY = `
query ($page: Int, $perPage: Int, $sort: [MediaSort], $genre: String, $format: MediaFormat, $search: String) {
  Page(page: $page, perPage: $perPage) {
    media(type: ANIME, sort: $sort, genre: $genre, format: $format, search: $search, isAdult: false) {
      id
      title {
        english
        romaji
        native
      }
      coverImage {
        extraLarge
        large
        medium
      }
      bannerImage
      averageScore
      episodes
      format
      status
      genres
      seasonYear
      description(asHtml: false)
    }
  }
}
`;

const DETAIL_QUERY = `
query ($id: Int) {
  Media(id: $id, type: ANIME) {
    id
    title {
      english
      romaji
      native
    }
    coverImage {
      extraLarge
      large
      medium
    }
    bannerImage
    description(asHtml: false)
    averageScore
    episodes
    format
    status
    genres
    duration
    seasonYear
    trailer {
      id
      site
    }
    studios(isMain: true) {
      nodes {
        name
      }
    }
    characters(sort: ROLE, perPage: 8) {
      edges {
        role
        node {
          id
          name {
            full
          }
          image {
            medium
          }
        }
        voiceActors(language: JAPANESE) {
          name {
            full
          }
          image {
            medium
          }
        }
      }
    }
    recommendations(perPage: 10) {
      nodes {
        mediaRecommendation {
          id
          title {
            english
            romaji
          }
          coverImage {
            large
          }
          averageScore
          format
        }
      }
    }
  }
}
`;

async function fetchFromAniList<T>(query: string, variables: any): Promise<T> {
  const res = await axios.post(
    ANILIST_API_URL,
    { query, variables },
    {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      timeout: 10000,
    }
  );
  return res.data?.data;
}

const otakuService = {
  // 1. Trending Airing Anime
  getTrendingAnime: async (page = 1, perPage = 18): Promise<AniListMedia[]> => {
    const data = await fetchFromAniList<{ Page: { media: AniListMedia[] } }>(LIST_QUERY, {
      page,
      perPage,
      sort: ["TRENDING_DESC"],
    });
    return data?.Page?.media || [];
  },

  // 2. Top Rated Anime of All Time
  getTopRatedAnime: async (page = 1, perPage = 18): Promise<AniListMedia[]> => {
    const data = await fetchFromAniList<{ Page: { media: AniListMedia[] } }>(LIST_QUERY, {
      page,
      perPage,
      sort: ["SCORE_DESC"],
    });
    return data?.Page?.media || [];
  },

  // 3. Anime Movies
  getAnimeMovies: async (page = 1, perPage = 18): Promise<AniListMedia[]> => {
    const data = await fetchFromAniList<{ Page: { media: AniListMedia[] } }>(LIST_QUERY, {
      page,
      perPage,
      format: "MOVIE",
      sort: ["POPULARITY_DESC"],
    });
    return data?.Page?.media || [];
  },

  // 4. Anime by Genre (e.g. "Action", "Fantasy", "Sci-Fi", "Romance", "Comedy")
  getAnimeByGenre: async (genre: string, page = 1, perPage = 18): Promise<AniListMedia[]> => {
    const data = await fetchFromAniList<{ Page: { media: AniListMedia[] } }>(LIST_QUERY, {
      page,
      perPage,
      genre,
      sort: ["POPULARITY_DESC"],
    });
    return data?.Page?.media || [];
  },

  // 5. Search Anime by Name
  searchAnime: async (search: string, page = 1, perPage = 18): Promise<AniListMedia[]> => {
    const data = await fetchFromAniList<{ Page: { media: AniListMedia[] } }>(LIST_QUERY, {
      page,
      perPage,
      search,
      sort: ["SEARCH_MATCH"],
    });
    return data?.Page?.media || [];
  },

  // 6. Get Full Anime Details (Characters, Studios, Recommendations, Trailer, etc.)
  getAnimeDetail: async (id: number): Promise<AniListMedia | null> => {
    const data = await fetchFromAniList<{ Media: AniListMedia }>(DETAIL_QUERY, { id });
    return data?.Media || null;
  },
};

export default otakuService;
