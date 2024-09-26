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
    if (typeof window.ethereum !== 'undefined') {
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
    } else {
      alert('Please install MetaMask');
    }
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
      const signer = provider.getSigner();  // Get the current MetaMask account used for signing
      const buyerAddress = "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266";  // Replace with the actual buyer's address from deploy.js

      // Mint the new NFT using the signer (the current MetaMask account)
      const mintTransaction = await realEstate.connect(signer).mint(ipfsUrl);
      await mintTransaction.wait();

      // Get the latest token ID (representing the newly minted property)
      const totalSupply = await realEstate.totalSupply();
      const newItemId = totalSupply.toNumber();

      // Approve the Escrow contract to handle the transfer of the NFT
      const approveTransaction = await realEstate.connect(signer).approve(escrow.address, newItemId);
      await approveTransaction.wait();

      // Calculate 50% escrow amount based on the price entered by the seller
      const escrowAmount = ethers.utils.parseUnits((price / 2).toString(), 'ether');

      // List the property in the Escrow contract
      const listTransaction = await escrow.connect(signer).list(
        newItemId,
        buyerAddress,  // Hardcoded buyer's address
        ethers.utils.parseUnits(price, 'ether'),  // Price entered by the seller
        escrowAmount  // 50% of the price as escrow amount
      );
      await listTransaction.wait();

      // Fetch the newly minted property metadata from the IPFS URL
      const metadata = await fetch(ipfsUrl).then((res) => res.json());
      setHomes([...homes, metadata]);  // Dynamically add the new property to the list of homes

      setFormToggle(false);  // Close the property listing form
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
        {account === '0x70997970C51812dc3A010C7d01b50e0d17dc79C8' && (
        <button onClick={toggleForm} className='home__buy'>List New Property</button> 
        )}

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

      {formToggle && <PropertyForm onSubmit={handleListingSubmit} onClose={toggleForm} />}  {/* Render PropertyForm if formToggle is true */}
    </div>
  );
}

export default App;
