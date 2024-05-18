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

  let listings,
    activeAuctions,
    auctionDetails,
    inAuction,
    endAuctionTx,
    tokenId,
    bidAmount,
    bidTx;

  tokenId = 3;

  // get auction details
  console.log(`Getting auction details for token ${tokenId}...`);
  auctionDetails = await carMarketplace.getAuctionDetails(tokenId);
  console.log(auctionDetails);

  // call getActiveAuctions
  console.log("Getting active auctions...");
  activeAuctions = await carMarketplace.getActiveAuctions();
  console.log(activeAuctions);

  // call isTokenInAuction for token 3
  console.log(`Checking if token ${tokenId} is in auction...`);
  inAuction = await carMarketplace.isTokenInAuction(tokenId);
  console.log(inAuction);

  // user3 ends auction for token 3
  console.log(`Ending auction for token ${tokenId}...`);
  endAuctionTx = await carMarketplace.connect(user3).endAuction(tokenId);
  await endAuctionTx.wait();
  console.log(`Auction for token ${tokenId} ended successfully!`);

  // call isTokenInAuction for token 3
  console.log(`Checking if token ${tokenId} is in auction...`);
  inAuction = await carMarketplace.isTokenInAuction(tokenId);
  console.log(inAuction);

  // call getActiveAuctions
  console.log("Getting active auctions...");
  activeAuctions = await carMarketplace.getActiveAuctions();
  console.log(activeAuctions);
}

interact()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
