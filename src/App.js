import { useEffect, useState } from 'react';
import { ethers } from 'ethers';

// Components
import Navigation from './components/Navigation';
import Search from './components/Search';
import Home from './components/Home';
import PropertyForm from './components/PropertyForm';  // Import the PropertyForm component

// ABIs
import RealEstate from './abis/RealEstate.json';
import Escrow from './abis/Escrow.json';

// Config
import config from './config.json';

function App() {
  const [provider, setProvider] = useState(null);
  const [realEstate, setRealEstate] = useState(null);
  const [escrow, setEscrow] = useState(null);
  const [account, setAccount] = useState(null);
  const [homes, setHomes] = useState([]);
  const [home, setHome] = useState({});
  const [toggle, setToggle] = useState(false);
  const [formToggle, setFormToggle] = useState(false);  // To toggle the property form

  const loadBlockchainData = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    setProvider(provider);
    const network = await provider.getNetwork();

    const realEstate = new ethers.Contract(config[network.chainId].realEstate.address, RealEstate, provider);
    setRealEstate(realEstate);

    const totalSupply = await realEstate.totalSupply();
    const homes = [];

    for (var i = 1; i <= totalSupply; i++) {
      const uri = await realEstate.tokenURI(i);
      const response = await fetch(uri);
      const metadata = await response.json();
      homes.push(metadata);
    }

    setHomes(homes);

    const escrow = new ethers.Contract(config[network.chainId].escrow.address, Escrow, provider);
    setEscrow(escrow);

    window.ethereum.on('accountsChanged', async () => {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const account = ethers.utils.getAddress(accounts[0]);
      setAccount(account);
    });
  };

  useEffect(() => {
    loadBlockchainData();
  }, []);

  const togglePop = (home) => {
    setHome(home);
    setToggle(!toggle);
  };

  const toggleForm = () => {
    setFormToggle(!formToggle);
  };

  // Handle the listing of a new property
  const handleListingSubmit = async (ipfsUrl, price) => {
    try {
      const signer = provider.getSigner();

      // Mint the new NFT
      const mintTransaction = await realEstate.connect(signer).mint(ipfsUrl);
      await mintTransaction.wait();

      // Get the latest token ID
      const totalSupply = await realEstate.totalSupply();
      const newItemId = totalSupply.toNumber();

      // Approve the Escrow contract to handle the token
      const approveTransaction = await realEstate.connect(signer).approve(escrow.address, newItemId);
      await approveTransaction.wait();

      // Calculate 50% escrow amount from the price
      const escrowAmount = ethers.utils.parseUnits((price / 2).toString(), 'ether');

      // List the property in the Escrow contract
      const listTransaction = await escrow.connect(signer).list(
        newItemId,
        account,  // Seller's account
        ethers.utils.parseUnits(price, 'ether'),  // Price in ETH
        escrowAmount  // 50% of the price as escrow amount
      );
      await listTransaction.wait();

      // Fetch the new property metadata and update homes state
      const metadata = await fetch(ipfsUrl).then((res) => res.json());
      setHomes([...homes, metadata]);  // Dynamically add the new home to the list

      setFormToggle(false);  // Close the form after submission
    } catch (error) {
      console.error('Error minting and listing property:', error);
    }
  };

  return (
    <div>
      <Navigation account={account} setAccount={setAccount} />
      <Search />

      <div className='cards__section'>
        <h3>Homes For You</h3>
        <hr />
        <button onClick={toggleForm}>List New Property</button>  {/* Button to toggle the form */}
        <div className='cards'>
          {homes.map((home, index) => (
            <div className='card' key={index} onClick={() => togglePop(home)}>
              <div className='card__image'>
                <img src={home.image} alt='Home' />
              </div>
              <div className='card__info'>
                <h4>{home.attributes[0].value} ETH</h4>
                <p>
                  <strong>{home.attributes[2].value}</strong> bds |
                  <strong>{home.attributes[3].value}</strong> ba |
                  <strong>{home.attributes[4].value}</strong> sqft
                </p>
                <p>{home.address}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {toggle && (
        <Home home={home} provider={provider} account={account} escrow={escrow} togglePop={togglePop} />
      )}

      {formToggle && (
        <PropertyForm onSubmit={handleListingSubmit} />
      )}
    </div>
  );
}

export default App;
