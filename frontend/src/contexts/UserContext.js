import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const loadUser = async () => {
            if (window.ethereum) {
                try {
                    const provider = new ethers.BrowserProvider(window.ethereum);
                    await provider.send('eth_requestAccounts', []); // Prompt user to connect their account
                    const signer = await provider.getSigner();
                    const address = signer.address;
                    console.log(address);
                    setUser(address);
                } catch (error) {
                    console.error("Error connecting to MetaMask", error);
                }
            }
        };

        loadUser();
    }, []);

    return (
        <UserContext.Provider value={user}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => useContext(UserContext);
