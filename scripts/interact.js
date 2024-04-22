require("@nomiclabs/hardhat-ethers");
const { ethers } = require("hardhat");

async function interact() {
    const [owner, user1, user2, user3, user4] = await ethers.getSigners();
    console.log(`Owner address: ${owner.address}`);
    console.log(`User1 address: ${user1.address}`);
    console.log(`User2 address: ${user2.address}`);
    console.log(`User3 address: ${user3.address}`);
    console.log(`User4 address: ${user4.address}`);

    let users = [owner, user1, user2, user3, user4];


    const carTokenAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
    const CarToken = await ethers.getContractFactory("CarToken");
    const carToken = CarToken.attach(carTokenAddress);

    const carMarketplaceAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
    const CarMarketplace = await ethers.getContractFactory("CarMarketplace");
    const carMarketplace = CarMarketplace.attach(carMarketplaceAddress);

    // Minting a new token
    console.log("Minting new tokens...");
    for (let i = 1; i < 5; i++) {
        let tokenId = i;
        let uri = `http://localhost:3000/token/${tokenId}`;
        let mintTx = await carToken.connect(owner).safeMint(users[i].address, tokenId, uri);
        await mintTx.wait();
    }
    console.log("Tokens minted successfully!");

    // check token owner
    for (let i = 1; i < 5; i++) {
        console.log(`Checking token owner and URI for token ${i}...`);
        const tokenOwner = await carToken.ownerOf(i);
        console.log(tokenOwner);
        const tokenURI = await carToken.tokenURI(i);
        console.log(tokenURI);

        // set approval for marketplace
        console.log(`Approval set for token ${i} by ${users[i].address}.`)
        const approvalAllTx = await carToken.connect(users[i]).setApprovalForAll(carMarketplace.address, true);
        await approvalAllTx.wait();
    }
    
    // call getAvailableListings
    console.log("Getting available listings...");
    let listings = await carMarketplace.getAvailableListings();
    console.log(listings);

    // list cars for sale
    console.log("Listing some cars for sale...");

    for (let i = 1; i < 5; i++) {
        let tokenId = i;
        let price = i * 1000;
        console.log(`Listing token ${tokenId} for ${price} wei...`);
        let listTx = await carMarketplace.connect(users[i]).listCarForSale(tokenId, price);
        await listTx.wait();
    }
    console.log("Cars listed for sale successfully!");

    console.log("Getting available listings...");
    listings = await carMarketplace.getAvailableListings();
    console.log(listings);

    // check if token 2 is listed
    console.log("Checking if token 2 is listed...");
    let isListed = await carMarketplace.isTokenListed(2);
    console.log(isListed);
    
    // token 2 price
    const listing = await carMarketplace.listings(2);
    console.log(`The price of token 2 is: ${ethers.utils.formatEther(listing.price)} ETH`);

    // user1 buys car 2
    console.log("User1 buying car 2...");
    let buyTx = await carMarketplace.connect(user1).buyCar(2, {value: listing.price});
    await buyTx.wait();
    console.log("Car bought successfully!");

    // get cars owned by user1
    console.log("Getting cars owned by user1...");
    let carsOwned = await carMarketplace.getCarsOwnedBy(user1.address);
    console.log(carsOwned);

    // cancel listing for token 1
    console.log("Cancelling listing for token 1...");
    let cancelTx = await carMarketplace.connect(user1).cancelListing(1);
    await cancelTx.wait();

    // token 1 info
    const listingToken1 = await carMarketplace.listings(1);
    console.log(`Token 1 info: ${listingToken1}`);
    
    // get available listings
    console.log("Getting available listings...");
    let allListings = await carMarketplace.getAvailableListings();
    console.log(allListings);

}

interact().then(() => process.exit(0)).catch(error => {
    console.error(error);
    process.exit(1);
});