import { useState, useEffect } from "react";
import { carMarketplaceContract, carTokenContract } from "../ethersConnect"; 

export function useMyCars(address, updateTrigger) {
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
        // console.log("Fetching cars owned by: ", address);
        const response = await carMarketplaceContract.getCarsOwnedBy(address);
        // console.log("Response: ", response);
        
        const tokenIds = response.map((tokenId) => tokenId.toString());
        
        // console.log("TokenIds: ", tokenIds);
        
        // call  function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory)
        const tokenURIs = await Promise.all(
          tokenIds.map((tokenId) => carTokenContract.tokenURI(tokenId))
        );

        // console.log("TokenURIs: ", tokenURIs);

        // call carMarketplace.getListing(tokenId) for each tokenId
        const carData = await Promise.all(
          tokenIds.map((tokenId) => carMarketplaceContract.getListing(tokenId))
        );

        // console.log("CarData: ", carData);

        // myCars is an array of objects with price, tokenId and tokenURI
        const myCars = tokenIds.map((tokenId, index) => ({
          tokenId,
          price: carData[index].isActive ? carData[index].price.toString() : null,
          tokenURI: tokenURIs[index],
          isActive: carData[index].isActive,
        }));

        setCars(myCars);
        setError(null);
      } catch (err) {
        setError("Failed to fetch cars: " + err.message);
        console.error(err);
      }
      setLoading(false);
    };

      fetchCars();
    
  }, [address, updateTrigger]);

  return { cars, loading, error };
}
