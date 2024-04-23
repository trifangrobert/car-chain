import React from 'react';
import { useAvailableCars } from '../hooks/useAvailableCars'; 

function AvailableCars() {
    const { cars, loading, error } = useAvailableCars();

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div>
            <h1>Available Cars</h1>
            <ul>
                {cars.map(car => (
                    <li key={car.tokenId}>
                        Token ID: {car.tokenId}, Price: {car.price} WEI
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default AvailableCars;
