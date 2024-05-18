import React, { useState } from "react";
import { useAvailableAuctions } from "../hooks/useAvailableAuctions";
import { useCarDetails } from "../hooks/useCarDetails";
import Loading from "../components/Loading";
import {
  Typography,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Button,
  Grid,
  Box,
} from "@mui/material";
import { useUser } from "../contexts/UserContext";
import PlaceBidDialog from "../components/PlaceBidDialog";
import { placeBid } from "../services/CarService";
import { useContracts } from "../hooks/useContracts";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { toast } from "react-toastify";

const Auctions = () => {
  const navigate = useNavigate();
  const { carMarketplaceContract } = useContracts();
  const { address, signer } = useUser();
  const [updateTrigger, setUpdateTrigger] = useState(false);
  const { auctions, loadingAuction, errorAuction } = useAvailableAuctions(
    address,
    updateTrigger
  );
  const { carDetails, loadingCars, errorCars } = useCarDetails(
    auctions,
    updateTrigger
  );

  const [bidDialogOpen, setBidDialogOpen] = useState(false);
  const [selectedAuction, setSelectedAuction] = useState(null);
  const [bidAmount, setBidAmount] = useState("");

  // listen to BidPlaced event
  useEffect(() => {
    if (!carMarketplaceContract) return;

    const onBidPlaced = (tokenId, bidder, amount) => {
      console.log(
        `BidPlaced event: tokenId=${tokenId}, bidder=${bidder}, amount=${amount}`
      );
      toast.success(
        `BidPlaced event: tokenId=${tokenId}, bidder=${bidder}, amount=${amount}`
      );
    };

    carMarketplaceContract.on("BidPlaced", onBidPlaced);

    return () => {
      carMarketplaceContract.off("BidPlaced", onBidPlaced);
    };
  }, [carMarketplaceContract]);

  const isLoading = loadingAuction || loadingCars;
  const hasError = errorAuction || errorCars;

  if (isLoading) return <Loading />;
  if (hasError) {
    return (
      <Typography variant="h6" color="error" style={{ textAlign: "center" }}>
        Error: {hasError}
      </Typography>
    );
  }

  console.log("CarDetails from Auction Page: ", carDetails);

  const handleOpenBidDialog = (auction) => {
    setSelectedAuction(auction);
    setBidDialogOpen(true);
  };

  const handleCloseBidDialog = () => {
    setBidDialogOpen(false);
  };

  const handlePlaceBid = async (bidAmount) => {
    console.log(
      `Bid of ${bidAmount} placed on auction ${selectedAuction.tokenId}`
    );

    if (selectedAuction && bidAmount) {
      try {
        await placeBid(
          selectedAuction.tokenId,
          bidAmount,
          carMarketplaceContract
        );
        console.log("Bid placed successfully");
        setUpdateTrigger(!updateTrigger);
      } catch (error) {
        console.error("Failed to place bid: ", error);
      }
    }
    handleCloseBidDialog();
  };

  return (
    <div style={{ padding: 20 }}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        marginBottom={2}
      >
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate("/my-cars")}
        >
          View My Cars
        </Button>
        <Typography variant="h4" style={{ textAlign: "center" }}>
          Available Auctions
        </Typography>
        <Button
          variant="contained"
          color="secondary"
          onClick={() => navigate("/")}
        >
          View Marketplace
        </Button>
      </Box>
      <Grid container spacing={4} justifyContent="center">
        {carDetails.map((car) => (
          <Grid item key={car.tokenId} xs={12} sm={6} md={4}>
            <Card raised>
              <CardMedia
                component="img"
                height="140"
                image={car.image || "https://via.placeholder.com/150"}
                alt={`Image of ${car.name}`}
              />
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h5" component="div">
                  {car.name}
                </Typography>
                <Typography variant="body2" color="textSecondary" noWrap>
                  {car.description.length > 100
                    ? `${car.description.substring(0, 100)}...`
                    : car.description}
                </Typography>
                <Box mt={2}>
                  <Typography variant="body1">
                    Start Price: {car.startPrice} WEI
                  </Typography>
                  <Typography variant="body1">
                    Highest Bid: {car.highestBid} WEI
                  </Typography>
                  <Typography variant="body1" color="textSecondary">
                    Auction Ends: {car.auctionEndTime}
                  </Typography>
                </Box>
              </CardContent>
              <CardActions style={{ justifyContent: "center", height: 50 }}>
                {car.owner !== address ? (
                  <Button
                    size="small"
                    color="primary"
                    onClick={() => handleOpenBidDialog(car)}
                    disabled={!car.isActive}
                  >
                    Place Bid
                  </Button>
                ) : (
                  <Typography variant="body2" color="textSecondary">
                    You cannot bid on your own car
                  </Typography>
                )}
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
      <PlaceBidDialog
        open={bidDialogOpen}
        handleClose={handleCloseBidDialog}
        handleBid={handlePlaceBid}
        minimumBid={
          selectedAuction
            ? Math.max(selectedAuction.startPrice, selectedAuction.highestBid)
            : 0
        }
        setBidAmount={setBidAmount}
        bidAmount={bidAmount}
        tokenId={selectedAuction?.tokenId}
      />
    </div>
  );
};

export default Auctions;
