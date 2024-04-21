// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./CarToken.sol";

contract CarFactory {
    CarToken public carToken;

    struct Car {
        uint256 id;
        string model;
        string manufacturer;
        string color;
        uint16 year;
        uint256 mileage;
        uint256 price;
        bool forSale;
    }

    Car[] public cars;

    event NewCar(uint256 id, string model, string manufacturer, uint256 price);

    constructor(address _carTokenAddress) {
        carToken = CarToken(_carTokenAddress);
    }

    function _createCar(string memory _model, string memory _manufacturer, string memory _color, uint16 _year, uint256 _mileage, uint256 _price) private {
        Car memory newCar = Car({
            id: cars.length,
            model: _model,
            manufacturer: _manufacturer,
            color: _color,
            year: _year,
            mileage: _mileage,
            price: _price,
            forSale: false
        });
        cars.push(newCar);
        carToken.mint(msg.sender, newCar.id, "");  // TODO: add TokenURI for metadata
        emit NewCar(newCar.id, _model, _manufacturer, _price);
    }
}
