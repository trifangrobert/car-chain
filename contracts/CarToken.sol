// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract CarToken is ERC721URIStorage, Ownable {
    
    constructor() ERC721("CarToken", "CAR") {}

    function mint(address recipient, uint256 tokenId, string memory tokenURI) public onlyOwner {
        _safeMint(recipient, tokenId);
        _setTokenURI(tokenId, tokenURI);
    }
}

    