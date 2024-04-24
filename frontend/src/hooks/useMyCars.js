import { useState, useEffect } from "react";
import { carMarketplaceContract, carTokenContract } from "../ethersConnect"; 

export function useMyCars(address) {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCars = async () => {
        if (!address) {
            setCars([]);
            setError("User address is null, unable to fetch cars");
            setLoading(false);
            return;
        }

      setLoading(true);

      try {
        console.log("Fetching cars owned by: ", address);
        const response = await carMarketplaceContract.getCarsOwnedBy(address);
        console.log("Response: ", response);
        
        const tokenIds = response.map((tokenId) => tokenId.toString());
        
        console.log("TokenIds: ", tokenIds);
        
        // call  function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory)
        const tokenURIs = await Promise.all(
          tokenIds.map((tokenId) => carTokenContract.tokenURI(tokenId))
        );

        console.log("TokenURIs: ", tokenURIs);
        setCars(
          tokenIds.map((car, index) => ({
            tokenId: car.toString(),
            tokenURI: tokenURIs[index],
          }))
        );
        setError(null);
      } catch (err) {
        setError("Failed to fetch cars: " + err.message);
        console.error(err);
      }
      setLoading(false);
    };

      fetchCars();
    
  }, [address]);

  return { cars, loading, error };
}
