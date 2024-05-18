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
    tokenId,
    bidAmount,
    bidTx,
    unlistTx,
    startAuctionTx,
    startingPrice,
    duration,
    balance,
    balance1,
    balance2,
    balance3,
    balance4,
    estimatedGas;


  tokenId = 3;

  // // unlist car with token 3
  // console.log(`Unlisting token ${tokenId}...`);
  // unlistTx = await carMarketplace.connect(user3).unlistCar(tokenId);
  // await unlistTx.wait();

  // call getListedCars
  console.log("Getting available listings...");
  listings = await carMarketplace.getListedCars();
  console.log(listings);

  // call getActiveAuctions
  console.log("Getting active auctions...");
  activeAuctions = await carMarketplace.getActiveAuctions();
  console.log(activeAuctions);

  // user3 starts an auction for token 3
  startingPrice = 1000000000000;
  duration = 10;
  console.log(
    `Starting an auction for token ${tokenId} with starting price ${startingPrice} wei and duration ${duration} seconds...`
  );
  startAuctionTx = await carMarketplace.connect(user3).startAuction(tokenId, startingPrice, duration);
  await startAuctionTx.wait();
  console.log(`Auction for token ${tokenId} started successfully!`);

  // call getActiveAuctions
  console.log("Getting active auctions...");
  activeAuctions = await carMarketplace.getActiveAuctions();
  console.log(activeAuctions);

  // get auction details
  console.log(`Getting auction details for token ${tokenId}...`);
  auctionDetails = await carMarketplace.getAuctionDetails(tokenId);
  console.log(auctionDetails);

  // // user1 bids on auction for token 3
  // // this should fail bid amount < starting price
  // try {
  //   bidAmount = 5000000000;
  //   console.log(
  //     `User1 bidding ${bidAmount} wei on auction for token ${tokenId}...`
  //   );
  //   bidTx = await carMarketplace
  //     .connect(user1)
  //     .placeBid(tokenId, { value: bidAmount });
  //   await bidTx.wait();
  //   console.log(`Bid placed successfully!`);
  // } catch (error) {
  //   console.log(`User1 could not place bid: ${error.message}`);
  // }

  // user2 bids on auction for token 3
  bidAmount = 8000000000000;
  balance2 = await ethers.provider.getBalance(user2.address);

  console.log(`User2 bidding ${bidAmount} wei on auction for token ${tokenId}...`);
  estimatedGas = await carMarketplace.estimateGas.placeBid(tokenId, { value: bidAmount });
  bidTx = await carMarketplace.connect(user2).placeBid(tokenId, { value: bidAmount });
  await bidTx.wait();
  console.log(`Bid placed successfully!`);
  balance = await ethers.provider.getBalance(user2.address);
  console.log(`User2 paid ${estimatedGas} gas and ${bidAmount} wei which is ${balance2.sub(balance)} wei`);


  // get auction details
  console.log(`Getting auction details for token ${tokenId}...`);
  auctionDetails = await carMarketplace.getAuctionDetails(tokenId);
  console.log(auctionDetails);

  // // user4 bids on auction for token 3
  // // this should fail bid amount < current highest bid
  // try {
  //   bidAmount = 7000000000;
  //   console.log(
  //     `User4 bidding ${bidAmount} wei on auction for token ${tokenId}...`
  //   );
  //   bidTx = await carMarketplace
  //     .connect(user4)
  //     .placeBid(tokenId, { value: bidAmount });
  //   await bidTx.wait();
  //   console.log(`Bid placed successfully!`);
  // } catch (error) {
  //   console.log(`User4 could not place bid: ${error.message}`);
  // }

  //   user1 bids on auction for token 3
  bidAmount = 9000000000000;
  balance1 = await ethers.provider.getBalance(user1.address);
  balance2 = await ethers.provider.getBalance(user2.address);
  console.log(`User1 bidding ${bidAmount} wei on auction for token ${tokenId}...`);
  estimatedGas = await carMarketplace.estimateGas.placeBid(tokenId, { value: bidAmount });
  bidTx = await carMarketplace.connect(user1).placeBid(tokenId, { value: bidAmount });
  await bidTx.wait();
  console.log(`Bid placed successfully!`);
  balance = await ethers.provider.getBalance(user1.address);
  console.log(`User1 paid ${estimatedGas} gas and ${bidAmount} wei which is ${balance1.sub(balance)} wei`);
  balance = await ethers.provider.getBalance(user2.address);
  console.log(`User2 refunded ${balance.sub(balance2)} wei`);

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
}

interact()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
