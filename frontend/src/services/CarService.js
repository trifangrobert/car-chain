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
      await carMarketplaceContract.listCar.estimateGas(
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


export const estimateGasForUnlisting = async (tokenId, carMarketplaceContract) => {
  try {
    console.log("Estimating gas for deleting car:", tokenId);
    const estimatedGas = await carMarketplaceContract.unlistCar.estimateGas(
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


export const estimateGasForAuctionStart = async (tokenId, startPrice, duration, carMarketplaceContract) => {
  try {
    console.log("Estimating gas for starting auction:", tokenId);
    const estimatedGas = await carMarketplaceContract.startAuction.estimateGas(
      tokenId,
      ethers.parseUnits(startPrice.toString(), "wei"),
      duration
    );
    return estimatedGas.toString();
  } catch (error) {
    console.error("Error estimating gas:", error);
  }
}

export const estimateGasForAuctionEnd = async (tokenId, carMarketplaceContract) => {
  try {
    console.log("Estimating gas for ending auction:", tokenId);
    const estimatedGas = await carMarketplaceContract.endAuction.estimateGas(tokenId);
    return estimatedGas.toString();
  } catch (error) {
    console.error("Error estimating gas:", error);
  }
}

export const estimateGasForPlacingBid = async (tokenId, amount, carMarketplaceContract) => {
  try {
    console.log("Estimating gas for placing bid:", tokenId);
    const estimatedGas = await carMarketplaceContract.placeBid.estimateGas(tokenId, { value: ethers.parseUnits(amount.toString(), "wei") });
    return estimatedGas.toString();
  } catch (error) {
    console.error("Error estimating gas:", error);
  }
}


export const listCar = async (
  tokenId,
  price,
  carMarketplaceContract
) => {
  // console.log("Provider:", provider);

  try {
    const contractAddress = carMarketplaceContract.target;
    const transaction = await carMarketplaceContract.listCar(
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

export const unlistCar = async (tokenId, carMarketplaceContract) => {
  try {
    console.log("Cancelling listing for car:", tokenId);
    const transaction = await carMarketplaceContract.unlistCar(tokenId);
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

export const startAuction = async (tokenId, startPrice, duration, carMarketplaceContract) => {
  try {
    console.log("Starting auction for car:", tokenId);
    const transaction = await carMarketplaceContract.startAuction(
      tokenId,
      ethers.parseUnits(startPrice.toString(), "wei"),
      duration
    );
    await transaction.wait();
    console.log(`Transaction successful: ${transaction.hash}`);
    return transaction;
  } catch (error) {
    console.error("Failed to start auction:", error);
    throw new Error(error.message);
  }
}

export const endAuction = async (tokenId, carMarketplaceContract) => {
  try {
    console.log("Ending auction for car:", tokenId);
    const transaction = await carMarketplaceContract.endAuction(tokenId);
    await transaction.wait();
    console.log(`Transaction successful: ${transaction.hash}`);
    return transaction;
  } catch (error) {
    console.error("Failed to end auction:", error);
    throw new Error(error.message);
  }
}

export const placeBid = async (tokenId, amount, carMarketplaceContract) => {
  try {
    console.log("Placing bid for car:", tokenId);
    const transaction = await carMarketplaceContract.placeBid(tokenId, { value: ethers.parseUnits(amount.toString(), "wei") });
    await transaction.wait();
    console.log(`Transaction successful: ${transaction.hash}`);
    return transaction;
  } catch (error) {
    console.error("Failed to place bid:", error);
    throw new Error(error.message);
  }
}