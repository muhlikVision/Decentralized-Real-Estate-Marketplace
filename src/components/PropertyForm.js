import '/home/ian/millow/src/PropertyForm.css';
import '/home/ian/millow/src/oracleService.js';
import { getPriceFromOracle } from '../oracleService';
import { useState } from 'react';

const PropertyForm = ({ onSubmit, onClose }) => {
  const [ipfsUrl, setIpfsUrl] = useState('');
  const [price, setPrice] = useState('');
  const [aiPredictedPrice, setAIPrice] = useState('');  // Placeholder for AI predicted price
  const [metadata, setMetadata] = useState(null); // State to hold fetched metadata
  const [metadataFetched, setMetadataFetched] = useState(false);  // Track if metadata is fetched

   // State variables for the metadata fields
   const [propertyName, setPropertyName] = useState('');
   const [address, setAddress] = useState('');
   const [description, setDescription] = useState('');
   const [imageUrl, setImageUrl] = useState('');
   const [purchasePrice, setPurchasePrice] = useState('');
   const [residenceType, setResidenceType] = useState('');
   const [bedrooms, setBedrooms] = useState('');
   const [bathrooms, setBathrooms] = useState('');
   const [squareFeet, setSquareFeet] = useState('');
   const [yearBuilt, setYearBuilt] = useState('');


  // Function to handle metadata fetching
  const fetchMetadata = async () => {
    if (ipfsUrl) {
      try 
      {
        const response = await fetch(ipfsUrl);
        if (response.ok) 
        {

          const data = await response.json();
          setMetadata(data); // Update state with fetched data
          setMetadataFetched(true);  // Mark metadata as fetched

          // Store each attribute in its own variable
          setPropertyName(data.name || '');
          setAddress(data.address || '');
          setDescription(data.description || '');
          setImageUrl(data.image || '');

          // Assuming the attributes are in an array called 'attributes'
          data.attributes.forEach(attr => {
            switch(attr.trait_type) {
              case 'Purchase Price':
                setPurchasePrice(0);
                break;
              case 'Type of Residence':
                setResidenceType(attr.value);
                break;
              case 'Bed Rooms':
                setBedrooms(attr.value);
                break;
              case 'Bathrooms':
                setBathrooms(attr.value);
                break;
              case 'Square Feet':
                setSquareFeet(attr.value);
                break;
              case 'Year Built':
                setYearBuilt(attr.value);
                break;
              default:
                break;
            }
          });

        } else {
          alert('Failed to fetch metadata from IPFS');
        }
      } catch (error) {
        console.error('Error fetching IPFS metadata:', error);
        alert('Error fetching metadata. Please check the IPFS URL.');
      }
    } else {
      alert('Please enter an IPFS URL.');
    }
  };

  const fetchAIPrice = async () => {
    const propertyData = {
      year: yearBuilt,
      resType: residenceType,
      beds: bedrooms,
      baths: bathrooms,
      sqfeet: squareFeet,
    };

    try {
      const aiPrice = await getPriceFromOracle(propertyData);
      setAIPrice(aiPrice);
    } catch (error) {
      alert(error.message);
    }
  }

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
            <button type="button" onClick={fetchMetadata}>Fetch Metadata</button>  {/* Button to fetch metadata */}
          </div>

          {/* Show fetched metadata if available */}
          <br />
          {metadataFetched && metadata && (
            <>
              <div>
                <label>Property Name:</label>
                <input
                  type="text"
                  value={metadata.name || ''}
                  readOnly
                />
              </div>
              <div>
                <label>Description:</label>
                <input
                  type="text"
                  value={metadata.description || ''}
                  readOnly
                />
              </div>
              <div>
                <label>Attributes:</label>
                {metadata.attributes && metadata.attributes.map((attr, index) => (
                  <div key={index}>
                    <strong>{attr.trait_type}:</strong> {attr.value}
                  </div>
                ))}
              </div>
            </>
          )}
          <br />
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
              onChange={(e) => setAIPrice(e.target.value)}
              disabled  // AI Price is currently a placeholder
            />
            
            <button type="button" onClick={fetchAIPrice}>Predict Price</button>  {/* Button to fetch metadata */}
            </div>
            <br></br>
            <div>
          </div>

          {/* Only show Mint & List button if metadata is fetched */}
          {metadataFetched && (
            <button type="submit">Mint & List Property</button>
          )}
        </form>
        <button type="button" onClick={onClose}>Close</button>  {/* Close button */}
      </div>
    </div>
  );
};

export default PropertyForm;
