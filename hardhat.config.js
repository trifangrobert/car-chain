require('@nomiclabs/hardhat-ethers');

/** @type import('hardhat/config').HardhatUserConfig */

//Add allowUnlimitedContractSize: true to your hardhat.config.ts under defaultNetworks.networks both "hardhat" and "localhost".

module.exports = {
  networks: {
    hardhat: {
      gas: "auto",
      mining: {
        interval: 2000 //ms
      }
    }
  },
  defaultNetwork: "hardhat",
  solidity: {
    compilers: [
      {
        version: '0.8.24',
        settings: {
          optimizer: {
            enabled: true,
            runs: 10000
          }
        }
      }
    ]
  }
};
