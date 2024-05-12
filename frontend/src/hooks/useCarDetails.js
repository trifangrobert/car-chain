// hooks/useCarDetails.js
import { useEffect, useState } from "react";
import axios from "axios";

export const useCarDetails = (cars, updateTrigger) => {
  const [carDetails, setCarDetails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCarData = async () => {
      if (cars.length > 0) {
        try {
          setLoading(true);
          const promises = cars.map((car) =>
            axios
              .get(`http://localhost:3001/token/${car.tokenId}`)
              .then((res) => ({ ...car, ...res.data }))
              .catch((error) => ({ ...car, error: error.message }))
          );
          const results = await Promise.all(promises);
          setCarDetails(results);
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      }
      else {
        setCarDetails([]);
      }
    };

    fetchCarData();
  }, [cars, updateTrigger]);

  return { carDetails, loading, error };
};
