import { ethers } from "ethers";


// a lot of duplicate code here, especially with the estimateGas functions
// could be refactored to be more DRY


export const estimateGasForListing = async (
  tokenId,
  price,
  carMarketplaceContract
) => {
  try {
    console.log("Estimating gas for listing car:", tokenId, price);
    const estimatedGas =
      await carMarketplaceContract.listCarForSale.estimateGas(
        tokenId,
        ethers.parseUnits(price.toString(), "wei")
      );
    return estimatedGas.toString();
  } catch (error) {
    console.error("Error estimating gas:", error);
  }
};

export const estimateGasForUpdating = async (
  tokenId,
  price,
  carMarketplaceContract
) => {
  try {
    console.log("Estimating gas for updating car:", tokenId, price);
    const estimatedGas =
      await carMarketplaceContract.updateCarPrice.estimateGas(
        tokenId,
        ethers.parseUnits(price.toString(), "wei")
      );
    return estimatedGas.toString();
  } catch (error) {
    console.error("Error estimating gas:", error);
  }
};


export const estimateGasForDeleting = async (tokenId, carMarketplaceContract) => {
  try {
    console.log("Estimating gas for deleting car:", tokenId);
    const estimatedGas = await carMarketplaceContract.cancelListing.estimateGas(
      tokenId
    );
    return estimatedGas.toString();
  } catch (error) {
    console.error("Error estimating gas:", error);
  }
};

export const estimateGasForBuying = async (tokenId, price, carMarketplaceContract) => {
  try {
    console.log("Estimating gas for buying car:", tokenId);
    const estimatedGas = await carMarketplaceContract.buyCar.estimateGas(tokenId, { value: ethers.parseUnits(price.toString(), "wei") });
    return estimatedGas.toString();
  } catch (error) {
    console.error("Error estimating gas:", error);
  }
};


export const listCarForSale = async (
  tokenId,
  price,
  carMarketplaceContract
) => {
  // console.log("Provider:", provider);

  try {
    console.log("Listing car for sale:", tokenId, price);

    // const estimatedGas = await carMarketplaceContract.listCarForSale.estimateGas(
    //   tokenId,
    //   ethers.parseUnits(price.toString(), "wei")
    // );

    // const currentGasPrice = await provider.getFeeData().then((data) => data.gasPrice);
    // console.log("Type of current gas price:", typeof currentGasPrice);

    // const increasedGasPrice = Number(currentGasPrice) + 1000000000;
    // console.log("Current gas price:", currentGasPrice);
    // console.log("Increased gas price:", increasedGasPrice);

    // const increasedGasLimit = Number(estimatedGas) + 100000;

    // console.log("Estimated gas:", estimatedGas);
    // console.log("Increased gas limit:", increasedGasLimit);

    // console.log("carMarketplaceContract: ", carMarketplaceContract)
    const contractAddress = carMarketplaceContract.target;
    console.log("contractAddress:", contractAddress);

    console.log("carMarketplaceContract: ", carMarketplaceContract);

    // const userAddress = address;
    // console.log("userAddress:", userAddress);

    // const contract = new ethers.Contract(contractAddress, carMarketplaceContract.abi, signer);

    // const nonce = await provider.getTransactionCount(carMarketplaceContract.target);
    // console.log("Nonce:", nonce);

    const transaction = await carMarketplaceContract.listCarForSale(
      tokenId,
      ethers.parseUnits(price.toString(), "wei")
    );
    await transaction.wait();
    console.log(`Transaction successful: ${transaction.hash}`);
    return transaction;
  } catch (error) {
    console.error("Failed to list car for sale:", error);
    throw new Error(error.message);
  }
};

export const cancelListing = async (tokenId, carMarketplaceContract) => {
  try {
    console.log("Cancelling listing for car:", tokenId);
    const transaction = await carMarketplaceContract.cancelListing(tokenId);
    await transaction.wait();
    console.log(`Transaction successful: ${transaction.hash}`);
    return transaction;
  } catch (error) {
    console.error("Failed to cancel listing:", error);
    throw new Error(error.message);
  }
};

export const updateCarPrice = async (tokenId, price, carMarketplaceContract) => {
  try {
    console.log("Updating listing for car:", tokenId);
    const transaction = await carMarketplaceContract.updateCarPrice(
      tokenId,
      ethers.parseUnits(price.toString(), "wei")
    );
    await transaction.wait();
    console.log(`Transaction successful: ${transaction.hash}`);
    return transaction;
  } catch (error) {
    console.error("Failed to update listing:", error);
    throw new Error(error.message);
  }
};

export const buyCar = async (tokenId, price, carMarketplaceContract) => {
  try {
    console.log("Buying car:", tokenId);
    const transaction = await carMarketplaceContract.buyCar(tokenId, { value: ethers.parseUnits(price.toString(), "wei") });
    await transaction.wait();
    console.log(`Transaction successful: ${transaction.hash}`);
    return transaction;
  } catch (error) {
    console.error("Failed to buy car:", error);
    throw new Error(error.message);
  }
}