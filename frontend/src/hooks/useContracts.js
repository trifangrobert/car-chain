import { useMemo } from 'react';
import CarToken from '../contracts/CarToken.json';
import CarMarketplace from '../contracts/CarMarketplace.json';
import { ethers } from 'ethers';
import { useUser } from '../contexts/UserContext';

export const useContracts = () => {
    const { signer } = useUser();

    const carTokenContract = useMemo(() => {
        if (!signer) return null;
        // console.log("CarToken from useContracts:", signer)
        return new ethers.Contract(CarToken.address, CarToken.abi, signer);
    }, [signer]);

    const carMarketplaceContract = useMemo(() => {
        if (!signer) return null;
        // console.log("CarMarketplace from useContracts:", signer)
        return new ethers.Contract(CarMarketplace.address, CarMarketplace.abi, signer);
    }, [signer]);

    return { carTokenContract, carMarketplaceContract };
};
