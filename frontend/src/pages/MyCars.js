import React, { useState, useEffect } from 'react';
import { useUser } from "../contexts/UserContext";
import { useMyCars } from "../hooks/useMyCars";
import { faCar } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { carMarketplaceContract } from '../ethersConnect'; 
import { Link } from 'react-router-dom'; 

const MyCars = () => {
    const userAddress = useUser();
    const { cars, loading, error,  carListendEvent, listingCancelledEvent, carPriceUpdatedEvent} = useMyCars(userAddress);
    const [sellPrice, setSellPrice] = useState('');
    const [showEnterPricePopup, setShowEnterPricePopup] = useState(false);
    const [showGasFeePopup, setShowGasFeePopup] = useState(false);
    const [showUpdateGasFeePopup, setShowUpdateGasFeePopup] = useState(false);
    const [showCancelGasFeePopup, setShowCancelGasFeePopup] = useState(false);
    const [showLoadingPopup, setShowLoadingPopup] = useState(false);
    const [selectedTokenId, setSelectedTokenId] = useState(null);
    const [isListedArray, setIsListedArray] = useState([]);
    const [gasFee, setGasFee] = useState(null);
    const [anyError, setAnyError] = useState(null);
    
    useEffect(() => {
        if (carListendEvent) {
            window.location.reload();
            console.log("Refresh after CarListed Event" + carListendEvent)
        }
        else if (listingCancelledEvent){
            window.location.reload();
            console.log("Refresh after ListingCancelled Event" + listingCancelledEvent)
        }
        else if (carPriceUpdatedEvent){
            window.location.reload();
            console.log("Refresh after PriceUpdated Event" + carPriceUpdatedEvent)
        }
    }, [carListendEvent, listingCancelledEvent, carPriceUpdatedEvent]);

    const estimateGas = async (tokenId, price, type) => {
        try {
            var gasEstimation = 0;
            console.log(tokenId)
            console.log(price)
            if (type === 0) {
                gasEstimation = await carMarketplaceContract.listCarForSale.estimateGas(tokenId, price);
            }
            else if (type === 1){
                gasEstimation = await carMarketplaceContract.cancelListing.estimateGas(tokenId);
            }
            else {
                gasEstimation = await carMarketplaceContract.updateCarPrice.estimateGas(tokenId, price);
            }

            if (gasEstimation == null){
                gasEstimation = 0;
            }
            console.log(gasEstimation)
            setGasFee(gasEstimation);
        } catch (err) {
            console.error('Failed to estimate gas:', err);

            setAnyError(err['info']['error']['message']);
            setTimeout(() => {
                setAnyError(null);
            }, 3000);
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

            setAnyError(err['info']['error']['message']);
            setTimeout(() => {
                setAnyError(null);
            }, 3000);
            return [];
        }
    };

    const handleSellPopup = (tokenId) => {
        setSelectedTokenId(tokenId);
        setShowEnterPricePopup(true);
    };

    const handleSellConfirm = async () => {
        try {
            if (sellPrice && selectedTokenId) {
                await estimateGas(selectedTokenId, sellPrice, 0);
                setShowEnterPricePopup(false); 
                setShowGasFeePopup(true);
            }
        } catch (err) {
            console.error('Failed to initiate sell transaction:', err);

            setAnyError(err['info']['error']['message']);
            setTimeout(() => {
                setAnyError(null);
            }, 3000);
        }
    };
    
    // Function to confirm the sale after reviewing transaction details
    const confirmSellTransaction = async () => {
        try {
            setShowGasFeePopup(false);
            setShowLoadingPopup(true);

            const transaction = await carMarketplaceContract.listCarForSale(selectedTokenId, sellPrice);
            await transaction.wait();

            setShowLoadingPopup(false);

            setSellPrice('');
            setSelectedTokenId(null);
            setGasFee(null);
        } catch (err) {
            setShowLoadingPopup(false);
            console.error('Failed to list car for sale:', err);

            setAnyError(err['info']['error']['message']);
            setTimeout(() => {
                setAnyError(null);
            }, 3000);
        }
    };
    
    const handleUpdateListing = async (tokenId) => {
        const newPrice = prompt("Enter the new price in WEI:");
        if (newPrice !== null) {
            setSellPrice(newPrice)
            setSelectedTokenId(tokenId);
            await estimateGas(tokenId, newPrice, 2);
            setShowUpdateGasFeePopup(true);
        }
    };

    const confirmUpdateListingTransaction = async () => {
        try {
            setShowUpdateGasFeePopup(false);
            setShowLoadingPopup(true);

            const transaction = await carMarketplaceContract.updateCarPrice(selectedTokenId, sellPrice);
            await transaction.wait();

            setShowLoadingPopup(false);

            setSellPrice('');
            setSelectedTokenId(null);
            setGasFee(null);
        } catch (err) {
            setShowLoadingPopup(false);
            console.error('Failed to update listing:', err);

            setAnyError(err['info']['error']['message']);
            setTimeout(() => {
                setAnyError(null);
            }, 3000);
        }
    };    

    const handleCancelListing = async (tokenId) => {
        setSelectedTokenId(tokenId);
        await estimateGas(tokenId, 0, 1);
        setShowCancelGasFeePopup(true);
    };

    const confirmCancelListingTransaction = async () => {
        try {
            setShowCancelGasFeePopup(false);
            setShowLoadingPopup(true);

            const transaction = await carMarketplaceContract.cancelListing(selectedTokenId);
            await transaction.wait();
            
            setShowLoadingPopup(false);

            setSelectedTokenId(null);
            setGasFee(null);
        } catch (err) {
            setShowLoadingPopup(false);
            console.error('Failed to cancel listing:', err);

            setAnyError(err['info']['error']['message']);
            setTimeout(() => {
                setAnyError(null);
            }, 3000);
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
                                <strong>Token ID:</strong> {car.tokenId.toString()}<br />
                                <strong>Name:</strong> {car.name}<br />
                                <strong>Image:</strong> <img src={car.image} alt={car.name} style={{ maxWidth: '200px' }} /><br />
                                <strong>Description:</strong> {car.description}<br />
                                {isListedArray[index] ? (
                                    <div>
                                        Item is on Marketplace for {car.price.toString()} WEI. <br />
                                        <button 
                                            onClick={() => handleUpdateListing(car.tokenId)} 
                                            style={{ 
                                                backgroundColor: '#3D52A0', 
                                                color: 'white', 
                                                border: 'none', 
                                                padding: '10px 20px', 
                                                borderRadius: '5px', 
                                                fontSize: '16px', 
                                                cursor: 'pointer',
                                                marginTop: '10px',
                                                marginRight: '10px' 
                                            }}
                                        >
                                            Update Listing
                                        </button>
                                        <button 
                                            onClick={() => handleCancelListing(car.tokenId)} 
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
            {showEnterPricePopup && (
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
                            onClick={() => setShowEnterPricePopup(false)} 
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
            {showGasFeePopup && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 999 }}>
                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: '#fff', padding: '20px', borderRadius: '5px', boxShadow: '0 0 10px rgba(0, 0, 0, 0.3)' }}>
                        <h2>Transaction Details</h2>
                        <p>Estimated Gas Fee: {gasFee.toString()} WEI</p>
                        <button 
                            onClick={confirmSellTransaction} 
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
                            onClick={() => setShowGasFeePopup(false)} 
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
             {showUpdateGasFeePopup && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 999 }}>
                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: '#fff', padding: '20px', borderRadius: '5px', boxShadow: '0 0 10px rgba(0, 0, 0, 0.3)' }}>
                        <h2>Transaction Details</h2>
                        <p>Estimated Gas Fee: {gasFee.toString()} WEI</p>
                        <button 
                            onClick={confirmUpdateListingTransaction} 
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
                            onClick={() => setShowUpdateGasFeePopup(false)} 
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
            {showCancelGasFeePopup && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 999 }}>
                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: '#fff', padding: '20px', borderRadius: '5px', boxShadow: '0 0 10px rgba(0, 0, 0, 0.3)' }}>
                        <h2>Transaction Details</h2>
                        <p>Estimated Gas Fee: {gasFee.toString()} WEI</p>
                        <button 
                            onClick={confirmCancelListingTransaction} 
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
                            onClick={() => setShowCancelGasFeePopup(false)} 
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

            {anyError && (
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
                    <p>{anyError}</p>
                </div>
            )}

                                        
        </div>

    );
}
 
export default MyCars;
