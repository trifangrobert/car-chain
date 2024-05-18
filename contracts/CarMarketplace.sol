// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./CarToken.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract CarMarketplace is ReentrancyGuard {
    CarToken public carToken;

    struct Bid {
        address payable bidder;
        uint256 amount;
    }

    struct Auction {
        uint256 tokenId;
        uint256 startPrice;
        uint256 highestBid;
        address payable highestBidder;
        uint256 auctionEndTime;
    }

    struct Listing {
        uint256 tokenId;
        uint256 price;
    }

    struct Car {
        uint256 tokenId;
        bool isListed;
        Listing listing;
        bool isInAuction;
        Auction auction;
    }

    struct ListingDetails {
        uint256 tokenId;
        address seller;
        uint256 price;
    }

    mapping(uint256 => Car) public cars;
    mapping(uint256 => Auction) public auctions;
    mapping(uint256 => Listing) public listings;
    mapping(uint256 => Bid[]) public bids;

    event CarCreated(uint256 indexed tokenId, address indexed owner);
    event CarListed(
        uint256 indexed tokenId,
        address indexed seller,
        uint256 price
    );
    event CarUnlisted(uint256 indexed tokenId, address indexed seller);
    event CarSold(
        uint256 indexed tokenId,
        address indexed seller,
        address indexed buyer,
        uint256 price
    );

    event CarURIUpdated(uint256 indexed tokenId, string uri);
    event CarPriceUpdated(uint256 indexed tokenId, uint256 price);

    event AuctionCreated(
        uint256 indexed tokenId,
        address indexed seller,
        uint256 startPrice,
        uint256 auctionEndTime
    );
    event AuctionEnded(
        uint256 indexed tokenId,
        address indexed winner,
        uint256 price
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

    modifier onlyTokenOwner(uint256 _tokenId) {
        require(
            carToken.ownerOf(_tokenId) == msg.sender,
            "CarMarketplace: caller is not the token owner"
        );
        _;
    }

    modifier notTokenOwner(uint256 _tokenId) {
        require(
            carToken.ownerOf(_tokenId) != msg.sender,
            "CarMarketplace: caller is the token owner"
        );
        _;
    }

    modifier isListed(uint256 _tokenId) {
        require(cars[_tokenId].isListed, "CarMarketplace: car is not listed");
        _;
    }

    modifier notListed(uint256 _tokenId) {
        require(
            !cars[_tokenId].isListed,
            "CarMarketplace: car is already listed"
        );
        _;
    }

    modifier isInAuction(uint256 _tokenId) {
        require(
            cars[_tokenId].isInAuction,
            "CarMarketplace: car is not in auction"
        );
        _;
    }

    modifier notInAuction(uint256 _tokenId) {
        require(
            !cars[_tokenId].isInAuction,
            "CarMarketplace: car is in auction"
        );
        _;
    }

    modifier isAuctionActive(uint256 _tokenId) {
        require(
            block.timestamp < auctions[_tokenId].auctionEndTime,
            "CarMarketplace: auction is not active"
        );
        _;
    }

    constructor(address _carToken) {
        carToken = CarToken(_carToken);
    }

    // Listing

    function createCar(string memory uri) external {
        uint256 tokenId = carToken.getTotalTokens() + 1;
        carToken.safeMint(msg.sender, tokenId, uri);
        cars[tokenId] = Car(
            tokenId,
            false,
            Listing(0, 0),
            false,
            Auction(0, 0, 0, payable(address(0)), 0)
        );

        emit CarCreated(tokenId, msg.sender);
    }

    function listCar(
        uint256 _tokenId,
        uint256 _price
    )
        external
        onlyTokenOwner(_tokenId)
        notListed(_tokenId)
        notInAuction(_tokenId)
    {
        listings[_tokenId] = Listing(_tokenId, _price);
        cars[_tokenId].isListed = true;
        cars[_tokenId].listing = listings[_tokenId];

        emit CarListed(_tokenId, msg.sender, _price);
    }

    function unlistCar(
        uint256 _tokenId
    )
        external
        onlyTokenOwner(_tokenId)
        isListed(_tokenId)
        notInAuction(_tokenId)
    {
        delete listings[_tokenId];
        cars[_tokenId].isListed = false;
        cars[_tokenId].listing = Listing(0, 0);

        emit CarUnlisted(_tokenId, msg.sender);
    }

    function buyCar(
        uint256 _tokenId
    ) external payable notTokenOwner(_tokenId) isListed(_tokenId) {
        Listing memory listing = listings[_tokenId];
        require(
            msg.value >= listing.price,
            "CarMarketplace: insufficient funds"
        );

        address seller = carToken.ownerOf(_tokenId);
        carToken.safeTransferFrom(seller, msg.sender, _tokenId);
        payable(seller).transfer(msg.value);

        // unlist the car
        delete listings[_tokenId];
        cars[_tokenId].isListed = false;
        cars[_tokenId].listing = Listing(0, 0);

        emit CarSold(_tokenId, seller, msg.sender, msg.value);
    }

    function updateCarURI(
        uint256 _tokenId,
        string memory _uri
    ) external onlyTokenOwner(_tokenId) {
        carToken.setTokenURI(_tokenId, _uri);

        emit CarURIUpdated(_tokenId, _uri);
    }

    function updateCarPrice(
        uint256 _tokenId,
        uint256 _price
    ) external onlyTokenOwner(_tokenId) isListed(_tokenId) {
        listings[_tokenId].price = _price;
        cars[_tokenId].listing = listings[_tokenId];

        emit CarPriceUpdated(_tokenId, _price);
    }

    function getCarDetails(
        uint256 _tokenId
    ) external view returns (Car memory) {
        return cars[_tokenId];
    }

    function getListingDetails(
        uint256 _tokenId
    ) external view returns (ListingDetails memory) {
        return ListingDetails(_tokenId, carToken.ownerOf(_tokenId), listings[_tokenId].price);
    }

    function getNumberOfListedCars() private view returns (uint256) {
        uint256 totalListedCars = 0;
        for (uint256 i = 1; i <= carToken.getTotalTokens(); i++) {
            if (cars[i].isListed) {
                totalListedCars++;
            }
        }

        return totalListedCars;
    }

    // helper function to get all listed cars
    function getListedCars() external view returns (ListingDetails[] memory) {
        uint256 totalListedCars = getNumberOfListedCars();
        ListingDetails[] memory listedCars = new ListingDetails[](
            totalListedCars
        );
        uint256 index = 0;
        for (uint256 i = 1; i <= carToken.getTotalTokens(); i++) {
            if (cars[i].isListed) {
                listedCars[index] = ListingDetails(
                    i,
                    carToken.ownerOf(i),
                    listings[i].price
                );
                index++;
            }
        }

        return listedCars;
    }

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

    function isTokenListed(uint256 _tokenId) external view returns (bool) {
        return cars[_tokenId].isListed;
    }

    // Auction

    function startAuction(
        uint256 _tokenId,
        uint256 _startPrice,
        uint256 _duration
    )
        external
        onlyTokenOwner(_tokenId)
        notListed(_tokenId)
        notInAuction(_tokenId)
    {
        require(
            _startPrice > 0,
            "CarMarketplace: start price must be greater than 0"
        );
        require(
            _duration > 0 && _duration <= 300 seconds,
            "CarMarketplace: duration must be between 1 and 300 seconds"
        );

        auctions[_tokenId] = Auction(
            _tokenId,
            _startPrice,
            0,
            payable(address(0)),
            block.timestamp + _duration
        );

        cars[_tokenId].isInAuction = true;
        cars[_tokenId].auction = auctions[_tokenId];

        emit AuctionCreated(
            _tokenId,
            msg.sender,
            _startPrice,
            block.timestamp + _duration
        );
    }

    function endAuction(
        uint256 _tokenId
    ) external onlyTokenOwner(_tokenId) isInAuction(_tokenId) {
        Auction memory auction = auctions[_tokenId];
        require(
            block.timestamp >= auction.auctionEndTime,
            "CarMarketplace: auction has not ended yet"
        );

        if (auction.highestBidder == address(0)) { // maybe change this to require
            // clear the auction details
            delete auctions[_tokenId];
            cars[_tokenId].isInAuction = false;
            cars[_tokenId].auction = Auction(0, 0, 0, payable(address(0)), 0);

            emit AuctionEnded(_tokenId, address(0), 0);
            return;
        }

        // give the car to the highest bidder
        carToken.safeTransferFrom(
            msg.sender,
            auction.highestBidder,
            _tokenId
        );

        // transfer the funds to the seller
        (bool success, ) = payable(msg.sender).call{value: auction.highestBid}("");
        require(success, "CarMarketplace: failed to send funds to seller");

        // refund the other bidders except the winner
        Bid[] memory bidList = bids[_tokenId];
        for (uint256 i = 0; i < bidList.length; i++) {
            if (bidList[i].bidder != auction.highestBidder) {
                (bool successRefund, ) = payable(bidList[i].bidder).call{value: bidList[i].amount}("");
                require(successRefund, "CarMarketplace: failed to send bid");
            }
        }

        // clear the auction details
        delete auctions[_tokenId];
        cars[_tokenId].isInAuction = false;
        cars[_tokenId].auction = Auction(0, 0, 0, payable(address(0)), 0);

        // clear the bids
        delete bids[_tokenId];

        emit AuctionEnded(_tokenId, auction.highestBidder, auction.highestBid);
    }

    function placeBid(
        uint256 _tokenId
    )
        external
        payable
        notTokenOwner(_tokenId)
        isInAuction(_tokenId)
        isAuctionActive(_tokenId)
    {
        Auction memory auction = auctions[_tokenId];
        require(
            msg.value > auction.startPrice,
            "CarMarketplace: bid must be higher than the start price"
        );
        require(
            msg.value > auction.highestBid,
            "CarMarketplace: bid must be higher than the current highest bid"
        );

        // Bid memory previousBid = Bid({
        //     bidder: auction.highestBidder,
        //     amount: auction.highestBid
        // });

        // // refund the previous bidder
        // if (previousBid.bidder != address(0)) {
        //     (bool success, ) = previousBid.bidder.call{value: previousBid.amount}("");
        //     require(success, "CarMarketplace: failed to send previous bid");

        // }

        bids[_tokenId].push(Bid({bidder: payable(msg.sender), amount: msg.value}));

        auctions[_tokenId].highestBid = msg.value;
        auctions[_tokenId].highestBidder = payable(msg.sender);

        emit BidPlaced(_tokenId, msg.sender, msg.value);
    }

    function withdrawBid(
        uint256 _tokenId
    ) external notTokenOwner(_tokenId) isInAuction(_tokenId) {
        Bid[] storage bidList = bids[_tokenId];
        require(bidList.length > 0, "CarMarketplace: no bids to withdraw");

        bool found = false;
        uint256 index = 0;
        for (uint256 i = 0; i < bidList.length; i++) {
            if (bidList[i].bidder == msg.sender) {
                found = true;
                index = i;
                break;
            }
        }

        require(found, "CarMarketplace: bid not found");

        // refund the bid amount
        uint256 refundAmount = bidList[index].amount;
        (bool success, ) = payable(msg.sender).call{value: refundAmount}("");
        require(success, "CarMarketplace: failed to send bid");

        // remove the bid by shifting the array
        for (uint256 i = index; i < bidList.length - 1; i++) {
            bidList[i] = bidList[i + 1];
        }
        bidList.pop();

        emit BidWithdrawn(_tokenId, msg.sender, refundAmount);
    }

    // helper function to get all active auctions
    function getActiveAuctions() external view returns (Auction[] memory) {
        uint256 totalAuctions = 0;
        for (uint256 i = 1; i <= carToken.getTotalTokens(); i++) {
            if (cars[i].isInAuction) {
                totalAuctions++;
            }
        }

        Auction[] memory activeAuctions = new Auction[](totalAuctions);
        uint256 index = 0;
        for (uint256 i = 1; i <= carToken.getTotalTokens(); i++) {
            if (cars[i].isInAuction) {
                activeAuctions[index] = auctions[i];
                index++;
            }
        }

        return activeAuctions;
    }

    function getHighestBidderAndAmount(
        uint256 _tokenId
    ) external view returns (address, uint256) {
        return (auctions[_tokenId].highestBidder, auctions[_tokenId].highestBid);
    }

    function getBidsForToken(
        uint256 _tokenId
    ) external view returns (Bid[] memory) {
        return bids[_tokenId];
    }

    function getAuctionDetails(
        uint256 _tokenId
    ) external view returns (Auction memory) {
        return auctions[_tokenId];
    }

    function getAuctionEndTime(
        uint256 _tokenId
    ) external view returns (uint256) {
        return auctions[_tokenId].auctionEndTime;
    }

    function isTokenInAuction(uint256 _tokenId) external view returns (bool) {
        return cars[_tokenId].isInAuction;
    }
}
