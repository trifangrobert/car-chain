async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);

    const CarToken = await ethers.getContractFactory("CarToken");
    const carToken = await CarToken.deploy();
    await carToken.deployed();

    console.log("CarToken address:", carToken.address);

    const CarFactory = await ethers.getContractFactory("CarFactory");
    const carFactory = await CarFactory.deploy(carToken.address);
    await carFactory.deployed();

    console.log("CarFactory address:", carFactory.address);

    const CarHelper = await ethers.getContractFactory("CarHelper");
    const carHelper = await CarHelper.deploy(carToken.address);
    await carHelper.deployed();

    console.log("CarHelper address:", carHelper.address);
}

main().then(() => process.exit(0)).catch(error => {
    console.error(error);
    process.exit(1);
});