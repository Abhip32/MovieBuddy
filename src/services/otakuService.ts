import axios from "axios";
import axiosInstance from "./axiosInstance";
import { Paginate } from "../Types/common";

export interface AnimeItem {
  id: number;
  name?: string;
  title?: string;
  original_name?: string;
  original_title?: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  vote_average: number;
  vote_count: number;
  first_air_date?: string;
  release_date?: string;
  media_type: "tv" | "movie";
  genre_ids?: number[];
  original_language?: string;
  anilistId?: number;
  totalEpisodes?: number;
}

export interface AniListMetadata {
  id: number;
  idMal?: number;
  title: {
    romaji?: string;
    english?: string;
    native?: string;
  };
  episodes?: number;
  format?: string;
  status?: string;
  bannerImage?: string;
  description?: string;
  genres?: string[];
  averageScore?: number;
}

const otakuService = {
  // Fetch Trending / Popular Anime Series
  getTrendingAnime: async (page = 1) => {
    const res = await axiosInstance.get<Paginate<AnimeItem>>("discover/tv", {
      params: {
        with_genres: "16",
        with_original_language: "ja",
        sort_by: "popularity.desc",
        page,
      },
    });
    return {
      ...res.data,
      results: res.data.results.map((r) => ({ ...r, media_type: "tv" as const })),
    };
  },

  // Fetch Top Rated Anime of All Time
  getTopRatedAnime: async (page = 1) => {
    const res = await axiosInstance.get<Paginate<AnimeItem>>("discover/tv", {
      params: {
        with_genres: "16",
        with_original_language: "ja",
        "vote_count.gte": 250,
        sort_by: "vote_average.desc",
        page,
      },
    });
    return {
      ...res.data,
      results: res.data.results.map((r) => ({ ...r, media_type: "tv" as const })),
    };
  },

  // Fetch Popular Anime Movies
  getAnimeMovies: async (page = 1) => {
    const res = await axiosInstance.get<Paginate<AnimeItem>>("discover/movie", {
      params: {
        with_genres: "16",
        with_original_language: "ja",
        sort_by: "popularity.desc",
        page,
      },
    });
    return {
      ...res.data,
      results: res.data.results.map((r) => ({ ...r, media_type: "movie" as const })),
    };
  },

  // Fetch Anime by Specific Subgenre (e.g. Action=28, Adventure=12, Fantasy=14, Sci-Fi=878)
  getAnimeByGenre: async (genreId: number, page = 1) => {
    const res = await axiosInstance.get<Paginate<AnimeItem>>("discover/tv", {
      params: {
        with_genres: `16,${genreId}`,
        with_original_language: "ja",
        sort_by: "popularity.desc",
        page,
      },
    });
    return {
      ...res.data,
      results: res.data.results.map((r) => ({ ...r, media_type: "tv" as const })),
    };
  },

  // Search Anime by Title
  searchAnime: async (query: string, page = 1) => {
    const [tvRes, movieRes] = await Promise.all([
      axiosInstance.get<Paginate<AnimeItem>>("search/tv", {
        params: { query, page },
      }),
      axiosInstance.get<Paginate<AnimeItem>>("search/movie", {
        params: { query, page },
      }),
    ]);

    // Filter to Japanese animation or keyword match
    const tvAnime = (tvRes.data.results || [])
      .filter((i) => i.original_language === "ja" || (i.genre_ids && i.genre_ids.includes(16)))
      .map((i) => ({ ...i, media_type: "tv" as const }));

    const movieAnime = (movieRes.data.results || [])
      .filter((i) => i.original_language === "ja" || (i.genre_ids && i.genre_ids.includes(16)))
      .map((i) => ({ ...i, media_type: "movie" as const }));

    return [...tvAnime, ...movieAnime];
  },

  // Query AniList Public GraphQL API for exact AniList ID, total episodes, sub/dub mapping
  getAniListMetadata: async (title: string): Promise<AniListMetadata | null> => {
    try {
      const cleanTitle = title
        .replace(/Season \d+/i, "")
        .replace(/\(TV\)/i, "")
        .replace(/:/g, " ")
        .trim();

      const query = `
        query ($search: String) {
          Media(search: $search, type: ANIME, sort: SEARCH_MATCH) {
            id
            idMal
            title {
              romaji
              english
              native
            }
            episodes
            format
            status
            bannerImage
            description(asHtml: false)
            genres
            averageScore
          }
        }
      `;

      const res = await axios.post(
        "https://graphql.anilist.co",
        {
          query,
          variables: { search: cleanTitle },
        },
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          timeout: 4000,
        }
      );

      return res.data?.data?.Media || null;
    } catch {
      return null;
    }
  },
};

export default otakuService;
