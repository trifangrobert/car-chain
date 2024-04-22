require("@nomiclabs/hardhat-ethers");
const { ethers } = require("hardhat");

async function deploy() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);

    const CarToken = await ethers.getContractFactory("CarToken");
    const carToken = await CarToken.deploy(deployer.address);
    await carToken.deployed();

    console.log("CarToken deployed to:", carToken.address);

    const CarMarketplace = await ethers.getContractFactory("CarMarketplace");
    const carMarketplace = await CarMarketplace.deploy(carToken.address);
    await carMarketplace.deployed();

    console.log("CarMarketplace deployed to:", carMarketplace.address);
}

deploy().then(() => process.exit(0)).catch(error => {
    console.error(error);
    process.exit(1);
});