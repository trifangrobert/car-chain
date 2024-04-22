const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CarToken and CarMarketplace", function () {
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
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await carToken.owner()).to.equal(owner.address);
    });
  });

  describe("Minting", function () {
    it("Should mint 4 tokens and list them for sale", async function () {
      for (let i = 1; i <= 2; i++) {
        let tokenId = i;
        let uri = `http://localhost:3000/token/${tokenId}`;
        let mintTx = await carToken
          .connect(owner)
          .safeMint(users[i].address, tokenId, uri);
        await mintTx.wait();
        expect(await carToken.ownerOf(tokenId)).to.equal(users[i].address);

        const approvalAllTx = await carToken.connect(users[i]).setApprovalForAll(carMarketplace.address, true);
        await approvalAllTx.wait();

        let price = i * 1000;
        let listTx = await carMarketplace
          .connect(users[i])
          .listCarForSale(tokenId, price);
        await listTx.wait();

        const listing = await carMarketplace.getListing(tokenId);
        expect(listing.price.toString()).to.equal(price.toString());
      }
    }); 
  });
});
