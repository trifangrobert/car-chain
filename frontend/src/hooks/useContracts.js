import { useMemo } from 'react';
import CarToken from '../contracts/CarToken.json';
import CarMarketplace from '../contracts/CarMarketplace.json';
import { useUser } from '../contexts/UserContext';
import { ethers } from 'ethers';

export const useContracts = () => {
    const { signer } = useUser();
    // console.log("signer from useContracts:", signer);

    const carTokenContract = useMemo(() => {
        if (!signer) return null;
        console.log("CarToken from useContracts:", CarToken.address, CarToken.abi, signer)
        return new ethers.Contract(CarToken.address, CarToken.abi, signer);
    }, [signer]);

    const carMarketplaceContract = useMemo(() => {
        if (!signer) return null;
        console.log("CarMarketplace from useContracts:", CarMarketplace.address, CarMarketplace.abi, signer)
        return new ethers.Contract(CarMarketplace.address, CarMarketplace.abi, signer);
    }, [signer]);

    return { carTokenContract, carMarketplaceContract };
};
