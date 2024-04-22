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
                // Assuming `getAvailableListings` is a function in your contract
                const carData = await carMarketplaceContract.getAvailableListings();
                setCars(carData.map(car => ({
                    tokenId: car.tokenId.toString(),
                    price: car.price.toString()  // Convert BigNumber to string for easier handling
                })));
                setError(null);
            } catch (err) {
                setError('Failed to fetch cars: ' + err.message);
                console.error(err);
            }
            setLoading(false);
        };

        fetchCars();
    }, []);  // Empty dependency array means this effect runs once on mount

    return { cars, loading, error };
}
