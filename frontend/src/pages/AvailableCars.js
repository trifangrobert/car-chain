import React, { useState } from 'react';
import { useAvailableCars } from '../hooks/useAvailableCars'; 
import { faCar, faMoneyBill } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { carMarketplaceContract } from '../ethersConnect'; 
import { Link } from 'react-router-dom';

function AvailableCars() {
    const { cars, loading, error } = useAvailableCars();
    const [buyError, setBuyError] = useState(null);

    const buyCar = async (tokenId, price) => {
        try {
            const transaction = await carMarketplaceContract.buyCar(tokenId, { value: price });
            await transaction.wait();

        } catch (err) {
            console.error('Failed to buy car:', err);
            setBuyError('You cannot buy your own car.');
            setTimeout(() => {
                setBuyError(null); // Clear the error after a certain time
            }, 3000); // Adjust the time as needed
        }
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div style={{ textAlign: 'center', marginTop: '0px', backgroundColor: '#ADBBDA', padding: '20px', position: 'relative' }}>
            <h1 style={{ fontSize: '36px', marginBottom: '30px', color: '#3D52A0' }}>Car Marketplace</h1>
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
                            <strong>Token ID:</strong> {car.tokenId.toString()}<br />
                            <FontAwesomeIcon icon={faMoneyBill} style={{ marginRight: '10px' }} />
                            <strong>Price:</strong> {car.price.toString()} WEI<br />
                            <strong>Status:</strong> {car.isActive ? 'Available' : 'Sold'}
                            <div style={{ marginTop: '10px' }}>
                            <br />
                            <div>
                                <strong>Name:</strong> {car.name} <br />
                                <strong>Description:</strong> {car.description} <br />
                                <img src={car.image} alt={car.name} style={{ maxWidth: '200px', maxHeight: '200px' }} /> <br />
                            </div>
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

            {buyError && (
                 <div style={{
                    position: 'fixed',
                    top: '20px',
                    left: '20px',
                    backgroundColor: '#FFDADA', // reddish color
                    padding: '10px',
                    borderRadius: '5px',
                    boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
                    zIndex: '9999'
                }}>
                    <p>{buyError}</p>
                </div>
            )}
            
        </div>
    );
}

export default AvailableCars;
