const express = require('express');
const cors = require('cors');
const fs = require('fs');
const filePath = './cars.json';

const app = express();
app.use(cors());
app.use(express.json()); // Middleware to parse JSON bodies

const port = 3001;

// Load existing cars from the file
function loadData() {
    try {
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error("Error reading from file, starting with empty data.");
        return {};
    }
}

// Save updated cars data to the file
function saveData(data) {
    try {
        const jsonData = JSON.stringify(data, null, 2);
        fs.writeFileSync(filePath, jsonData, 'utf8');
    } catch (err) {
        console.error("Error writing to file.");
    }
}

const cars = loadData();  // Initialize cars with data loaded from file

app.get('/token/:id', (req, res) => {
    const tokenId = req.params.id;
    console.log('Getting token with ID:', tokenId);
    if (cars[tokenId]) {
        res.json(cars[tokenId]);
    } else {
        res.status(404).send('Token not found');
    }
});

app.post('/token/new/:id', (req, res) => {
    const newTokenId = req.params.id;
    console.log('Creating token with ID:', newTokenId);
    cars[newTokenId] = {
        name: req.body.name,
        image: req.body.image,
        description: req.body.description
    };
    saveData(cars); // Save updated data to file
    res.json(cars[newTokenId]);
});

app.delete('/token/:id', (req, res) => {
    const tokenId = req.params.id;
    console.log('Deleting token with ID:', tokenId);
    if (cars[tokenId]) {
        delete cars[tokenId];
        saveData(cars); 
        res.send('Token deleted');
    } else {
        res.status(404).send('Token not found');
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
