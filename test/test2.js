const { ethers } = require("hardhat");
const chai = require("chai");
const { waffleChai } = require("@ethereum-waffle/chai");

chai.use(waffleChai);
const expect = chai.expect;


describe("Transactions", function () {
  this.timeout(120000);
  let CarToken;
  let carToken;
  let CarMarketplace;
  let carMarketplace;

  beforeEach(async function () {
    [owner, user1, user2, user3, user4] = await ethers.getSigners();
    users = [owner, user1, user2, user3, user4];

    // Deploy the contracts
    CarToken = await ethers.getContractFactory("CarToken");
    carToken = await CarToken.deploy(owner.address);
    await carToken.deployed();

    CarMarketplace = await ethers.getContractFactory("CarMarketplace");
    carMarketplace = await CarMarketplace.deploy(carToken.address);
    await carMarketplace.deployed();

    for (let i = 1; i <= 3; i++) {
      let tokenId = i;
      let uri = `http://localhost:3000/token/${tokenId}`;
      let mintTx = await carToken
        .connect(owner)
        .safeMint(users[i].address, tokenId, uri);
      await mintTx.wait();

      const approvalAllTx = await carToken
        .connect(users[i])
        .setApprovalForAll(carMarketplace.address, true);
      await approvalAllTx.wait();

      let price = i * 1000;
      let listTx = await carMarketplace
        .connect(users[i])
        .listCarForSale(tokenId, price);
      await listTx.wait();
    }
  });

  describe("Car listings and purchases", function () {
    it("should allow a user to list and buy a car", async function () {
      // user1 buys car 2
      const purchasePrice = 2000;
      await expect(
        carMarketplace.connect(user1).buyCar(2, { value: purchasePrice })
      )
        .to.emit(carMarketplace, "CarSold")
        .withArgs(2, users[2].address, user1.address, purchasePrice);

      // Check ownership post-purchase
      expect(await carToken.ownerOf(2)).to.equal(user1.address);

      // Check that the car is no longer listed
      const listing = await carMarketplace.listings(2);
      expect(listing.isActive).to.be.false;
    });

    it("should correctly handle listing cancellations", async function () {
      // user2 cancels their listing
      await expect(carMarketplace.connect(user3).cancelListing(3))
        .to.emit(carMarketplace, "ListingCancelled")
        .withArgs(3, user3.address);

      // Check listing status
      const listing = await carMarketplace.listings(3);
      expect(listing.isActive).to.be.false;
    });
  });
});
