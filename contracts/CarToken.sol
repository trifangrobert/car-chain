// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract CarToken is ERC721, ERC721URIStorage, ERC721Burnable, Ownable {
    uint256 public totalTokens;

    constructor(address initialOwner)
        ERC721("CarToken", "CAR")
        Ownable(initialOwner)
    {}

    event TokenMinted(address to, uint256 tokenId, string uri);
    event TokenBurned(uint256 tokenId);

    // maybe remove tokenId parameter and use an auto-incremented value
    function safeMint(address to, uint256 tokenId, string memory uri)
        public
        onlyOwner
    {
        totalTokens++;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
        emit TokenMinted(to, tokenId, uri);
    }

    function getTotalTokens() public view returns (uint256) {
        return totalTokens;
    }

    // The following functions are overrides required by Solidity.

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}