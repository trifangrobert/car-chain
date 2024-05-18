import React, { useState, useEffect } from "react";
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
import { useContracts } from "../hooks/useContracts";
import { estimateGasForUpdating } from "../services/CarService";

const UpdatePriceDialog = ({
  open,
  handleClose,
  handleUpdate,
  price,
  setPrice,
  gasLimit,
  setGasLimit,
  tokenId,
}) => {
  const { carMarketplaceContract } = useContracts();
  const [loading, setLoading] = useState(false);
  const [estimatedGas, setEstimatedGas] = useState("");

  useEffect(() => {
    setEstimatedGas("");
    setGasLimit("");
    setPrice("");
    setLoading(false);
  }, [open]);

  const handleEstimateGas = async () => {
    if (!price) {
      alert("Please enter a new price to estimate gas costs.");
      return;
    }
    try {
      if (tokenId) {
        setLoading(true);
        const gas = await estimateGasForUpdating(
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

  const handleUpdateClick = () => {
    if (!estimatedGas) {
      alert("Please estimate gas cost first");
      return;
    }
    if (parseInt(estimatedGas) > parseInt(gasLimit)) {
      alert("Gas limit is too low");
      return;
    }
    setLoading(true);
    handleUpdate(tokenId, price);
  };

  const handleCloseDialog = () => {
    setLoading(false);
    handleClose();
  };

  return (
    <Dialog open={open} onClose={handleCloseDialog}>
      <DialogTitle>Update Car Price</DialogTitle>
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
                id="newPrice"
                label="New Price in WEI"
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
        <Button onClick={handleUpdateClick} disabled={loading}>
          Update Price
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UpdatePriceDialog;
