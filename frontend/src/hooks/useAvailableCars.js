import { useState, useEffect } from 'react';
import { carMarketplaceContract } from '../ethersConnect';  // Adjust path as necessary

export function useAvailableCars() {
    const [cars, setCars] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCars = async () => {
            setLoading(true);
            try {
                const carData = await carMarketplaceContract.getAvailableListings();
                console.log('CarData: ', carData);  
                setCars(carData.map(car => ({
                    tokenId: car.tokenId.toString(),
                    price: car.price.toString(),  // Convert BigNumber to string for easier handling
                    isAvailable: car.isAvailable
                })));
                setError(null);
            } catch (err) {
                setError('Failed to fetch cars: ' + err.message);
                console.error(err);
            }
            setLoading(false);
        };

        fetchCars();
    }, []);  

    return { cars, loading, error };
}
