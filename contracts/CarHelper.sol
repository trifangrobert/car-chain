// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./CarFactory.sol";

contract CarHelper is CarFactory {
    constructor(address _carTokenAddress) CarFactory(_carTokenAddress) {}

    event CarListedForSale(uint256 id, string model, string manufacturer, uint256 price); 
    event CarDelistedForSale(uint256 id, string model, string manufacturer); 
    event CarPurchased(address from, address to, string model, string manufacturer, uint256 price);

    modifier onlyCarOwner(address who, uint256 _carId) {
        require(who == carToken.ownerOf(_carId), "Caller is not the owner");
        _;
    }

    modifier checkCarForSale(uint256 _carId) {
        require(isCarForSale[_carId], "Car is not for sale");
        _;
    }

    function listCarForSale(uint256 _carId, uint256 _price) public onlyCarOwner(msg.sender, _carId) {
        // using `storage` to write on blockchain
        Car storage car = cars[_carId];
        isCarForSale[_carId] = true;
        car.price = _price;
        emit CarListedForSale(car.id, car.model, car.manufacturer, car.price);
    }

    function delistCarFromSale(uint256 _carId) public onlyCarOwner(msg.sender, _carId) {
        Car storage car = cars[_carId];
        isCarForSale[_carId] = false;
        emit CarDelistedForSale(_carId, car.model, car.manufacturer);
    }

    function buyCar(uint256 _carId) external payable checkCarForSale(_carId) {
        Car storage car = cars[_carId];
        require(msg.value >= car.price, "Not enough value");

        address seller = carToken.ownerOf(_carId);
        require(seller != msg.sender, "Buyer cannot be the seller");

        isCarForSale[_carId] = false;
        carToken.safeTransferFrom(seller, msg.sender, _carId);
        payable(seller).transfer(msg.value);

        emit CarPurchased(seller, msg.sender, car.model, car.manufacturer, car.price);
    }

    function getCarsOwnedByMe() public view returns (Car[] memory) {
        uint256 totalCars = carToken.balanceOf(msg.sender);
        Car[] memory myCars = new Car[](totalCars);
        uint256 counter = 0;

        for (uint256 i = 0;i < cars.length;++i) {
            if (carToken.ownerOf(cars[i].id) == msg.sender) {
                myCars[counter] = cars[i];
                counter++;
            }
        }

        return myCars;
    }

    function getCarsForSale() public view returns (Car[] memory) {
        uint256 totalForSale = 0;
        for (uint256 i = 0;i < cars.length;++i) {
            if (isCarForSale[cars[i].id]) {
                totalForSale++;
            }
        }

        Car[] memory forSaleCars = new Car[](totalForSale);
        uint256 counter = 0;

        for (uint256 i = 0;i < cars.length;++i) {
            if (isCarForSale[cars[i].id]) {
                forSaleCars[counter] = cars[i];
                counter++;
            }
        }

        return forSaleCars;
    }

}