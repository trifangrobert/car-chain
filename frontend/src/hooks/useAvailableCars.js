import { useState, useEffect } from 'react';
import { carMarketplaceContract, carTokenContract } from '../ethersConnect'; 
export function useAvailableCars() {
    const [cars, setCars] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [event, setEvent] = useState(null);
    const handleCarSoldEvent = async () => {

    carMarketplaceContract.on("CarSold",  (seller, buyer, tokenId, price, event) => {
        console.log("CarSold event received:", event);
        console.log("Seller:", seller);
        console.log("Buyer:", buyer);
        console.log("Token ID:", tokenId);
        console.log("Price:", price);
        setEvent(event);
    });

    };
    useEffect(() => {
        const fetchCars = async () => {
            setLoading(true);
            try {
                const carData = await carMarketplaceContract.getAvailableListings();
                console.log('CarData: ', carData);

                // filter out cars with tokenId 0, which is invalid
                const carsWithDetails = await Promise.all(
                    carData.filter(car => car.tokenId.toString() != 0).map(async car => {
                        console.log('Car: ', car);
                        console.log('Car token id: ', car.tokenId);
                        const tokenURI = await carTokenContract.tokenURI(car.tokenId);
                        const response = await fetch(tokenURI);
                        const data = await response.json();
                        return {
                            tokenId: car.tokenId,
                            price: car.price,
                            isActive: car.isActive,
                            name: data.name,
                            image: data.image,
                            description: data.description
                        };
                    })
                );

                setCars(carsWithDetails);
                setError(null);
            } catch (err) {
                setError('Failed to fetch cars: ' + err.message);
                console.error(err);
            }
            setLoading(false);
        };

        fetchCars();
        handleCarSoldEvent();
    }, []);  

    return { cars, loading, error, event };
}
