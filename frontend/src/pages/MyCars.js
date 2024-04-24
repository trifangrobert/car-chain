import { useEffect } from "react";
import { useUser } from "../contexts/UserContext";
import { useMyCars } from "../hooks/useMyCars";

const MyCars = () => {
    const userAddress = useUser();
    const { cars, loading, error } = useMyCars(userAddress);
    console.log("UserAddress from MyCars: ", userAddress);

    return ( 
        <div>
            {userAddress ? (
                <div>
                    <h1>My Cars</h1>
                    <p>Address: {userAddress}</p>
                    {loading && <div>Loading...</div>}
                    {error && <div>Error: {error}</div>}
                    <ul>
                        {cars.map(car => (
                            <li key={car.tokenId}>
                                Token ID: {car.tokenId}, Price: {car.price} WEI
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