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
import { estimateGasForDeleting } from "../services/CarService";

const DeleteCarDialog = ({ open, handleClose, handleDelete, tokenId }) => {
  const { carMarketplaceContract } = useContracts();
  const [loading, setLoading] = useState(false);
  const [estimatedGas, setEstimatedGas] = useState("");

  useEffect(() => {
    const handleEstimateGas = async () => {
      try {
        if (tokenId) {
          setLoading(true);
          console.log("tokenId from DeleteCarDialog:", tokenId);
          const gas = await estimateGasForDeleting(
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

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Delete Car</DialogTitle>
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
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleDeleteClick} disabled={loading}>
          Delete Car
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteCarDialog;
