const User = require('../models/userModel');

const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(404).json({ message: 'User not found' });
  }
};

const addFavoriteMovie = async (req, res) => {
  const { movieId } = req.body;

  try {
    const user = await User.findById(req.user.id);

    if (user.favorites.includes(movieId)) {
      return res.status(400).json({ message: 'Movie already in favorites' });
    }

    user.favorites.push(movieId);
    await user.save();
    res.json(user.favorites);
  } catch (error) {
    res.status(400).json({ message: 'Something went wrong' });
  }
};

const removeFavoriteMovie = async (req, res) => {
  const { movieId } = req.body;

  try {
    const user = await User.findById(req.user.id);

    user.favorites = user.favorites.filter((id) => id.toString() !== movieId);
    await user.save();
    res.json(user.favorites);
  } catch (error) {
    res.status(400).json({ message: 'Something went wrong' });
  }
};

const getFavoriteMovies = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('favorites');
    res.json(user.favorites);
  } catch (error) {
    res.status(400).json({ message: 'Something went wrong' });
  }
};

const addRecentlyWatched = async (req, res) => {
  const { movieId } = req.body;

  try {
    const user = await User.findById(req.user.id);

    if (!user.recentlyWatched.includes(movieId)) {
      user.recentlyWatched.push(movieId);
      await user.save();
    }

    res.json(user.recentlyWatched);
  } catch (error) {
    res.status(400).json({ message: 'Something went wrong' });
  }
};

const getRecentlyWatched = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('recentlyWatched');
    res.json(user.recentlyWatched);
  } catch (error) {
    res.status(400).json({ message: 'Something went wrong' });
  }
};

module.exports = {
  getUserProfile,
  addFavoriteMovie,
  removeFavoriteMovie,
  getFavoriteMovies,
  addRecentlyWatched,
  getRecentlyWatched,
};
