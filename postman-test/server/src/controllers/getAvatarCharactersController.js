const axios = require('axios');

const getAvatarCharacters = async (req, res, next) => {
  try {
    const response = await axios.get('https://api.sampleapis.com/avatar/characters');
    res.status(200).json(response.data);
  } catch (error) {
    console.error('Error fetching avatar characters:', error);
    next(error);
  }
};

module.exports = {
  getAvatarCharacters
};