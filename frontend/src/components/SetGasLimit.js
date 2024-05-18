import React, { useState } from 'react';
import { useUser } from '../contexts/UserContext';
import { Box, TextField, Button, Grid } from '@mui/material';

const SetGasLimit = () => {
    const { gasLimit, setGasLimit } = useUser();
    const [inputValue, setInputValue] = useState(gasLimit);

    const handleChange = (e) => {
        setInputValue(e.target.value);
    };

    const handleSubmit = () => {
        const parsedValue = parseInt(inputValue, 10);
        if (!isNaN(parsedValue) && parsedValue > 0) {
            setGasLimit(parsedValue);
        } else {
            alert('Please enter a valid gas limit.');
        }
    };

    return (
        <Box display="flex" justifyContent="flex-end" mt={2}>
            <Box mr={1}>
                <TextField
                    label="Gas Limit"
                    variant="outlined"
                    value={inputValue}
                    onChange={handleChange}
                    type="number"
                    size="small"
                    style={{ width: '150px' }}
                />
            </Box>
            <Button
                variant="contained"
                color="primary"
                onClick={handleSubmit}
                size="small"
                style={{ height: '40px' }}
            >
                Set
            </Button>
        </Box>
    );
};

export default SetGasLimit;
