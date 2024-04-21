// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./CarToken.sol";

contract CarFactory {
    CarToken public carToken;
    uint256 taxRate;

    mapping(uint256 => bool) public isCarForSale;

    struct Car {
        uint256 id;
        string model;
        string manufacturer;
        string color;
        uint16 year;
        uint256 mileage;
        uint256 price;
    }

    Car[] public cars;

    event NewCar(uint256 id, string model, string manufacturer, uint256 price);

    constructor(address _carTokenAddress) {
        carToken = CarToken(_carTokenAddress);
    }

    function _nextCarId() private view returns (uint256) {
        return cars.length();
    }

    function _initializeCar(
        string memory model,
        string memory manufacturer,
        string memory color,
        uint16 year,
        uint256 mileage,
        uint256 price
    ) internal returns (Car) {
        uint256 carId = _nextCarId();
        Car memory newCar = Car({
            id: carId,
            model: model,
            manufacturer: manufacturer,
            color: color,
            year: year,
            mileage: mileage,
            price: price
        });
        return newCar;
    }

    function createCar(
        string memory _model,
        string memory _manufacturer,
        string memory _color,
        uint16 _year,
        uint256 _mileage,
        uint256 _price
    ) public {
        Car newCar = _initializeCar(_model, _manufacturer, _color, _year, _mileage, _price);
        cars.push(newCar);

        isCarForSale[newCar.id] = false;
        carToken.mint(msg.sender, newCar.id, ""); // TODO: add TokenURI for metadata
        emit NewCar(newCar.id, _model, _manufacturer, _price);
    }
}
