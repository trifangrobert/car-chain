import { useState, useEffect } from "react";
import { carMarketplaceContract } from "../ethersConnect"; 

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
        const carData = await carMarketplaceContract.getCarsOwnedBy(address);
        console.log("CarData: ", carData);
        setCars(
          carData.map((car) => ({
            tokenId: car.tokenId.toString(),
            price: car.price.toString(), // Convert BigNumber to string for easier handling
            isAvailable: car.isAvailable,
          }))
        );
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
