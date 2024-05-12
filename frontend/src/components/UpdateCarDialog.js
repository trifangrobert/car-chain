import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, TextField, DialogActions, Button, Typography, CircularProgress } from '@mui/material';
import { useContracts } from '../hooks/useContracts';
import { estimateGasForUpdating } from '../services/CarService';

const UpdatePriceDialog = ({ open, handleClose, handleUpdate, price, setPrice, tokenId }) => {
    const { carMarketplaceContract } = useContracts();
    const [loading, setLoading] = useState(false);
    const [estimatedGas, setEstimatedGas] = useState('');

    const handleEstimateGas = async () => {
        if (!price) {
            alert('Please enter a new price to estimate gas costs.');
            return;
        }
        try {
            if (tokenId) {
                setLoading(true);  
                const gas = await estimateGasForUpdating(tokenId, price, carMarketplaceContract);
                setEstimatedGas(gas);
                setLoading(false); 
            }
            else {
                alert('Token ID not found');
            }
        } catch (error) {
            setEstimatedGas('Failed to estimate gas');
            setLoading(false); 
        }
    };

    const handleUpdateClick = () => {
        setLoading(true);
        handleUpdate(tokenId, price);
    };

    return (
        <Dialog open={open} onClose={handleClose}>
            <DialogTitle>Update Car Price</DialogTitle>
            <DialogContent style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
                {loading ? (
                    <CircularProgress />
                ) : (
                    <>
                        <div style={{ width: '100%' }}>
                        <TextField
                            autoFocus
                            margin="dense"
                            id="newPrice"
                            label="New Price in WEI"
                            type="number"
                            fullWidth
                            variant="outlined"
                            value={price}
                            onChange={e => setPrice(e.target.value)}
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
                <Button onClick={handleClose}>Cancel</Button>
                <Button onClick={handleUpdateClick} disabled={loading}>Update Price</Button>
            </DialogActions>
        </Dialog>
    );
};

export default UpdatePriceDialog;
