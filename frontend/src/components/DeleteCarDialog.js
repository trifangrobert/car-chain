import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  CircularProgress,
} from "@mui/material";
import { useContracts } from "../hooks/useContracts";
import { estimateGasForUnlisting } from "../services/CarService";

const DeleteCarDialog = ({ open, handleClose, handleDelete, tokenId }) => {
  const { carMarketplaceContract } = useContracts();
  const [loading, setLoading] = useState(false);
  const [estimatedGas, setEstimatedGas] = useState("");

  useEffect(() => {
    setEstimatedGas("");
    setLoading(false);
  }, [open]);

  useEffect(() => {
    const handleEstimateGas = async () => {
      try {
        if (tokenId) {
          setLoading(true);
          console.log("tokenId from DeleteCarDialog:", tokenId);
          const gas = await estimateGasForUnlisting(
            tokenId,
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

    if (tokenId && open) {
      handleEstimateGas();
    }
  }, [tokenId, open]);

  const handleDeleteClick = () => {
    setLoading(true);
    handleDelete(tokenId);
  };

  const handleCloseDialog = () => {
    setLoading(false);
    handleClose();
  }
  
  return (
    <Dialog open={open} onClose={handleCloseDialog}>
      <DialogTitle>Cancel Listing</DialogTitle>
      <DialogContent
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "200px",
        }}
      >
        {loading ? (
          <CircularProgress />
        ) : (
          <>
            <div style={{ width: "100%" }}>
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
        <Button onClick={handleDeleteClick} disabled={loading}>
          Cancel Listing
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteCarDialog;
