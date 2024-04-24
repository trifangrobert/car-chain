import { useState, useEffect } from 'react';
import { carMarketplaceContract, carTokenContract } from '../ethersConnect'; 
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

                const carsWithDetails = await Promise.all(carData.map(async car => {
                    const tokenURI = await carTokenContract.tokenURI(car.tokenId);
                    const response = await fetch(tokenURI);
                    const data = await response.json();
                    return {
                        tokenId: car.tokenId.toString(),
                        price: car.price.toString(),
                        isActive: car.isActive,
                        name: data.name,
                        image: data.image,
                        description: data.description
                    };
                }));

                setCars(carsWithDetails);
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
