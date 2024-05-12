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

function AvailableCars() {
  const { cars, loading, error } = useAvailableCars();
  const {
    carDetails,
    loading: detailsLoading,
    error: detailsError,
  } = useCarDetails(cars);

  const navigate = useNavigate();

  const { address, signer } = useUser();
  //   console.log("address:", address);
  //   console.log("signer:", signer);

  const isLoading = loading || detailsLoading;
  const hasError = error || detailsError;
  console.log("isLoading:", isLoading);
  console.log("loading:", loading);

  if (isLoading) return <Loading />;
  if (hasError) {
    return (
      <Typography variant="h6" color="error" style={{ textAlign: "center" }}>
        Error: {hasError}
      </Typography>
    );
  }

  return (
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
          onClick={() => navigate("/my-cars")}
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
                  Description: {car.description || "No description available."}
                </Typography>
                <Typography
                  variant="caption"
                  display="block"
                  style={{ marginTop: "4px" }}
                >
                  Token ID: {car.tokenId}
                </Typography>
              </CardContent>
            </Card>
          </ListItem>
        ))}
      </List>
    </div>
  );
}

export default AvailableCars;
