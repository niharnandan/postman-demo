const axios = require('axios');

const getStouts = async (req, res, next) => {
  try {
    const response = await axios.get('https://api.sampleapis.com/beers/stouts');
    res.status(200).json(response.data);
  } catch (error) {
    console.error('Error fetching stouts:', error);
    next(error);
  }
};

module.exports = {
  getStouts
};