import React from 'react';
import { useEffect } from "react";
import { useUser } from "../contexts/UserContext";
import { useMyCars } from "../hooks/useMyCars";
import { faCar } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const MyCars = () => {
    const userAddress = useUser();
    const { cars, loading, error } = useMyCars(userAddress);

    return ( 
        <div style={{ textAlign: 'center', marginTop: '0px', backgroundColor: '#ADBBDA', padding: '20px' }}>
            {userAddress ? (
                <div>
                    <h1 style={{ fontSize: '36px', marginBottom: '30px', color: '#3D52A0' }}>My Cars</h1>
                    <p style={{ fontSize: '16px', color: '#3D52A0', border: '2px solid #3D52A0', padding: '10px', borderRadius: '5px' }}>
                    Address: <strong>{userAddress}</strong>
                    </p>
                    {loading && <div>Loading...</div>}
                    {error && <div>Error: {error}</div>}
                    <ul style={{ listStyleType: 'none', padding: 0 }}>
                        {cars.map(car => (
                            <li key={car.tokenId} style={{ marginBottom: '20px', padding: '15px', boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)', borderRadius: '5px', background: '#EDE8F5' }}>
                                <FontAwesomeIcon icon={faCar} style={{ marginRight: '10px' }} />
                                <strong>Token ID:</strong> {car.tokenId}<br />
                            </li>
                        ))}
                    </ul>
                </div>
            ) : (
                <div>Please connect your wallet</div>
            )}
        </div>
     );
}
 
export default MyCars;
