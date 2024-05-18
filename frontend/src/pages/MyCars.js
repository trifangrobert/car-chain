// components/MyCars.js
import React from "react";
import { useState, useEffect } from "react";
import { useUser } from "../contexts/UserContext";
import { useMyCars } from "../hooks/useMyCars";
import { useCarDetails } from "../hooks/useCarDetails";
import {
  Box,
  Typography,
  CircularProgress,
  List,
  ListItem,
  Paper,
  Alert,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Button,
} from "@mui/material";
import {
  listCar,
  unlistCar,
  updateCarPrice,
  startAuction,
  endAuction
} from "../services/CarService";
import { useContracts } from "../hooks/useContracts";
import { useNavigate } from "react-router-dom";
import Loading from "../components/Loading";
import SellCarDialog from "../components/SellCarDialog";
import UpdateCarDialog from "../components/UpdateCarDialog";
import DeleteCarDialog from "../components/DeleteCarDialog";
import AuctionCarDialog from "../components/AuctionCarDialog";
import { toast } from "react-toastify";
import { format } from 'date-fns';

const MyCars = () => {
  const { carMarketplaceContract } = useContracts();
  const [updateTrigger, setUpdateTrigger] = useState(false);

  const user = useUser();
  const { address, signer, provider } = user;
  //   console.log("user:", user);
  //   console.log("signer:", signer);
  const {
    cars,
    loading: carsLoading,
    error: carsError,
  } = useMyCars(address, updateTrigger);
  const {
    carDetails,
    loading: detailsLoading,
    error: detailsError,
  } = useCarDetails(cars, updateTrigger);
  const [openDialog, setOpenDialog] = useState(false);
  const [openUpdateDialog, setOpenUpdateDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openAuctionDialog, setOpenAuctionDialog] = useState(false);

  const [selectedCar, setSelectedCar] = useState(null);
  const [price, setPrice] = useState("");
  const [gasLimit, setGasLimit] = useState("");
  const [duration, setDuration] = useState(""); // in seconds
  const navigate = useNavigate();

  const [balance, setBalance] = useState(0);

  useEffect(() => {
    if (!carMarketplaceContract) return;

    // Event listeners
    const onCarListed = (tokenId, seller, price) => {
      console.log("onCarListed event:", tokenId, seller, price);
      if (seller === address) {
        // Check if the current user is the seller
        toast.success(
          `CarListed event: Your car with token ID ${tokenId} is now listed for ${price} WEI.`
        );
      }
    };

    const onCarPriceUpdated = (tokenId, price) => {
      toast.info(
        `CarPriceUpdated event: Price for car with token ID ${tokenId} updated to ${price} WEI.`
      );
    };

    const onCarUnlisted = (tokenId, seller) => {
      if (seller === address) {
        toast.warning(
          `CarUnlisted event: Listing for car with token ID ${tokenId} has been cancelled.`
        );
      }
    };

    const onAuctionCreated = (tokenId, seller, price, duration) => {
      if (seller === address) {
        toast.success(
          `Auction created for car with token ID ${tokenId} at price ${price} WEI for ${duration} seconds.`
        );
      }
    };

    const onAuctionEnded = (tokenId, seller, winner, price) => {
      if (seller === address) {
        toast.success(
          `Auction ended for car with token ID ${tokenId}. Winner: ${winner}, price: ${price} WEI.`
        );
      }
    };

    // Subscribing to the events
    carMarketplaceContract.on("CarListed", onCarListed);
    carMarketplaceContract.on("CarPriceUpdated", onCarPriceUpdated);
    carMarketplaceContract.on("CarUnlisted", onCarUnlisted);
    carMarketplaceContract.on("AuctionCreated", onAuctionCreated);
    carMarketplaceContract.on("AuctionEnded", onAuctionEnded);


    // Cleanup logic
    return () => {
      if (carMarketplaceContract) {
        carMarketplaceContract.off("CarListed", onCarListed);
        carMarketplaceContract.off("CarPriceUpdated", onCarPriceUpdated);
        carMarketplaceContract.off("CarUnlisted", onCarUnlisted);
        carMarketplaceContract.off("AuctionCreated", onAuctionCreated);
        carMarketplaceContract.off("AuctionEnded", onAuctionEnded);
      }
    };
  }, [carMarketplaceContract, address]);

  // load user balance
  useEffect(() => {
    if (provider && address) {
      provider.getBalance(address).then((balance) => {
        // convert from WEI to ETH
        let balanceInEth = parseFloat(balance.toString()) / 10 ** 18;
        setBalance(balanceInEth);
      });
    }
  }, [provider, address]);


  // check if carMarketplaceContract is available
  if (!carMarketplaceContract) {
    return <Loading />;
  }

  const convertEpochToDate = (epoch) => {
    const date = new Date(epoch * 1000);
    return format(date, "PPpp"); // Converts to readable "Date at Time" format
  };

  const isAuctionPast = (endTime) => {
    return new Date() > new Date(endTime * 1000);
  };

  const handleOpenSellDialog = (car) => {
    setSelectedCar(car);
    setOpenDialog(true);
  };

  const handleCloseSellDialog = () => {
    setOpenDialog(false);
    setPrice("");
    setSelectedCar(null);
  };

  const handleOpenUpdateDialog = (car) => {
    setSelectedCar(car);
    setOpenUpdateDialog(true);
  };

  const handleCloseUpdateDialog = () => {
    setOpenUpdateDialog(false);
    setPrice("");
    setSelectedCar(null);
  };

  const handleOpenDeleteDialog = (car) => {
    setSelectedCar(car);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setSelectedCar(null);
  };

  const handleOpenAuctionDialog = (car) => {
    console.log("Auctioning car: ", car);
    setSelectedCar(car);
    setOpenAuctionDialog(true);
  };

  const handleCloseAuctionDialog = () => {
    setOpenAuctionDialog(false);
    setSelectedCar(null);
  };

  const handleAuction = async () => {
    if (selectedCar && price && duration) {
      console.log(
        `Auctioning car ${selectedCar.tokenId} for sale at price ${price} WEI`
      );
      // Call the startAuction function from the CarService
      try {
        await startAuction(
          selectedCar.tokenId,
          price,
          duration,
          carMarketplaceContract
        );
        console.log(
          `Car ${selectedCar.tokenId} auctioned for sale at price ${price} WEI`
        );
        setUpdateTrigger(!updateTrigger);
      } catch (error) {
        console.error("Failed to auction car:", error);
        setOpenAuctionDialog(false);
      }
    }
    handleCloseAuctionDialog();
  };

  const handleStopAuction = async (car) => {
    if (car) {
      console.log(`Stopping auction for car: ${car.tokenId}`);
      try {
        await endAuction(car.tokenId, carMarketplaceContract);
        console.log(`Auction stopped for car with token ID ${car.tokenId}.`);
        toast.info(`Auction stopped for car with token ID ${car.tokenId}.`);

        setUpdateTrigger(!updateTrigger);
      } catch (error) {
        console.error("Failed to stop auction:", error);
      }
    }

  };

  const handleSell = async () => {
    if (selectedCar && price && gasLimit) {
      console.log(
        `Listing car ${selectedCar.tokenId} for sale at price ${price} WEI`
      );
      // Call the listCarForSale function from the CarService
      try {
        await listCar(selectedCar.tokenId, price, carMarketplaceContract, gasLimit);
        console.log(
          `Car ${selectedCar.tokenId} listed for sale at price ${price} WEI`
        );
        setUpdateTrigger(!updateTrigger);
      } catch (error) {
        console.error("Failed to list car for sale:", error);
        setOpenDialog(false);
      }
    }
    handleCloseSellDialog();
  };

  const handleUpdate = async (car) => {
    if (selectedCar && price && gasLimit) {
      console.log(
        `Updating listing for car ${selectedCar.tokenId} to price ${price} WEI`
      );
      // Call the updateCarPrice function from the CarService
      try {
        await updateCarPrice(
          selectedCar.tokenId,
          price,
          carMarketplaceContract,
          gasLimit
        );
        console.log(
          `Listing for car ${selectedCar.tokenId} updated to price ${price} WEI`
        );
        setUpdateTrigger(!updateTrigger);
      } catch (error) {
        console.error("Failed to update listing:", error);
        setOpenUpdateDialog(false);
      }
    }
    handleCloseUpdateDialog();
  };

  const handleCancel = async (car) => {
    // Call the unlistCar function from the CarService
    if (selectedCar) {
      try {
        await unlistCar(selectedCar.tokenId, carMarketplaceContract);
        console.log(`Listing for car ${car.tokenId} cancelled`);
        setUpdateTrigger(!updateTrigger);
      } catch (error) {
        console.error("Failed to cancel listing:", error);
      }
    }
    handleCloseDeleteDialog();
  };

  if (!address)
    return (
      <Typography variant="h6" style={{ textAlign: "center", marginTop: 20 }}>
        Please connect your wallet
      </Typography>
    );

  const loading = carsLoading || detailsLoading;
  const error = carsError || detailsError;

  return (
    <Paper
      elevation={3}
      style={{
        padding: 20,
        margin: "20px",
        maxWidth: "800px",
        marginLeft: "auto",
        marginRight: "auto",
      }}
    >
      <Typography variant="h4" gutterBottom>
        My Cars
      </Typography>
      <Box
        display="flex"
        justifyContent="space-between"
        sx={{ marginBottom: 2 }}
      >
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate("/")}
        >
          View Marketplace
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate("/auctions")}
        >
          View Auctions
        </Button>
        <Button
          variant="contained"
          color="inherit"
          onClick={() => navigate("/upload-car")}
        >
          Upload New Car
        </Button>
      </Box>
      <Typography variant="subtitle1">Address: {address}</Typography>
      <Typography variant="subtitle1">
        Balance: {balance} ETH
      </Typography>
      {loading ? (
        <CircularProgress />
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <List>
          {carDetails.map((car) => (
            <ListItem key={car.tokenId} divider>
              <Card style={{ width: "100%" }}>
                <CardMedia
                  component="img"
                  height="140"
                  image={car.image || "https://via.placeholder.com/140"}
                  alt={`Image of ${car.name}`}
                />
                <CardContent>
                  <Typography gutterBottom variant="h5" component="div">
                    {car.name || "Unknown Car"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {car.description || "No description available."}
                  </Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: "center" }}>
                  {!car.isListed && !car.isInAuction ? (
                    <>
                      <Button
                        size="large"
                        variant="contained"
                        color="primary"
                        onClick={() => handleOpenSellDialog(car)}
                      >
                        Sell
                      </Button>
                      <Button
                        size="large"
                        variant="contained"
                        color="primary"
                        onClick={() => handleOpenAuctionDialog(car)}
                      >
                        Auction
                      </Button>
                    </>
                  ) : null}

                  {car.isListed ? (
                    <>
                      <Button
                        size="large"
                        variant="contained"
                        color="primary"
                        onClick={() => handleOpenUpdateDialog(car)}
                      >
                        Update Listing
                      </Button>
                      <Button
                        size="large"
                        variant="outlined"
                        color="secondary"
                        onClick={() => handleOpenDeleteDialog(car)}
                      >
                        Cancel Listing
                      </Button>
                    </>
                  ) : null}

                  {car.isInAuction ? (
                    <Button
                      size="large"
                      variant={
                        isAuctionPast(car.auction.auctionEndTime)
                          ? "outlined"
                          : "contained"
                      }
                      color={
                        isAuctionPast(car.auction.auctionEndTime)
                          ? "secondary"
                          : "primary"
                      }
                      onClick={() =>
                        isAuctionPast(car.auction.auctionEndTime)
                          ? handleStopAuction(car)
                          : console.log("Auction active for", car.name)
                      }
                    >
                      {isAuctionPast(car.auction.auctionEndTime)
                        ? `Auction Passed - Stop`
                        : `Auction Ends: ${convertEpochToDate(
                            car.auction.auctionEndTime
                          )}`}
                    </Button>
                  ) : null}
                </CardActions>
              </Card>
            </ListItem>
          ))}
        </List>
      )}
      <SellCarDialog
        open={openDialog}
        handleClose={handleCloseSellDialog}
        handleSubmit={handleSell}
        price={price}
        setPrice={setPrice}
        gasLimit={gasLimit}
        setGasLimit={setGasLimit}
        tokenId={selectedCar?.tokenId}
      />
      <UpdateCarDialog
        open={openUpdateDialog}
        handleClose={handleCloseUpdateDialog}
        handleUpdate={handleUpdate}
        price={price}
        setPrice={setPrice}
        gasLimit={gasLimit}
        setGasLimit={setGasLimit}
        tokenId={selectedCar?.tokenId}
      />

      <DeleteCarDialog
        open={openDeleteDialog}
        handleClose={handleCloseDeleteDialog}
        handleDelete={handleCancel}
        tokenId={selectedCar?.tokenId}
      />

      <AuctionCarDialog
        open={openAuctionDialog}
        handleClose={handleCloseAuctionDialog}
        handleSubmit={handleAuction}
        price={price}
        setPrice={setPrice}
        duration={duration}
        setDuration={setDuration}
        tokenId={selectedCar?.tokenId}
      />
    </Paper>
  );
};

export default MyCars;
