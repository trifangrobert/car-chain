// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";

contract CarToken is ERC721, ERC721URIStorage, ERC721Burnable {
    uint256 public totalTokens;

    constructor(address initialOwner) ERC721("CarToken", "CAR") {}

    event TokenMinted(address to, uint256 tokenId, string uri);
    event TokenBurned(uint256 tokenId);

    // maybe remove tokenId parameter and use an auto-incremented value
    function safeMint(address to, uint256 tokenId, string memory uri) public {
        totalTokens++;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
        emit TokenMinted(to, tokenId, uri);
    }

    function safeBurn(uint256 tokenId) external {
        require(
            ownerOf(tokenId) == msg.sender,
            "ERC721Burnable: caller is not owner"
        );
        _burn(tokenId);
        totalTokens--;
        emit TokenBurned(tokenId);
    }

    function setTokenURI(uint256 tokenId, string memory uri) public {
        _setTokenURI(tokenId, uri);
    }

    function getTotalTokens() public view returns (uint256) {
        return totalTokens;
    }

    function tokenURI(
        uint256 tokenId
    ) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(
        bytes4 interfaceId
    ) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
