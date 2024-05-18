import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Button,
  Typography,
  CircularProgress,
} from "@mui/material";
import { estimateGasForListing } from "../services/CarService";
import { useContracts } from "../hooks/useContracts";

const SellCarDialog = ({
  open,
  handleClose,
  handleSubmit,
  price,
  setPrice,
  gasLimit,
  setGasLimit,
  tokenId,
}) => {
  const { carMarketplaceContract } = useContracts();
  const [estimatedGas, setEstimatedGas] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setEstimatedGas("");
    setGasLimit("");
    setPrice("");
    setLoading(false);
  }, [open]);

  const handleEstimateGas = async () => {
    if (!price) {
      alert("Please enter a price to estimate gas costs.");
      return;
    }
    try {
      if (tokenId) {
        setLoading(true);
        // console.log("tokenId from SellCarDialog:", tokenId)
        // console.log("price from SellCarDialog:", price)
        // console.log("carMarketplaceContract from SellCarDialog:", carMarketplaceContract)
        const gas = await estimateGasForListing(
          tokenId,
          price,
          carMarketplaceContract
        );
        setEstimatedGas(gas);
        setLoading(false);
      } else {
        alert("Token ID not found");
      }
    } catch (error) {
      setEstimatedGas("Failed to estimate gas");
      setLoading(false);
    }
  };

  const handleSellClick = () => {
    if (!estimatedGas) {
        alert("Please estimate gas cost first");
        return;
    }
    if (parseInt(estimatedGas) > parseInt(gasLimit)) {
        alert("Gas limit is too low");
        return;
    }
    setLoading(true);
    handleSubmit(price, gasLimit);
  };

  const handleCloseDialog = () => {
    setLoading(false);
    handleClose();
  };

  return (
    <Dialog open={open} onClose={handleCloseDialog}>
      <DialogTitle>Sell Your Car</DialogTitle>

      <DialogContent
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "250px",
        }}
      >
        {loading ? (
          <CircularProgress />
        ) : (
          <>
            <div style={{ width: "100%" }}>
              <TextField
                autoFocus
                margin="dense"
                id="price"
                label="Price in WEI"
                type="number"
                fullWidth
                variant="outlined"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
              <TextField
                margin="dense"
                id="gasLimit"
                label="Gas Limit"
                type="number"
                fullWidth
                variant="outlined"
                value={gasLimit}
                onChange={(e) => setGasLimit(e.target.value)}
                style={{ marginTop: 16 }}
              />

              <Button onClick={handleEstimateGas} style={{ marginTop: 16 }}>
                Estimate Gas
              </Button>
              {estimatedGas && (
                <Typography style={{ marginTop: 16 }}>
                  Estimated Gas Cost: {estimatedGas} WEI
                </Typography>
              )}
            </div>
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCloseDialog}>Cancel</Button>
        <Button onClick={handleSellClick} disabled={loading}>
          List Car for Sale
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SellCarDialog;
