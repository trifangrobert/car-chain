// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./CarToken.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

// Ownable in case we want to adjust fees or other parameters in the future
contract CarMarketplace is ReentrancyGuard {
    CarToken public carToken;

    struct Bid {
        address bidder;
        uint256 amount;
    }

    struct Auction {
        uint256 reservePrice;
        uint256 highestBid;
        address payable highestBidder;
        uint256 endTime;
    }

    struct Listing {
        uint256 tokenId;
        address payable seller;
        uint256 price;
        bool isForSale;
        bool isAuction;
        Auction auction;
    }

    mapping(uint256 => Listing) public listings;

    mapping(uint256 => Bid[]) public bids;

    event CarListed(
        uint256 indexed tokenId,
        address indexed seller,
        uint256 price
    );
    event CarSold(
        uint256 indexed tokenId,
        address indexed seller,
        address indexed buyer,
        uint256 price
    );
    event ListingCancelled(uint256 indexed tokenId, address indexed seller);

    event CarCreated(uint256 indexed tokenId, address indexed seller);

    event CarURIUpdated(uint256 indexed tokenId, string uri);

    event CarPriceUpdated(uint256 indexed tokenId, uint256 price);

    // who started the auction, what the reserve price is, when it ends
    event AuctionStarted(
        uint256 indexed tokenId,
        address indexed seller,
        uint256 reservePrice,
        uint256 endTime
    );

    // who won the auction, how much they paid
    event AuctionEnded(
        uint256 indexed tokenId,
        address indexed winner,
        uint256 amount
    );

    event BidPlaced(
        uint256 indexed tokenId,
        address indexed bidder,
        uint256 amount
    );

    event BidWithdrawn(
        uint256 indexed tokenId,
        address indexed bidder,
        uint256 amount
    );

    modifier onlyTokenOwner(uint256 tokenId) {
        require(
            carToken.ownerOf(tokenId) == msg.sender,
            "Caller is not the owner of the token"
        );
        _;
    }

    modifier notTokenOwner(uint256 tokenId) {
        require(
            carToken.ownerOf(tokenId) != msg.sender,
            "Caller is the owner of the token"
        );
        _;
    }

    modifier auctionActive(uint256 tokenId) {
        require(listings[tokenId].isAuction, "This car is not in an auction");
        require(
            block.timestamp < listings[tokenId].auction.endTime,
            "Auction has ended"
        );
        _;
    }


    constructor(address _carTokenAddress) {
        carToken = CarToken(_carTokenAddress);
    }

    fallback() external payable {}

    receive() external payable {}

    function supportsInterface(
        bytes4 interfaceID
    ) external pure returns (bool) {
        return interfaceID == type(ERC721).interfaceId;
    }

    function decimals() public pure returns (uint8) {
        return 18;
    }

    function createCar(string memory uri) external {
        // mint a new token
        uint256 tokenId = carToken.getTotalTokens() + 1;
        carToken.safeMint(msg.sender, tokenId, uri);

        // add the token to the listings
        listings[tokenId] = Listing({
            tokenId: tokenId,
            seller: payable(msg.sender),
            price: 0,
            isForSale: false,
            isAuction: false,
            auction: Auction({
                reservePrice: 0,
                highestBid: 0,
                highestBidder: payable(address(0)),
                endTime: 0
            })
        });

        emit CarCreated(tokenId, msg.sender);
    }

    function updateCarURI(
        uint256 tokenId,
        string memory uri
    ) external onlyTokenOwner(tokenId) {
        carToken.setTokenURI(tokenId, uri);

        emit CarURIUpdated(tokenId, uri);
    }

    function updateCarPrice(
        uint256 tokenId,
        uint256 price
    ) external onlyTokenOwner(tokenId) {
        require(isTokenListed(tokenId), "This car is not listed for sale");

        listings[tokenId].price = price;

        emit CarPriceUpdated(tokenId, price);
    }

    function listCarForSale(
        uint256 tokenId,
        uint256 price
    ) external onlyTokenOwner(tokenId) {
        require(!isTokenListed(tokenId), "This car is already listed for sale");
        require(price > 0, "Price must be greater than 0");

        listings[tokenId].price = price;
        listings[tokenId].isForSale = true;

        emit CarListed(tokenId, msg.sender, price);
    }

    function buyCar(
        uint256 tokenId
    ) external payable notTokenOwner(tokenId) nonReentrant {
        Listing memory listing = listings[tokenId];
        require(listing.isForSale, "This car is not for sale");
        require(msg.value >= listing.price, "Insufficient funds sent.");

        address prevOwner = listing.seller;

        carToken.safeTransferFrom(listing.seller, msg.sender, tokenId);
        listing.seller.transfer(msg.value);
        listings[tokenId].isForSale = false;
        listings[tokenId].seller = payable(msg.sender);

        emit CarSold(tokenId, prevOwner, msg.sender, listing.price);
    }

    function cancelListing(uint256 tokenId) external onlyTokenOwner(tokenId) {
        Listing memory listing = listings[tokenId];
        require(listing.isForSale, "This car is not for sale");

        listings[tokenId].isForSale = false;

        emit ListingCancelled(tokenId, msg.sender);
    }

    function getListing(
        uint256 tokenId
    ) external view returns (Listing memory) {
        return listings[tokenId];
    }

    function getAvailableListings() external view returns (Listing[] memory) {
        uint256 totalListings = carToken.getTotalTokens();
        Listing[] memory tempArray = new Listing[](totalListings);
        uint256 counter = 0;

        for (uint256 i = 1; i <= totalListings; i++) {
            if (listings[i].isForSale) {
                tempArray[counter] = listings[i];
                counter++;
            }
        }

        Listing[] memory availableListings = new Listing[](counter);
        for (uint256 j = 0; j < counter; j++) {
            availableListings[j] = tempArray[j];
        }

        return availableListings;
    }

    // this function should return the list of tokenIds owned by the address and the corresponding URI
    function getCarsOwnedBy(
        address owner
    ) external view returns (uint256[] memory) {
        uint256 totalTokens = carToken.getTotalTokens();
        uint256[] memory tempCars = new uint256[](totalTokens);
        uint256 count = 0;

        for (uint256 i = 1; i <= totalTokens; i++) {
            if (carToken.ownerOf(i) == owner) {
                tempCars[count] = i;
                count++;
            }
        }

        uint256[] memory ownedCars = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            ownedCars[i] = tempCars[i];
        }

        return ownedCars;
    }

    function isTokenListed(uint256 tokenId) public view returns (bool) {
        return listings[tokenId].isForSale;
    }

    function startAuction(
        uint256 tokenId,
        uint256 reservePrice,
        uint256 duration
    ) external onlyTokenOwner(tokenId) {
        require(!listings[tokenId].isForSale, "This car is already listed for sale");
        require(!listings[tokenId].isAuction, "This car is already in an auction");
        require(reservePrice > 0, "Reserve price must be greater than 0");

        listings[tokenId].isAuction = true;
        listings[tokenId].auction = Auction({
            reservePrice: reservePrice,
            highestBid: 0,
            highestBidder: payable(address(0)),
            endTime: block.timestamp + duration
        });

        emit AuctionStarted(tokenId, msg.sender, reservePrice, block.timestamp + duration);
    }

    function endAuction(uint256 tokenId) external onlyTokenOwner(tokenId) {
        require(listings[tokenId].isAuction, "No auction for this car");

        Auction memory auction = listings[tokenId].auction;
        require(
            block.timestamp >= auction.endTime,
            "Auction has not ended yet"
        );

        if (auction.highestBidder != address(0)) {
            carToken.safeTransferFrom(
                listings[tokenId].seller,
                auction.highestBidder,
                tokenId
            );
            listings[tokenId].seller.transfer(auction.highestBid);
        }

        listings[tokenId].isAuction = false;

        emit AuctionEnded(tokenId, auction.highestBidder, auction.highestBid);
    }

    function placeBid(
        uint256 tokenId
    ) external payable nonReentrant auctionActive(tokenId) {
        Auction storage auction = listings[tokenId].auction;
        require(
            msg.value >= auction.reservePrice,
            "Bid must be at or above the reserve price"
        );
        require(
            msg.value > auction.highestBid,
            "Bid must be higher than the current highest bid"
        );
        require(
            msg.sender != listings[tokenId].seller,
            "Seller cannot bid on their own car"
        );

        Bid memory previousBid = Bid({
            bidder: auction.highestBidder,
            amount: auction.highestBid
        });

        // refund the previous highest bidder
        if (previousBid.bidder != address(0)) {
            (bool success, ) = previousBid.bidder.call{value: previousBid.amount}("");
            require(success, "Failed to refund previous bidder");
        }

        bids[tokenId].push(Bid({
            bidder: msg.sender,
            amount: msg.value
        }));    

        auction.highestBid = msg.value;
        auction.highestBidder = payable(msg.sender);

        emit BidPlaced(tokenId, msg.sender, msg.value);
    }

    function withdrawBid(uint256 tokenId) external nonReentrant auctionActive(tokenId) {
        Bid[] storage bidList = bids[tokenId];
        require(bidList.length > 0 && bidList[bidList.length - 1].bidder == msg.sender, "Not the highest bidder");

        uint256 amount = bidList[bidList.length - 1].amount;
        bidList.pop();

        if (bidList.length > 0) {
            Bid memory newHighestBid = bidList[bidList.length - 1];
            listings[tokenId].auction.highestBid = newHighestBid.amount;
            listings[tokenId].auction.highestBidder = payable(newHighestBid.bidder);
        } else {
            listings[tokenId].auction.highestBid = 0;
            listings[tokenId].auction.highestBidder = payable(address(0));
        }

        payable(msg.sender).transfer(amount);
        emit BidWithdrawn(tokenId, msg.sender, amount);
    }

    
}
