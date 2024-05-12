// components/MyCars.js
import React from "react";
import { useState } from "react";
import { useUser } from "../contexts/UserContext";
import { useMyCars } from "../hooks/useMyCars";
import { useCarDetails } from "../hooks/useCarDetails";
import {
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
  listCarForSale,
  cancelListing,
  updateCarPrice,
} from "../services/CarService";
import { useContracts } from "../hooks/useContracts";
import { useNavigate } from "react-router-dom";
import Loading from "../components/Loading";
import SellCarDialog from "../components/SellCarDialog";
import UpdateCarDialog from "../components/UpdateCarDialog";
import DeleteCarDialog from "../components/DeleteCarDialog";

const MyCars = () => {
  const [updateTrigger, setUpdateTrigger] = useState(false);

  const user = useUser();
  const { address, signer, provider } = user;
  //   console.log("user:", user);
  //   console.log("address:", address);
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
  } = useCarDetails(cars);
  const [openDialog, setOpenDialog] = useState(false);
  const [openUpdateDialog, setOpenUpdateDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  const [selectedCar, setSelectedCar] = useState(null);
  const [price, setPrice] = useState("");
  const { carMarketplaceContract } = useContracts();
  const navigate = useNavigate();

  // check if carMarketplaceContract is available
  if (!carMarketplaceContract) {
    return <Loading />;
  }

  const handleOpenSellDialog = (car) => {
    setSelectedCar(car);
    setOpenDialog(true);
  };

  const handleCloseSellDialog = () => {
    setOpenDialog(false);
    setPrice("");
  };

  const handleOpenUpdateDialog = (car) => {
    setSelectedCar(car);
    setOpenUpdateDialog(true);
  };

  const handleCloseUpdateDialog = () => {
    setOpenUpdateDialog(false);
    setPrice("");
  };

  const handleOpenDeleteDialog = (car) => {
    setSelectedCar(car);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
  };

  const handleSell = async () => {
    if (selectedCar && price) {
      console.log(
        `Listing car ${selectedCar.tokenId} for sale at price ${price} WEI`
      );
      // Call the listCarForSale function from the CarService
      try {
        await listCarForSale(
          selectedCar.tokenId,
          price,
          carMarketplaceContract
        );
        console.log(
          `Car ${selectedCar.tokenId} listed for sale at price ${price} WEI`
        );
        setUpdateTrigger(!updateTrigger);
        setOpenDialog(false);
      } catch (error) {
        console.error("Failed to list car for sale:", error);
        setOpenDialog(false);
      }
    }
    handleCloseSellDialog();
  };

  const handleUpdate = async (car) => {
    if (selectedCar && price) {
      console.log(
        `Updating listing for car ${selectedCar.tokenId} to price ${price} WEI`
      );
      // Call the updateCarPrice function from the CarService
      try {
        await updateCarPrice(
          selectedCar.tokenId,
          price,
          carMarketplaceContract
        );
        console.log(
          `Listing for car ${selectedCar.tokenId} updated to price ${price} WEI`
        );
        setUpdateTrigger(!updateTrigger);
        setOpenUpdateDialog(false);
      } catch (error) {
        console.error("Failed to update listing:", error);
        setOpenUpdateDialog(false);
      }
    }
  };

  const handleCancel = async (car) => {
    // Call the cancelListing function from the CarService
    if (selectedCar) {
      try {
        await cancelListing(selectedCar.tokenId, carMarketplaceContract);
        console.log(`Listing for car ${car.tokenId} cancelled`);
        setUpdateTrigger(!updateTrigger);
        setOpenDeleteDialog(false);
      } catch (error) {
        console.error("Failed to cancel listing:", error);
      }
    }
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
      <Button
        variant="contained"
        color="primary"
        onClick={() => navigate("/")}
        sx={{ marginBottom: 2 }}
      >
        View Marketplace
      </Button>
      <Typography variant="subtitle1">Address: {address}</Typography>
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
                  {!car.isActive ? (
                    <Button
                      size="large"
                      variant="contained"
                      color="primary"
                      onClick={() => handleOpenSellDialog(car)}
                    >
                      Sell
                    </Button>
                  ) : (
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
                  )}
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
        tokenId={selectedCar?.tokenId}
      />
      <UpdateCarDialog
        open={openUpdateDialog}
        handleClose={handleCloseUpdateDialog}
        handleUpdate={handleUpdate}
        price={price}
        setPrice={setPrice}
        tokenId={selectedCar?.tokenId}
      />

      <DeleteCarDialog
        open={openDeleteDialog}
        handleClose={handleCloseDeleteDialog}
        handleDelete={handleCancel}
        tokenId={selectedCar?.tokenId}
      />
    </Paper>
  );
};

export default MyCars;
