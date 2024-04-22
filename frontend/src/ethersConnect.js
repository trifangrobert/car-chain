import { ethers } from 'ethers';
import CarToken from './contracts/CarToken.json';
import CarMarketplace from './contracts/CarMarketplace.json';

const provider = new ethers.providers.Web3Provider(window.ethereum);
const signer = provider.getSigner();

const carTokenContract = new ethers.Contract(
  CarToken.address,
  CarToken.abi,
  signer
);

const carMarketplaceContract = new ethers.Contract(
  CarMarketplace.address,
  CarMarketplace.abi,
  signer
);

export { carTokenContract, carMarketplaceContract };
