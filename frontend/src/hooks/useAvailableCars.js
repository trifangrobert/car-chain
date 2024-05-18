import { useState, useEffect } from 'react';
import { useContracts } from './useContracts';

export function useAvailableCars(address, updateTrigger) {
    const { carMarketplaceContract } = useContracts();
    const [cars, setCars] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCars = async () => {
            setLoading(true);
            try {
                if (!carMarketplaceContract) {
                    console.log('CarMarketplace contract not available');
                    setCars([]);
                    setError('CarMarketplace contract not available');
                    setLoading(false);
                    return;
                }
                console.log('Fetching available cars');
                const carData = await carMarketplaceContract.getListedCars();
                console.log('CarData: ', carData);  
                setCars(carData.map(car => ({
                    tokenId: car.tokenId.toString(),
                    price: car.price.toString(), 
                    owner: car.seller
                })));
                setError(null);
            } catch (err) {
                setError('Failed to fetch cars: ' + err.message);
                console.error(err);
            }
            setLoading(false);
        };

        fetchCars();
    }, [address, updateTrigger]);  

    return { cars, loading, error };
}
