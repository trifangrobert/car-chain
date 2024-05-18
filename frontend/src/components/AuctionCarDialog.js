import React, { useEffect, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, TextField, DialogActions, Button, Typography, CircularProgress } from '@mui/material';
import { estimateGasForAuctionStart } from '../services/CarService'; 
import { useContracts } from '../hooks/useContracts';

const SellCarDialog = ({ open, handleClose, handleSubmit, price, setPrice, duration, setDuration, tokenId }) => {
    const { carMarketplaceContract } = useContracts();
    const [estimatedGas, setEstimatedGas] = useState('');
    const [loading, setLoading] = useState(false);  

    useEffect(() => {
        setEstimatedGas('');
        setPrice('');
        setDuration('');
        setLoading(false);  
    }, [open]);

    const handleEstimateGas = async () => {
        if (!price) {
            alert('Please enter a price to estimate gas costs.');
            return;
        }
        try {
            if (tokenId) {
                setLoading(true);  
                const gas = await estimateGasForAuctionStart(tokenId, price, duration, carMarketplaceContract);
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

    const handleSellClick = () => {
        setLoading(true);  
        handleSubmit(price);
    };

    const handleCloseDialog = () => {
        setLoading(false);  
        handleClose();
    }

    return (
        <Dialog open={open} onClose={handleCloseDialog}>
            <DialogTitle>Auction</DialogTitle>

            <DialogContent style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '250px', width: '350px'}}>
                {loading ? (
                    <CircularProgress />
                ) : (
                    <>
                        <div style={{ width: '100%' }}>
                        <TextField
                            autoFocus
                            margin="dense"
                            id="price"
                            label="Starting price in WEI"
                            type="number"
                            fullWidth
                            variant="outlined"
                            value={price}
                            onChange={e => setPrice(e.target.value)}
                        />
                        <TextField
                            margin="dense"
                            id="duration"
                            label="Duration in seconds"
                            type="number"
                            fullWidth
                            variant="outlined"
                            value={duration}
                            onChange={e => setDuration(e.target.value)}
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
                <Button onClick={handleSellClick} disabled={loading}>Start Auction</Button>
            </DialogActions>
        </Dialog>
    );
};

export default SellCarDialog;
