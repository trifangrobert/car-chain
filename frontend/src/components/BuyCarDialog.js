// BuyCarDialog.js
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";
import { estimateGasForBuying } from "../services/CarService";
import { useContracts } from "../hooks/useContracts";

const BuyCarDialog = ({signer, open, handleClose, handleBuy, car }) => {
  const { carMarketplaceContract } = useContracts(signer);
  const [loading, setLoading] = useState(false);
  const [estimatedGas, setEstimatedGas] = useState("");
  const [totalPrice, setTotalPrice] = useState("");

  useEffect(() => {
    setEstimatedGas("");
    setTotalPrice("");
    setLoading(false);
  }, [open]);

  useEffect(() => {
    const handleEstimateGas = async () => {
      try {
        if (car.tokenId) {
          setLoading(true);
          console.log("tokenId from BuyCarDialog:", car.tokenId);
          console.log("price from BuyCarDialog:", car.price);
          console.log(
            "carMarketplaceContract from BuyCarDialog:",
            carMarketplaceContract
          );

          const gas = await estimateGasForBuying(
            car.tokenId,
            car.price,
            carMarketplaceContract
          );
          console.log("gas from BuyCarDialog:", gas);
          setEstimatedGas(gas);
          setTotalPrice(parseInt(car.price) + parseInt(gas));
          setLoading(false);
        } else {
          alert("Token ID not found");
        }
      } catch (error) {
        setEstimatedGas("Failed to estimate gas");
        setLoading(false);
      }
    };

    if (car && open) {
      handleEstimateGas();
    }
  }, [car, open]);

  const handleBuyClick = () => {
    setLoading(true);
    handleBuy(car);
  };

  const handleCloseDialog = () => {
    setLoading(false);
    handleClose();
  };

  return (
    <Dialog open={open} onClose={handleCloseDialog}>
      <DialogTitle>Buy Car</DialogTitle>
      <DialogContent
        style={{
          display: "flex",
          flexDirection: "column", // Corrected property name
          justifyContent: "center", // This will center everything on the cross axis since flexDirection is column
          alignItems: "center",
          height: "125px",
          width: "250px",
        }}
      >
        {!loading ? ( // Check if it's not loading to display car details
          <>
            <Typography variant="subtitle1">Price: {car?.price} WEI</Typography>
            <Typography variant="subtitle1">
              Estimated Gas: {estimatedGas}
            </Typography>
            <Typography variant="h6">Total Price: {totalPrice}</Typography>
          </>
        ) : (
          <CircularProgress /> // This will be centered if it's the only content
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCloseDialog}>Cancel</Button>
        <Button onClick={handleBuyClick} disabled={loading}>
          Buy
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BuyCarDialog;
