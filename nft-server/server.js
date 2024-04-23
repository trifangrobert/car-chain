const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());  // Enable CORS to allow your NFT smart contract to access the JSON data

const port = 3001;

// Sample data
const cars = {
    1: {
        "name": "Lamborghini Urus",
        "image": "https://upload.wikimedia.org/wikipedia/commons/5/5c/Lamborghini_Urus_19.09.20_JM_(2)_(cropped).jpg",
        "description": "A high-performance SUV that combines the soul of a super sports car with the functionality of an SUV."
    },
    2: {
        "name": "Bugatti Veyron",
        "image": "https://en.wikipedia.org/wiki/Bugatti_Veyron#/media/File:Bugatti_Veyron_16.4_%E2%80%93_Frontansicht_(3),_5._April_2012,_D%C3%BCsseldorf.jpg",
        "description": "A mid-engine sports car, designed and developed in Germany by the Volkswagen Group and manufactured in Molsheim, France, by French automobile manufacturer Bugatti."
    },
    3: {
        "name": "Ferrari SF90 Stradale",
        "image": "https://en.wikipedia.org/wiki/Ferrari_SF90_Stradale#/media/File:Red_2019_Ferrari_SF90_Stradale_(48264238897)_(cropped).jpg",
        "description": "A mid-engine PHEV (Plug-in Hybrid Electric Vehicle) sports car produced by the Italian automobile manufacturer Ferrari."
    },
    4: {
        "name": "Porsche GT3 RS",
        "image": "https://en.wikipedia.org/wiki/Porsche_911_GT3#/media/File:Porsche_911_992_GT3.jpg",
        "description": "A high-performance variant of the Porsche 911 sports car primarily intended for racing."
    }
};

app.get('/token/:id', (req, res) => {
    const tokenId = req.params.id;
    if (cars[tokenId]) {
        res.json(cars[tokenId]);
    } else {
        res.status(404).send('Token not found');
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
