import { useState, useEffect } from 'react';
import { carMarketplaceContract } from '../ethersConnect';
import { useUser } from '../contexts/UserContext';

export function useAvailableCars(address, updateTrigger) {
    const [cars, setCars] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { gasLimit } = useUser();

    useEffect(() => {
        const fetchCars = async () => {
            setLoading(true);
            try {
                console.log('Fetching available cars');
                const carData = await carMarketplaceContract.getAvailableListings({ gasLimit });
                console.log('CarData: ', carData);
                setCars(carData.map(car => ({
                    tokenId: car.tokenId.toString(),
                    price: car.price.toString(),
                    isActive: car.isActive,
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
    }, [address, updateTrigger, gasLimit]);

    return { cars, loading, error };
}
