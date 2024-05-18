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

  // Ensure correct approval setup
  console.log("Setting up approvals...");
  for (let i = 1; i < 5; i++) {
    console.log(`Setting approval for user ${i}...`);
    let approveTx = await carToken
      .connect(users[i])
      .setApprovalForAll(carMarketplace.address, true);
    await approveTx.wait();
  }

  // create a new token
  console.log("Creating a new tokens...");
  for (let i = 1; i < 5; i++) {
    console.log(`Creating token ${i}...`);
    let tokenId = i;
    let uri = `http://localhost:3001/token/${tokenId}`;
    let mintTx = await carMarketplace.connect(users[i]).createCar(uri);
    await mintTx.wait();
  }

  // check token owner
  for (let i = 1; i < 5; i++) {
    console.log(`Checking token owner and URI for token ${i}...`);
    const tokenOwner = await carToken.ownerOf(i);
    console.log(tokenOwner);
    const tokenURI = await carToken.tokenURI(i);
    console.log(tokenURI);
  }

  
}

interact()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
