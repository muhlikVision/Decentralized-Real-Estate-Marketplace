import '/home/ian/millow/src/PropertyForm.css';

import { useState } from 'react';

const PropertyForm = ({ onSubmit, onClose }) => {
  const [ipfsUrl, setIpfsUrl] = useState('');
  const [price, setPrice] = useState('');
  const [aiPredictedPrice] = useState('Coming Soon');  // Placeholder for AI predicted price

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!ipfsUrl || !price) {
      alert('Please fill in all fields');
      return;
    }
    onSubmit(ipfsUrl, price);  // Call the submit handler from App.js
  };

  return (
    <div className="property-form-overlay">  {/* Overlay for popup effect */}
      <div className="property-form">
        <h2>List New Property</h2>
        <form onSubmit={handleSubmit}>
          <div>
            <label>IPFS URL:</label>
            <input
              type="text"
              value={ipfsUrl}
              onChange={(e) => setIpfsUrl(e.target.value)}
              placeholder="Enter IPFS URL for property metadata"
            />
          </div>
          <div>
            <label>Price (ETH):</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Enter property price in ETH"
            />
          </div>
          <div>
            <label>AI Predicted Price:</label>
            <input
              type="text"
              value={aiPredictedPrice}
              disabled  // AI Price is currently a placeholder
            />
          </div>
          <button type="submit">Mint & List Property</button>
        </form>
        <button type="button" onClick={onClose}>Close</button>  {/* Close button */}
      </div>
    </div>
  );
};

export default PropertyForm;
