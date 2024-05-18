import { useState, useEffect } from "react";
import { useContracts } from "./useContracts";

export function useMyCars(address, updateTrigger) {
  const { carMarketplaceContract, carTokenContract } = useContracts();
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

        // call carMarketplace.getListing(tokenId) for each tokenId
        const carData = await Promise.all(
          tokenIds.map((tokenId) => carMarketplaceContract.getCarDetails(tokenId))
        );

        // console.log("CarData: ", carData);

        // call getAuctionDetails(tokenId) for each tokenId and create an object of
        // auction details with startPrice, highestBid, highestBidder, auctionEndTime 
        const auctionDetails = await Promise.all(
          tokenIds.map((tokenId) =>  carMarketplaceContract.getAuctionDetails(tokenId))
        );

        const auctionDetailsFormatted = auctionDetails.map((details) => ({
          startPrice: details.startPrice.toString(),
          highestBid: details.highestBid.toString(),
          highestBidder: details.highestBidder,
          auctionEndTime: details.auctionEndTime.toString(),
        }));

        // myCars is an array of objects with price, tokenId and tokenURI
        const myCars = tokenIds.map((tokenId, index) => ({
          tokenId,
          tokenURI: tokenURIs[index],
          isListed: carData[index].isListed,
          isInAuction: carData[index].isInAuction,
          auction: auctionDetailsFormatted[index],
        }));

        console.log("MyCars: ", myCars);

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
