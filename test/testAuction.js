const { ethers } = require("hardhat");
const { solidity } = require("ethereum-waffle");

const chai = require("chai");
const { expect } = chai;

chai.use(solidity);

describe("Car Marketplace Contract - Auctions", function () {
  let CarToken, carToken;
  let CarMarketplace, carMarketplace;
  let owner, user1, user2, user3, users;

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

    const createCarTx = await carMarketplace
      .connect(user1)
      .createCar("http://example.com/car1");
    await createCarTx.wait();
  });

  describe("Starting an Auction", function () {
    it("should allow a user to start an auction", async function () {
      const startPrice = 1000000;
      const duration = 60; // 60 seconds

      const auctionTx = await carMarketplace
        .connect(user1)
        .startAuction(1, startPrice, duration);
      await auctionTx.wait();

      const auctionDetails = await carMarketplace.getAuctionDetails(1);
      expect(auctionDetails.startPrice).to.equal(startPrice);

      const carDetails = await carMarketplace.getCarDetails(1);
      expect(carDetails.isInAuction).to.be.true;
    });
  });

  describe("Bidding in Auction", function () {
    beforeEach(async function () {
      const startPrice = ethers.utils.parseEther("1.0");
      const duration = 300; // 300 seconds for auction duration
      await carMarketplace.connect(user1).startAuction(1, startPrice, duration);
    });

    it("should allow another user to place a bid", async function () {
      const bidAmount = ethers.utils.parseEther("1.5"); // 1.5 ETH
      await expect(
        carMarketplace.connect(user2).placeBid(1, { value: bidAmount })
      )
        .to.emit(carMarketplace, "BidPlaced")
        .withArgs(1, user2.address, bidAmount);

      const auction = await carMarketplace.getAuctionDetails(1);
      expect(auction.highestBid).to.equal(bidAmount);
      expect(auction.highestBidder).to.equal(user2.address);
    });
  });

  describe("Ending an Auction", function () {
    beforeEach(async function () {
      const startPrice = 1000000;
      const duration = 2;
      await carMarketplace.connect(user1).startAuction(1, startPrice, duration);
      const bidAmount = 5000000;
      await carMarketplace.connect(user2).placeBid(1, { value: bidAmount });
    });

    it("should allow the auction starter to end the auction after the duration", async function () {
      // wait 3 seconds for the auction to end
      const timeout = new Promise((resolve) => setTimeout(resolve, 4000));
      await timeout;

      await expect(carMarketplace.connect(user1).endAuction(1))
        .to.emit(carMarketplace, "AuctionEnded")
        .withArgs(1, user2.address, 5000000);

      const auction = await carMarketplace.getAuctionDetails(1);
      expect(auction.highestBidder).to.equal(ethers.constants.AddressZero);

      const carDetails = await carMarketplace.getCarDetails(1);
      expect(carDetails.isInAuction).to.be.false;
    });
  });
});
