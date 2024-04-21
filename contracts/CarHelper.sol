// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./CarFactory.sol";

contract CarHelper is CarFactory {
    constructor(address _carTokenAddress) CarFactory(_carTokenAddress) {}

    event CarListedForSale(uint256 id, string model, string manufacturer, uint256 price); 

    modifier onlyCarOwner(address who, uint256 _carId) {
        require(who == carToken.ownerOf(_carId), "Caller is not the owner");
        _;
    }

    modifier isCarForSale(uint256 _carId) {
        require(cars[_carId].forSale, "Car is not for sale");
        _;
    }

    function listCarForSale(uint256 _carId, uint256 _price) public onlyCarOwner {
        // using `storage` to write on blockchain
        Car storage car = cars[_carId];
        car.forSale = true;
        car.price = _price;
        emit CarListedForSale(id, car.model, car.manufacturer, car.price);
    }

    function delistCarFromSale(uint256 _carId) public onlyCarOwner {
        Car storage car = cars[_carId];
        car.forSale = false;
    }

    function buyCar(uint256 _carId) public payable isCarForSale(_carId) {
        require(msg.value >= car.price, "Not enough value");

        address seller = carToken.ownerOf(_carId);
        require(seller != msg.sender, "Buyer cannot be the seller");

        car.forSale = false;
        carToken.safeTransferFrom(seller, msg.sender, _carId);
        payable(seller).transfer(msg.value);
    }

}