import React, { useState, useEffect } from 'react';
import { useUser } from "../contexts/UserContext";
import { useAvailableCars } from '../hooks/useAvailableCars'; 
import { faCar, faMoneyBill } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { carMarketplaceContract } from '../ethersConnect'; 
import { carTokenContract } from '../ethersConnect'; 
import { Link } from 'react-router-dom';

function AvailableCars() {
    const userAddress = useUser();
    const { cars, loading, error, event } = useAvailableCars();
    const [buyError, setBuyError] = useState(null);
    const [gasFee, setGasFee] = useState(null);
    const [showGasFeePopup, setShowGasFeePopup] = useState(false);
    const [selectedTokenId, setSelectedTokenId] = useState(null);
    const [showLoadingPopup, setShowLoadingPopup] = useState(false);
    const [buyPrice, setBuyPrice] = useState('');

    useEffect(() => {
        // Refresh the page when the CarSold event is received
        if (event) {
            window.location.reload();
            console.log("Refresh after CarSold Event" + event)
        }
    }, [event]);

    const estimateGas = async (tokenId, price) => {
        try {
            const owner = await carTokenContract.ownerOf(tokenId);

            if (owner === userAddress) {
                setBuyError('You cannot buy your own car.');
                setTimeout(() => {
                    setBuyError(null); // Clear the error after a certain time
                }, 3000); // Adjust the time as needed
                return false; // Exit the function early
            }
            
            var gasEstimation = await carMarketplaceContract.buyCar.estimateGas(tokenId, { value: price });
    
            console.log(gasEstimation);
            setGasFee(gasEstimation);

            return true;
        } catch (err) {      
            console.error('Failed to estimate gas:', err);
            
            setBuyError(err['info']['error']['message']);
            setTimeout(() => {
                setBuyError(null);
            }, 3000);
        }
    };

    const handleBuyConfirm = async (tokenId, price) => {
        try {
            if (price && tokenId) {
                var result = await estimateGas(tokenId, price); // Estimate gas fees
                if (result){
                    setBuyPrice(price);
                    setSelectedTokenId(tokenId);
                    setShowGasFeePopup(true); // Show GasFeePopup
                }
            }
        } catch (err) {
            console.error('Failed to initiate buy transaction:', err);
            
            setBuyError(err['info']['error']['message']);
            setTimeout(() => {
                setBuyError(null);
            }, 3000);
        }
    };

    const confirmBuyCarTransaction = async () => {
        try {
            setShowGasFeePopup(false);
            setShowLoadingPopup(true);

            const transaction = await carMarketplaceContract.buyCar(selectedTokenId, { value: buyPrice });
            await transaction.wait();

            setShowLoadingPopup(false);

            setBuyPrice('');
            setSelectedTokenId(null);

        } catch (err) {
            setShowLoadingPopup(false);

            console.error('Failed to buy car:', err);
            
            setBuyError(err['info']['error']['message']);
            setTimeout(() => {
                setBuyError(null);
            }, 3000);
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
                                    onClick={() => handleBuyConfirm(car.tokenId, car.price)} 
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

            {showGasFeePopup && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 999 }}>
                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: '#fff', padding: '20px', borderRadius: '5px', boxShadow: '0 0 10px rgba(0, 0, 0, 0.3)' }}>
                        <h2>Transaction Details</h2>
                        <p>Car Price:<strong>{buyPrice.toString()}</strong>  WEI</p>
                        <p>Est. Gas Fee: <strong>{gasFee.toString()}</strong> WEI</p>
                        <p>Total Amount: <strong>{parseInt(buyPrice) + parseInt(gasFee)}</strong> WEI </p>
                        <button 
                            onClick={confirmBuyCarTransaction} 
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
                            Confirm
                        </button>
                        <button 
                            onClick={() => (setShowGasFeePopup(false), setShowLoadingPopup(false))} 
                            style={{ 
                                backgroundColor: '#3D52A0', 
                                color: 'white', 
                                border: 'none', 
                                padding: '10px 20px', 
                                borderRadius: '5px', 
                                fontSize: '16px', 
                                cursor: 'pointer',
                                marginLeft: '10px'
                            }}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {showLoadingPopup && (
                <div style={{ 
                    position: 'fixed', 
                    top: '0', 
                    left: '0', 
                    width: '100%', 
                    height: '100%', 
                    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent black background
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    zIndex: 9999 
                }}>
                    <div style={{ 
                        backgroundColor: '#ADBBDA', // Light blue background color
                        padding: '40px', 
                        borderRadius: '10px', 
                        boxShadow: '0 0 10px rgba(0, 0, 0, 0.5)', 
                        textAlign: 'center' 
                    }}>
                        <h2 style={{ color: '#3D52A0' }}>Loading...</h2>
                    </div>
                </div>
            )}
                        
        </div>
    );
}

export default AvailableCars;
