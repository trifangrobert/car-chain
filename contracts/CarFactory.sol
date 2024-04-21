// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./CarToken.sol";

contract CarFactory {
    CarToken public carToken;
    
    mapping (uint256 => bool) public isCarForSale;

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

    function _createCar(string memory _model, string memory _manufacturer, string memory _color, uint16 _year, uint256 _mileage, uint256 _price) public {
        uint256 newCarId = cars.length;
        Car memory newCar = Car({
            id: newCarId,
            model: _model,
            manufacturer: _manufacturer,
            color: _color,
            year: _year,
            mileage: _mileage,
            price: _price
        });
        isCarForSale[newCarId] = false;
        cars.push(newCar);
        carToken.mint(msg.sender, newCar.id, "");  // TODO: add TokenURI for metadata
        emit NewCar(newCar.id, _model, _manufacturer, _price);
    }
}
