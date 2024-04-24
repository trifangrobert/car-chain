import React, { useState, useEffect } from 'react';
import { useUser } from "../contexts/UserContext";
import { useMyCars } from "../hooks/useMyCars";
import { faCar } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { carMarketplaceContract } from '../ethersConnect'; 
import { Link } from 'react-router-dom'; 

const MyCars = () => {
    const userAddress = useUser();
    const { cars, loading, error, refresh } = useMyCars(userAddress);
    const [sellPrice, setSellPrice] = useState('');
    const [showSellPopup, setShowSellPopup] = useState(false);
    const [selectedTokenId, setSelectedTokenId] = useState(null);
    const [isListedArray, setIsListedArray] = useState([]);

    const listCarForSale = async (tokenId, price) => {
        try {
            const transaction = await carMarketplaceContract.listCarForSale(tokenId, price);
            await transaction.wait();

            refresh();
        } catch (err) {
            console.error('Failed to list car for sale:', err);
        }
    };

    const checkIfListed = async () => {
        try {
            const isListedArray = await Promise.all(
                cars.map(async car => {
                    try {
                        return await carMarketplaceContract.isTokenListed(car.tokenId);
                    } catch (err) {
                        console.error('Failed to check if car is listed:', err);
                        return false;
                    }
                })
            );
            return isListedArray;
        } catch (err) {
            console.error('Failed to check if cars are listed:', err);
            return [];
        }
    };

    const handleSellPopup = (tokenId) => {
        setSelectedTokenId(tokenId);
        setShowSellPopup(true);
    };

    const handleSellConfirm = () => {
        if (sellPrice && selectedTokenId) {
            listCarForSale(selectedTokenId, sellPrice);
            setShowSellPopup(false);
            setSellPrice('');
        }
    };

    const cancelListing = async (tokenId) => {
        try {
            const transaction = await carMarketplaceContract.cancelListing(tokenId);
            await transaction.wait();

            refresh();
        } catch (err) {
            console.error('Failed to cancel listing:', err);
        }
    };

    useEffect(() => {
        const fetchListings = async () => {
            try {
                const listings = await checkIfListed();
                setIsListedArray(listings);
            } catch (err) {
                console.error('Failed to fetch car listings:', err);
            }
        };

        fetchListings();
    }, [cars]);

    return ( 
        <div style={{ textAlign: 'center', marginTop: '0px', backgroundColor: '#ADBBDA', padding: '20px' }}>
            {userAddress ? (
                <div>
                    <h1 style={{ fontSize: '36px', marginBottom: '30px', color: '#3D52A0' }}>My Cars</h1>

                    <div style={{ marginBottom: '20px'}}>
                        <Link to="/">
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
                                Check Car Marketplace
                            </button>
                        </Link>
                    </div>

                    <p style={{ fontSize: '16px', color: '#3D52A0', border: '2px solid #3D52A0', padding: '10px', borderRadius: '5px' }}>
                        Address: <strong>{userAddress}</strong>
                    </p>
                    {loading && <div>Loading...</div>}
                    {error && <div>Error: {error}</div>}
                    <ul style={{ listStyleType: 'none', padding: 0 }}>
                        {cars.map((car, index) => (
                            <li key={car.tokenId} style={{ marginBottom: '20px', padding: '15px', boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)', borderRadius: '5px', background: '#EDE8F5' }}>
                                <FontAwesomeIcon icon={faCar} style={{ marginRight: '10px' }} />
                                <strong>Token ID:</strong> {car.tokenId}<br />
                                <strong>Name:</strong> {car.name}<br />
                                <strong>Image:</strong> <img src={car.image} alt={car.name} style={{ maxWidth: '200px' }} /><br />
                                <strong>Description:</strong> {car.description}<br />
                                {isListedArray[index] ? (
                                    <div>
                                        Item is on Marketplace <br />
                                        <button 
                                            onClick={() => cancelListing(car.tokenId)} 
                                            style={{ 
                                                backgroundColor: '#3D52A0', 
                                                color: 'white', 
                                                border: 'none', 
                                                padding: '10px 20px', 
                                                borderRadius: '5px', 
                                                fontSize: '16px', 
                                                cursor: 'pointer',
                                                marginTop: '10px' 
                                            }}
                                        >
                                            Cancel Listing
                                        </button>
                                    </div>
                                ) : (
                                    <button 
                                        onClick={() => handleSellPopup(car.tokenId)} 
                                        style={{ 
                                            backgroundColor: '#3D52A0', 
                                            color: 'white', 
                                            border: 'none', 
                                            padding: '10px 20px', 
                                            borderRadius: '5px', 
                                            fontSize: '16px', 
                                            cursor: 'pointer',
                                            marginTop: '10px' 
                                        }}
                                    >
                                        Sell
                                    </button>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            ) : (
                <div>Please connect your wallet</div>
            )}
            {showSellPopup && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 999 }}>
                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: '#fff', padding: '20px', borderRadius: '5px', boxShadow: '0 0 10px rgba(0, 0, 0, 0.3)' }}>
                        <h2>Enter Sell Price</h2>
                        <input 
                            type="number" 
                            value={sellPrice} 
                            onChange={(e) => setSellPrice(e.target.value)} 
                            style={{ width: '100%', marginBottom: '10px', padding: '5px', borderRadius: '3px', border: '1px solid #ccc' }} 
                            placeholder="Price in WEI" 
                        />
                        <button 
                            onClick={handleSellConfirm} 
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
                            onClick={() => setShowSellPopup(false)} 
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
        </div>
    );
}
 
export default MyCars;
