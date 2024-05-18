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
import { estimateGasForPlacingBid } from "../services/CarService";
import { useContracts } from "../hooks/useContracts";

const PlaceBidDialog = ({
  open,
  handleClose,
  handleBid,
  minimumBid,
  setBidAmount,
  bidAmount,
  tokenId
}) => {
    const { carMarketplaceContract } = useContracts();
  const [estimatedGas, setEstimatedGas] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setEstimatedGas("");
    setBidAmount("");
    setLoading(false);
  }, [open]);

  const handleEstimateGas = async () => {
    if (!bidAmount) {
      alert("Please enter a bid to estimate gas costs.");
      return;
    }
    try {
      setLoading(true);
      const gas = await estimateGasForPlacingBid(tokenId, bidAmount, carMarketplaceContract);
      setEstimatedGas(gas);
      setLoading(false);
    } catch (error) {
      setEstimatedGas("Failed to estimate gas");
      setLoading(false);
    }
  };

  const handlePlaceBidClick = () => {
    if (bidAmount < minimumBid) {
        alert(`Bid amount must be at least ${minimumBid} WEI`);
        return;
        }
    setLoading(true);
    handleBid(bidAmount);
  };

  const handleCloseDialog = () => {
    setLoading(false);
    handleClose();
  };

  return (
    <Dialog open={open} onClose={handleCloseDialog}>
      <DialogTitle>Place a Bid</DialogTitle>
      <DialogContent
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "200px",
          width: "300px",
        }}
      >
        {loading ? (
          <CircularProgress />
        ) : (
          <>
            <div style={{ width: "100%" }}>
              <Typography style={{ marginBottom: 16 }}>
                Minimum Bid: {minimumBid} WEI
              </Typography>
              <TextField
                autoFocus
                margin="dense"
                id="bid"
                label="Bid in WEI"
                type="number"
                fullWidth
                variant="outlined"
                value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value)}
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
        <Button
          onClick={handlePlaceBidClick}
          disabled={
            loading
          }
        >
          Place Bid
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PlaceBidDialog;
