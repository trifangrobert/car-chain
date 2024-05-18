import { useState, useEffect } from "react";
import { useContracts } from "./useContracts";

export function useAvailableAuctions(address, updateTrigger) {
  const { carMarketplaceContract, carTokenContract } = useContracts();
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  console.log("useAvailableAuctions");

  useEffect(() => {
    const fetchAuctions = async () => {
      setLoading(true);
      try {
        if (!carMarketplaceContract) {
          console.log("CarMarketplace contract not available");
          setAuctions([]);
          setError("CarMarketplace contract not available");
          setLoading(false);
          return;
        }
        console.log("Fetching active auctions");
        const auctionData = await carMarketplaceContract.getActiveAuctions();
        console.log("AuctionData: ", auctionData);

        const auctionOwner = await Promise.all(
          auctionData.map((auction) =>
            carTokenContract.ownerOf(auction.tokenId)
          )
        );

        console.log("AuctionOwners: ", auctionOwner);

        const formattedAuctions = auctionData.map((auction, index) => ({
          tokenId: auction.tokenId.toString(),
          startPrice: auction.startPrice.toString(),
          highestBid: auction.highestBid.toString(),
          highestBidder: auction.highestBidder,
          auctionEndTime: new Date(
            parseInt(auction.auctionEndTime.toString()) * 1000
          ).toLocaleString(), 
          isActive:
            parseInt(auction.auctionEndTime.toString()) * 1000 > Date.now(), 
            owner: auctionOwner[index],
        }));

        console.log("FormattedAuctions: ", formattedAuctions);

        setAuctions(formattedAuctions);
        setError(null);
      } catch (err) {
        setError("Failed to fetch auctions: " + err.message);
        console.error(err);
      }
      setLoading(false);
    };

    fetchAuctions();
  }, [address, updateTrigger]); // Update trigger can be used to refresh auction data

  return { auctions, loading, error };
}
