import React, { useState, useEffect } from "react";
import {
  Button,
  TextField,
  Typography,
  Paper,
  Box,
  CircularProgress,
} from "@mui/material";
import { useContracts } from "../hooks/useContracts";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

export default function UploadCar() {
  const [carName, setCarName] = useState("");
  const [carImage, setCarImage] = useState("");
  const [carDescription, setCarDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { carMarketplaceContract, carTokenContract } = useContracts();
  const navigate = useNavigate();

  useEffect(() => {
    if (!carMarketplaceContract) return;

    const handleCarCreated = (tokenId, seller) => {
      console.log(`New car created with token ID ${tokenId} by ${seller}`);
      toast.success(`CarCreated event: New car created with token ID ${tokenId}`);
    };

    carMarketplaceContract.on("CarCreated", handleCarCreated);

    return () => {
      carMarketplaceContract.off("CarCreated", handleCarCreated);
    };
  }, [carMarketplaceContract]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);

    try {
      if (!carTokenContract) {
        return toast.error("CarToken contract is not loaded.");
      }
      const tx = await carTokenContract.getTotalTokens();
      const tokenId = (await parseInt(tx.toString())) + 1;
      console.log("New token ID:", tokenId);

      const response = await fetch(
        `http://localhost:3001/token/new/${tokenId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: carName,
            image: carImage,
            description: carDescription,
          }),
        }
      );

      const data = await response.json(); // Parse JSON data
      const uri = `http://localhost:3001/token/${tokenId}`;

      if (carMarketplaceContract) {
        const tx = await carMarketplaceContract.createCar(uri);
        await tx.wait();
        toast.success("Car successfully created and listed!");
        navigate("/my-cars");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to create the car.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Paper
      elevation={3}
      style={{ padding: 20, maxWidth: 500, margin: "20px auto" }}
    >
      <Typography variant="h4" gutterBottom>
        Create New Car NFT
      </Typography>
      <form onSubmit={handleSubmit}>
        <Box display="flex" flexDirection="column" gap={2}>
          <TextField
            label="Car Name"
            variant="outlined"
            value={carName}
            onChange={(e) => setCarName(e.target.value)}
            required
          />
          <TextField
            label="Car Image URL"
            variant="outlined"
            value={carImage}
            onChange={(e) => setCarImage(e.target.value)}
            required
          />
          <TextField
            label="Car Description"
            variant="outlined"
            multiline
            rows={4}
            value={carDescription}
            onChange={(e) => setCarDescription(e.target.value)}
            required
          />
          {isLoading ? (
            <Box display="flex" justifyContent="center" mt={2}>
              <CircularProgress />
            </Box>
          ) : (
            <Button type="submit" variant="contained" color="primary">
              Create Car
            </Button>
          )}
        </Box>
      </form>
    </Paper>
  );
}
