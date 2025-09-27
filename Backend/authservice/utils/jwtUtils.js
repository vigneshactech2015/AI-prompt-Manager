const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

const verifyToken = async (token) => {
  try {
    
    const isValidToken = await User.findOne({ token });
    if (isValidToken) {
         return jwt.verify(token, process.env.JWT_SECRET);
    }else {
          throw new Error('Token has been revoked');
    }
  } catch (error) {
    throw error;
  }
};

const saveActiveToken = async(token, username) => {
    await User.findOneAndUpdate({ userName: username }, { token: token });
}


const removeActiveToken = async (token) => {
    await User.findOneAndUpdate({ token: token }, { token: null });
}





module.exports = {
  generateToken,
  verifyToken,
  saveActiveToken,
  removeActiveToken
};