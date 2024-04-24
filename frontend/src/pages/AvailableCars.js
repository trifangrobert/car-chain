import React from 'react';
import { useAvailableCars } from '../hooks/useAvailableCars'; 
import { faCar, faMoneyBill } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { carMarketplaceContract } from '../ethersConnect'; // Import contract instance
import { Link } from 'react-router-dom'; // Import Link for navigation

function AvailableCars() {
    const { cars, loading, error } = useAvailableCars();

    const buyCar = async (tokenId, price) => {
        try {
            // Call buyCar function from carMarketplaceContract
            const transaction = await carMarketplaceContract.buyCar(tokenId, { value: price });
            await transaction.wait();

            // Reload page after successful purchase

        } catch (err) {
            console.error('Failed to buy car:', err);
            // Handle error
        }
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div style={{ textAlign: 'center', marginTop: '0px', backgroundColor: '#ADBBDA', padding: '20px' }}>
            <h1 style={{ fontSize: '36px', marginBottom: '30px', color: '#3D52A0' }}>Car Marketplace</h1>

            {/* Navigation section */}
            <div style={{ marginBottom: '20px' }}>
                <Link to="/my-cars">
                    <button 
                        style={{ 
                            backgroundColor: '#3D52A0', 
                            color: 'white', 
                            border: 'none', 
                            padding: '10px 20px', 
                            borderRadius: '5px', 
                            fontSize: '16px', 
                            cursor: 'pointer' 
                        }}
                    >
                        Check My Cars
                    </button>
                </Link>
            </div>

            <ul style={{ listStyleType: 'none', padding: 0 }}>
                {cars.map(car => (
                    car.isActive && (
                        <li key={car.tokenId} style={{ marginBottom: '20px', padding: '15px', boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)', borderRadius: '5px', background: '#EDE8F5' }}>
                            <FontAwesomeIcon icon={faCar} style={{ marginRight: '10px' }} />
                            <strong>Token ID:</strong> {car.tokenId}<br />
                            <FontAwesomeIcon icon={faMoneyBill} style={{ marginRight: '10px' }} />
                            <strong>Price:</strong> {car.price} WEI<br />
                            <strong>Status:</strong> {car.isActive ? 'Available' : 'Sold'}
                            <div style={{ marginTop: '10px' }}>
                                <button 
                                    onClick={() => buyCar(car.tokenId, car.price)} 
                                    style={{ 
                                        backgroundColor: '#3D52A0', 
                                        color: 'white', 
                                        border: 'none', 
                                        padding: '10px 20px', 
                                        borderRadius: '5px', 
                                        fontSize: '16px', 
                                        cursor: 'pointer' 
                                    }}
                                >
                                    Buy
                                </button>
                            </div>
                        </li>
                    )
                ))}
            </ul>
        </div>
    );
}

export default AvailableCars;
