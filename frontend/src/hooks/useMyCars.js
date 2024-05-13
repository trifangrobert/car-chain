import { useState, useEffect } from "react";
import { carMarketplaceContract, carTokenContract } from "../ethersConnect"; 

export function useMyCars(address) {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [carListendEvent, setCarListedEvent] = useState(null);
  const [listingCancelledEvent, setListingCancelledEvent] = useState(null);
  const [carPriceUpdatedEvent, setCarPriceUpdatedEvent] = useState(null);

  const handleEvents = async () => {
  
      carMarketplaceContract.on("CarListed",  (tokenId, seller, price, carListedEvent) => {
        console.log("CarListed event received:", carListedEvent);
        console.log("Seller:", seller);
        console.log("Token ID:", tokenId);
        console.log("Price:", price);
        setCarListedEvent(carListedEvent);
    });
      
    carMarketplaceContract.on("ListingCancelled",  (tokenId, seller, listingCancelledEvent) => {
      console.log("ListingCancelled event received:", listingCancelledEvent);
      console.log("Seller:", seller);
      console.log("Token ID:", tokenId);
      setListingCancelledEvent(listingCancelledEvent);
    });

    carMarketplaceContract.on("CarPriceUpdated",  (tokenId, price, carPriceUpdatedEvent) => {
      console.log("CarPriceUpdated event received:", carPriceUpdatedEvent);
      console.log("Price:", price);
      console.log("Token ID:", tokenId);
      setCarPriceUpdatedEvent(carPriceUpdatedEvent);
    });
};

  useEffect(() => {
    const fetchCars = async () => {
        if (!address) {
            setCars([]);
            setError("User address is null, unable to fetch cars");
            setLoading(false);
            return;
        }

      setLoading(true);

      try {
        const response = await carMarketplaceContract.getCarsOwnedBy(address);
        
        const tokenIds = response.map((tokenId) => tokenId.toString());
        
        const tokenURIs = await Promise.all(
          tokenIds.map((tokenId) => carTokenContract.tokenURI(tokenId))
        );

        const carsData = await Promise.all(tokenURIs.map(async (uri) => {
          const response = await fetch(uri);
          const data = await response.json();
          return data;
        }));

        const carsWithDetails = await Promise.all(tokenIds.map(async (tokenId, index) => {
          const isListed = await carMarketplaceContract.isTokenListed(tokenId);
          const car = {
            tokenId: tokenId,
            tokenURI: tokenURIs[index],
            name: carsData[index].name,
            image: carsData[index].image,
            description: carsData[index].description,
            isListed: isListed
          };

          if (isListed) {
            const listing = await carMarketplaceContract.getListing(tokenId);
            car.price = listing.price;
          }

          return car;
        }));
        
        setCars(carsWithDetails);
        setError(null);
      } catch (err) {
        setError("Failed to fetch cars: " + err.message);
        console.error(err);
      }
      setLoading(false);
    };

      fetchCars();
      handleEvents();
  }, [address]);

  return { cars, loading, error, carListendEvent, listingCancelledEvent, carPriceUpdatedEvent};
}
