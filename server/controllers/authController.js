const User = require('../models/userModel');
const jwt = require('jsonwebtoken');

const googleLogin = async (req, res) => {
  const { name, email, avatar } = req.body;

  try {
    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        name,
        email,
        avatar,
      });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '30d',
    });

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      token,
    });
  } catch (error) {
    res.status(400).json({ message: 'Something went wrong' });
  }
};

module.exports = { googleLogin };
