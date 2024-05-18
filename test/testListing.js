const { ethers } = require("hardhat");
const { solidity } = require("ethereum-waffle");

const chai = require("chai");
const { expect } = chai;

chai.use(solidity);

describe("Car Marketplace Contract", function () {
  let CarToken, carToken;
  let CarMarketplace, carMarketplace;
  let users, owner, user1, user2, user3;

  beforeEach(async function () {
    [owner, user1, user2, user3] = await ethers.getSigners();
    users = [owner, user1, user2, user3];
    CarToken = await ethers.getContractFactory("CarToken");
    carToken = await CarToken.deploy(owner.address);
    await carToken.deployed();

    CarMarketplace = await ethers.getContractFactory("CarMarketplace");
    carMarketplace = await CarMarketplace.deploy(carToken.address);
    await carMarketplace.deployed();

    for (let i = 1; i <= 3; i++) {
      const approveTx = await carToken
        .connect(users[i])
        .setApprovalForAll(carMarketplace.address, true);
      await approveTx.wait();
    }
  });

  describe("Car Creation", function () {
    it("should allow a user to create a car and emit CarCreated", async function () {
      const uri = "http://example.com/car1";
      await expect(carMarketplace.connect(user1).createCar(uri))
        .to.emit(carMarketplace, "CarCreated")
        .withArgs(1, user1.address);
      const ownerOfCar = await carToken.ownerOf(1);
      expect(ownerOfCar).to.equal(user1.address);
    });
  });

  describe("Listing and Unlisting Cars", function () {
    let uri = "http://example.com/car1";
    beforeEach(async function () {
      await carMarketplace.connect(user1).createCar(uri);
    });

    it("should list a car for sale and emit CarListed", async function () {
      await expect(carMarketplace.connect(user1).listCar(1, 500))
        .to.emit(carMarketplace, "CarListed")
        .withArgs(1, user1.address, 500);
      const listing = await carMarketplace.listings(1);
      expect(listing.price).to.equal(500);

      // trigger unlistCar for cleanup
      await carMarketplace.connect(user1).unlistCar(1);
    });

    it("should unlist a car and emit CarUnlisted", async function () {
      await carMarketplace.connect(user1).listCar(1, 500);
      await expect(carMarketplace.connect(user1).unlistCar(1))
        .to.emit(carMarketplace, "CarUnlisted")
        .withArgs(1, user1.address);
      const listing = await carMarketplace.listings(1);
      expect(listing.price).to.equal(0);
    });
  });

  describe("Buying Cars", function () {
    let uri = "http://example.com/car2";
    beforeEach(async function () {
      await carMarketplace.connect(user1).createCar(uri);
      await carMarketplace.connect(user1).listCar(1, 1000);
    });

    it("should allow a user to buy a listed car and emit CarSold", async function () {
      await expect(carMarketplace.connect(user2).buyCar(1, { value: 1000 }))
        .to.emit(carMarketplace, "CarSold")
        .withArgs(1, user1.address, user2.address, 1000);
      const ownerOfCar = await carToken.ownerOf(1);
      expect(ownerOfCar).to.equal(user2.address);
    });
  });

  describe("Car Updates", function () {
    beforeEach(async function () {
      const uri = "http://path/to/car3";
      const createTx = await carMarketplace.connect(user1).createCar(uri);
      await createTx.wait();
      const listTx = await carMarketplace.connect(user1).listCar(1, 1000);
      await listTx.wait();
    });

    it("should allow updating the price of a listed car and emit CarPriceUpdated", async function () {
      const newPrice = 1500;
      await expect(carMarketplace.connect(user1).updateCarPrice(1, newPrice))
        .to.emit(carMarketplace, "CarPriceUpdated")
        .withArgs(1, newPrice);
      const listing = await carMarketplace.listings(1);
      expect(listing.price).to.equal(newPrice);
    });
  });
});
