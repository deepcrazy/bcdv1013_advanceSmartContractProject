const FlashSale = artifacts.require("FlashSale");
const registeredUsersMerkleRoot = "0xcbe9f791262c5be1860def4ba6ef53b7eb6c7adc365786e167a9a120de746de8";
const existingUsersMerkleRoot = "0xf3891904928d0f51a25c774f1699f244505902ebd999b4bd797a6a5bf22327f2";

function getRegisteredUsersMerkleRoot() {
  return registeredUsersMerkleRoot;
}

function getExistingUsersMerkleRoot() {
  return existingUsersMerkleRoot;
}

module.exports = function(deployer) {
  deployer.then(async () => {
    await deployer.deploy(
      FlashSale,
      registeredUsersMerkleRoot,
      existingUsersMerkleRoot
      );
    });
  };

module.exports.getRegisteredUsersMerkleRoot = getRegisteredUsersMerkleRoot;
module.exports.getExistingUsersMerkleRoot = getExistingUsersMerkleRoot;
  