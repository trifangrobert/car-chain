
import { useState, useEffect } from "react";
import { carMarketplaceContract, carTokenContract } from "../ethersConnect"; 

export function useMyCars(address) {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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

        const carsWithDetails = carsData.map((car, index) => ({
          tokenId: tokenIds[index],
          tokenURI: tokenURIs[index],
          name: car.name,
          image: car.image,
          description: car.description
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
    
  }, [address]);

  return { cars, loading, error };
}
