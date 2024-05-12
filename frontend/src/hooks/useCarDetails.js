// hooks/useCarDetails.js
import { useEffect, useState } from 'react';
import axios from 'axios';

export const useCarDetails = (cars) => {
    const [carDetails, setCarDetails] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (cars.length > 0) {
            setLoading(true);
            Promise.all(cars.map(car => 
                axios.get(`http://localhost:3001/token/${car.tokenId}`)
                    .then(res => ({ ...car, ...res.data }))
                    .catch(error => ({ ...car, error: error.message }))
            ))
            .then(results => {
                setCarDetails(results);
                setLoading(false);
            })
            .catch(err => {
                setError(err.message);
                setLoading(false);
            });
        }
    }, [cars]);

    return { carDetails, loading, error };
};
