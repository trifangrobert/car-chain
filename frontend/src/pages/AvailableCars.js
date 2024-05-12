// components/AvailableCars.js
import React from "react";
import { useAvailableCars } from "../hooks/useAvailableCars";
import { useCarDetails } from "../hooks/useCarDetails";
import {
  Box,
  Typography,
  List,
  ListItem,
  Card,
  CardMedia,
  CardContent,
  Button,
} from "@mui/material";
import Loading from "../components/Loading";
import { useUser } from "../contexts/UserContext";
import { useNavigate } from "react-router-dom";
import BuyCarDialog from "../components/BuyCarDialog";
import { useState, useEffect } from "react";
import { buyCar } from "../services/CarService";
import { carMarketplaceContract } from "../ethersConnect";
import { toast } from "react-toastify";

function AvailableCars() {
  const { address, signer } = useUser();
  const [updateTrigger, setUpdateTrigger] = useState(false);
  const { cars, loading, error } = useAvailableCars(address, updateTrigger);
  const {
    carDetails,
    loading: detailsLoading,
    error: detailsError,
  } = useCarDetails(cars, updateTrigger);

  const navigate = useNavigate();

  const [buyDialogOpen, setBuyDialogOpen] = useState(false);
  const [selectedCar, setSelectedCar] = useState(null);

  useEffect(() => {
    if (!carMarketplaceContract) return;

    const onCarListed = (tokenId, seller, buyer, price) => {
      toast.success(
        `CarSold event: tokenId=${tokenId}, seller=${seller}, buyer=${buyer}, price=${price}`
      );
    };

    carMarketplaceContract.on("CarSold", onCarListed);

    // Cleanup the listener when the component unmounts or dependencies change
    return () => {
      carMarketplaceContract.off("CarListed", onCarListed);
    };
  }, [carMarketplaceContract]);

  //   console.log("address:", address);
  //   console.log("signer:", signer);

  const isLoading = loading || detailsLoading;
  const hasError = error || detailsError;
  // console.log("isLoading:", isLoading);
  // console.log("loading:", loading);

  const handleOpenBuyDialog = (car) => {
    setSelectedCar(car);
    setBuyDialogOpen(true);
  };

  const handleCloseBuyDialog = () => {
    setBuyDialogOpen(false);
  };

  const handleBuy = async (car) => {
    if (selectedCar) {
      console.log("Buying car: ", car);
      try {
        await buyCar(car.tokenId, car.price, carMarketplaceContract);
        console.log("Car bought successfully");
        setBuyDialogOpen(false);
        setUpdateTrigger(!updateTrigger);
      } catch (error) {
        console.error("Failed to buy car: ", error);
      }
    }
    handleCloseBuyDialog();
  };

  if (isLoading) return <Loading />;
  if (hasError) {
    return (
      <Typography variant="h6" color="error" style={{ textAlign: "center" }}>
        Error: {hasError}
      </Typography>
    );
  }

  return (
    <>
      <div style={{ padding: 20 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 2,
          }}
        >
          <Typography variant="h4" gutterBottom>
            Available Cars
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              navigate("/my-cars");
              // window.location.reload(); // this is a workaround to refresh the page BUT it's not safe
            }}
          >
            View My Cars
          </Button>
        </Box>
        <List>
          {carDetails.map((car) => (
            <ListItem key={car.tokenId} divider>
              <Card
                style={{
                  width: "100%",
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <CardMedia
                  component="img"
                  style={{ width: 150, height: 100, objectFit: "cover" }}
                  image={car.image || "https://via.placeholder.com/150"}
                  alt={`Image of ${car.name}`}
                />
                <CardContent style={{ flex: "1 1 auto" }}>
                  <Typography variant="h6" component="h2">
                    {car.name || "Unknown Car"}
                  </Typography>
                  <Typography variant="subtitle1" color="textSecondary">
                    Price:{" "}
                    {car.price ? `${car.price} WEI` : "Price not available"}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    style={{ marginTop: "8px" }}
                  >
                    Description:{" "}
                    {car.description || "No description available."}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    style={{ marginTop: "8px" }}
                  >
                    Owner: {car.owner}
                  </Typography>
                  <Typography
                    variant="caption"
                    display="block"
                    style={{ marginTop: "4px" }}
                  >
                    Token ID: {car.tokenId}
                  </Typography>
                  {address === car.owner ? (
                    <Typography
                      variant="body2"
                      style={{ color: "green", marginTop: 8 }}
                    >
                      You own this
                    </Typography>
                  ) : (
                    <Button
                      variant="contained"
                      sx={{
                        backgroundColor: "#4CAF50",
                        color: "white",
                        marginTop: 2,
                      }}
                      onClick={() => handleOpenBuyDialog(car)}
                    >
                      Buy
                    </Button>
                  )}
                </CardContent>
              </Card>
            </ListItem>
          ))}
        </List>
      </div>
      <BuyCarDialog
        open={buyDialogOpen}
        handleClose={handleCloseBuyDialog}
        handleBuy={handleBuy}
        car={selectedCar}
      />
    </>
  );
}

export default AvailableCars;
