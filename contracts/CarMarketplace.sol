// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./CarToken.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

// Ownable in case we want to adjust fees or other parameters in the future
contract CarMarketplace is ReentrancyGuard {
    CarToken public carToken;

    struct Listing {
        uint256 tokenId;
        address payable seller;
        uint256 price;
        bool isActive;
    }

    mapping(uint256 => Listing) public listings;

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

    modifier onlyTokenOwner(uint256 tokenId) {
        require(
            carToken.ownerOf(tokenId) == msg.sender,
            "Caller is not the owner of the token"
        );
        _;
    }

    constructor(address _carTokenAddress) {
        carToken = CarToken(_carTokenAddress);
    }

    function _updateListingStatus(uint256 tokenId, bool status) private {
        listings[tokenId].isActive = status;
    }

    function listCarForSale(
        uint256 tokenId,
        uint256 price
    ) external onlyTokenOwner(tokenId) {
        require(!isTokenListed(tokenId), "This car is already listed for sale");

        listings[tokenId] = Listing({
            tokenId: tokenId,
            seller: payable(msg.sender),
            price: price,
            isActive: true
        });

        emit CarListed(tokenId, msg.sender, price);
    }

    function buyCar(uint256 tokenId) external payable nonReentrant {
        Listing memory listing = listings[tokenId];
        require(listing.isActive, "This car is not for sale");
        require(msg.value >= listing.price, "Insufficient funds sent.");

        address prevOwner = listing.seller;

        carToken.safeTransferFrom(listing.seller, msg.sender, tokenId);
        listing.seller.transfer(msg.value);
        _updateListingStatus(tokenId, false);
        listings[tokenId].seller = payable(msg.sender);

        emit CarSold(tokenId, prevOwner, msg.sender, listing.price);
    }

    function cancelListing(uint256 tokenId) external onlyTokenOwner(tokenId) {
        Listing memory listing = listings[tokenId];
        require(listing.isActive, "This car is not for sale");

        _updateListingStatus(tokenId, false);

        emit ListingCancelled(tokenId, msg.sender);
    }

    function getListing(
        uint256 tokenId
    ) external view returns (Listing memory) {
        return listings[tokenId];
    }

    function getAvailableListings() external view returns (Listing[] memory) {
        Listing[] memory availableListings = new Listing[](
            carToken.getTotalTokens()
        );
        uint256 counter = 0;

        for (uint256 i = 1; i <= carToken.getTotalTokens(); i++) {
            if (listings[i].isActive) {
                availableListings[counter] = listings[i];
                counter++;
            }
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
        return listings[tokenId].isActive;
    }
}
