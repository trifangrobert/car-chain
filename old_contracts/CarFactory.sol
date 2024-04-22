// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

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

    // struct Car {
    //     uint256 id;
    //     string model;
    // }


    Car[] public cars;

    event NewCar(uint256 id, string model, string manufacturer, uint256 price);
    // event NewCar(uint256 id, string model);
    event InitializedCarToken(address carTokenAddress, address owner);

    constructor(address _carTokenAddress) {
        carToken = CarToken(_carTokenAddress);
        emit InitializedCarToken(_carTokenAddress, msg.sender);
    }

    function _nextCarId() private view returns (uint256) {
        return cars.length;
    }

    function _initializeCar(
        string memory model,
        string memory manufacturer,
        string memory color,
        uint16 year,
        uint256 mileage,
        uint256 price
    ) internal view returns (Car memory) {
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
        Car memory newCar = _initializeCar(
            _model,
            _manufacturer,
            _color,
            _year,
            _mileage,
            _price
        );
        cars.push(newCar);
        isCarForSale[newCar.id] = false;
        carToken.mint(msg.sender, newCar.id, ""); // TODO: add TokenURI for metadata
        emit NewCar(newCar.id, _model, _manufacturer, _price);
    }

    // function _initializeCar(
    //     string memory model
    // ) internal view returns (Car memory) {
    //     uint256 carId = _nextCarId();
    //     Car memory newCar = Car({
    //         id: carId,
    //         model: model
    //     });
    //     return newCar;
    // }

    // function createCar(
    //     string memory _model
    // ) public {
    //     Car memory newCar = _initializeCar(
    //         _model
    //     );
    //     cars.push(newCar);
    //     isCarForSale[newCar.id] = false;
    //     carToken.mint(msg.sender, newCar.id, ""); // TODO: add TokenURI for metadata
    //     emit NewCar(newCar.id, _model);
    // }
    // // Add this function in CarFactory.sol

    function getCar(uint256 carId) public view returns (Car memory) {
        require(carId < cars.length, "Car ID out of bounds");
        return cars[carId];
    }
}
