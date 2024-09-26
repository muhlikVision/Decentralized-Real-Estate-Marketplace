import axios from 'axios';

//send user data to the Flask API (oracle) and get the predricted price
export const getPriceFromOracle = async (propertyData) => {
  try {
    const response = await axios.post('http://127.0.0.1:5000/predict_price', { property_data: propertyData });
    return response.data.predicted_price;
  } catch (error) {
    console.error('Error fetching price:', error);
    throw new Error('Error communicating with the Oracle.');
  }
};