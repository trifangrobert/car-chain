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
    price,
    listing,
    carsOwned,
    buyTx,
    tokenId,
    listTx,
    unlistTx,
    updatePriceTx;

  // list all cars for sale
  console.log("Listing all cars for sale...");
  for (let i = 1; i < 5; i++) {
    let tokenId = i;
    let price = i * 1000;
    let listTx = await carMarketplace.connect(users[i]).listCar(tokenId, price);
    await listTx.wait();
    console.log(`Token ${tokenId} listed for ${price} wei`);
  }

  // call getListedCars
  console.log("Getting available listings...");
  listings = await carMarketplace.getListedCars();
  console.log(listings);
}

interact()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
