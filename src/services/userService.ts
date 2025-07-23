import { axiosInstance } from './axiosInstance';

const getUserProfile = async (token: string) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const { data } = await axiosInstance.get('/api/users/profile', config);
  return data;
};

const addFavoriteMovie = async (movieId: string, token: string) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const { data } = await axiosInstance.post('/api/users/favorites', { movieId }, config);
  return data;
};

const removeFavoriteMovie = async (movieId: string, token: string) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const { data } = await axiosInstance.post('/api/users/favorites/remove', { movieId }, config);
  return data;
};

const getFavoriteMovies = async (token: string) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const { data } = await axiosInstance.get('/api/users/favorites', config);
  return data;
};

const addRecentlyWatched = async (movieId: string, token: string) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const { data } = await axiosInstance.post('/api/users/recently-watched', { movieId }, config);
  return data;
};

const getRecentlyWatched = async (token: string) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const { data } = await axiosInstance.get('/api/users/recently-watched', config);
  return data;
};

const userService = {
  getUserProfile,
  addFavoriteMovie,
  removeFavoriteMovie,
  getFavoriteMovies,
  addRecentlyWatched,
  getRecentlyWatched,
};

export default userService;
