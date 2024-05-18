import React, { createContext, useContext, useState, useEffect } from "react";
import { ethers } from 'ethers';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState({
    address: null,
    signer: null,
    provider: null,
  });

  useEffect(() => {
    const provider = new ethers.BrowserProvider(window.ethereum);

    const updateAccount = async (newAccounts) => {
      if (newAccounts.length === 0) {
        console.log("Please connect to MetaMask.");
        setUser(null);
      } else {
        try {
          const signer = await provider.getSigner();
          const address = signer.address;
          console.log("Signer: ", signer);
          console.log("Account updated:", address);
          setUser({ address, signer, provider });
        } catch (error) {
          console.error("Error retrieving account", error);
        }
      }
    };

    const loadUser = async () => {
      if (window.ethereum) {
        try {
          await provider.send("eth_requestAccounts", []);
          const accounts = await provider.listAccounts();
          console.log("Accounts: ", accounts);
          updateAccount(accounts);
        } catch (error) {
          console.error("Error connecting to MetaMask", error);
        }

        window.ethereum.on("accountsChanged", updateAccount);
      }
    };

    loadUser();

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener("accountsChanged", updateAccount);
      }
    };
  }, []);

  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
};

export const useUser = () => useContext(UserContext);
