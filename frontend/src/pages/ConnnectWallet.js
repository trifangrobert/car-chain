import React from 'react';
import { useNavigate } from 'react-router-dom';

function ConnectWallet() {
  let navigate = useNavigate();

  async function connectWalletHandler() {
    if (window.ethereum) {
      try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        navigate('/available-cars');
      } catch (error) {
        console.error("Failed to connect wallet", error);
      }
    } else {
      alert('Please install MetaMask!');
    }
  }

  return (
    <div>
      <button onClick={connectWalletHandler}>Connect Wallet</button>
    </div>
  );
}

export default ConnectWallet;
