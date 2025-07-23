import React from 'react';
import { useAuth } from '../../context/AuthContext/AuthContext';
import { useQuery } from '@tanstack/react-query';
import userService from '../../services/userService';
import ListMovieHorizontal from '../../components/ListMovieHorizontal/ListMovieHorizontal';

const Profile = () => {
  const { user } = useAuth();
  const { data: favorites, isLoading: favoritesLoading } = useQuery(
    ['favorites', user.token],
    () => userService.getFavoriteMovies(user.token)
  );
  const { data: recentlyWatched, isLoading: recentlyWatchedLoading } = useQuery(
    ['recentlyWatched', user.token],
    () => userService.getRecentlyWatched(user.token)
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center space-x-4">
        <img src={user.avatar} alt={user.name} className="w-20 h-20 rounded-full" />
        <div>
          <h1 className="text-2xl font-bold">{user.name}</h1>
          <p className="text-gray-500">{user.email}</p>
        </div>
      </div>
      <div className="mt-8">
        <h2 className="text-xl font-bold">Favorite Movies</h2>
        {favoritesLoading ? (
          <div>Loading...</div>
        ) : (
          <ListMovieHorizontal data={favorites} />
        )}
      </div>
      <div className="mt-8">
        <h2 className="text-xl font-bold">Recently Watched</h2>
        {recentlyWatchedLoading ? (
          <div>Loading...</div>
        ) : (
          <ListMovieHorizontal data={recentlyWatched} />
        )}
      </div>
    </div>
  );
};

export default Profile;
