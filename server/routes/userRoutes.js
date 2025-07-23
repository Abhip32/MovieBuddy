const express = require('express');
const {
  getUserProfile,
  addFavoriteMovie,
  removeFavoriteMovie,
  getFavoriteMovies,
  addRecentlyWatched,
  getRecentlyWatched,
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/profile').get(protect, getUserProfile);
router.route('/favorites').get(protect, getFavoriteMovies).post(protect, addFavoriteMovie);
router.route('/favorites/remove').post(protect, removeFavoriteMovie);
router.route('/recently-watched').get(protect, getRecentlyWatched).post(protect, addRecentlyWatched);

module.exports = router;
