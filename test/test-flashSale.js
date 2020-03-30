// import registeredUsersMerkleRoot from "../migrations/2_deploy_contracts";
const FlashSale = artifacts.require("FlashSale.sol");
const deployContractsFileInstance = require("../migrations/2_deploy_contracts");
const truffleAssert = require("truffle-assertions");

const registeredUsersMerkleRoot = deployContractsFileInstance.getRegisteredUsersMerkleRoot();
const existingUsersMerkleRoot = deployContractsFileInstance.getExistingUsersMerkleRoot();

// Handle revert exception occured further..
async function expectException(promise, expectedError) {
  try {
    await promise;
  } catch (error) {
    if (error.message.indexOf(expectedError) === -1) {
      // When the exception was a revert, the resulting string will include only
      // the revert reason, otherwise it will be the type of exception (e.g. 'invalid opcode')
      const actualError = error.message.replace(
        /Returned error: VM Exception while processing transaction: (revert )?/,
        ""
      );
      expect(actualError).to.equal(
        expectedError,
        "Wrong kind of exception received"
      );
    }
    return;
  }
  expect.fail("Expected an exception but none was received");
}

// function for checking the revert conditions
const expectRevert = async function(promise, expectedError) {
  promise.catch(() => {}); // Avoids uncaught promise rejections in case an input validation causes us to return early

  if (!expectedError) {
    throw Error(
      "No revert reason specified: call expectRevert with the reason string, or use expectRevert.unspecified \
      if your 'require' statement doesn't have one."
    );
  }

  await expectException(promise, expectedError);
};

contract("FlashSale", accounts => {
  let flashSale_instance;

  //  deploy contract and get its instance
  before(() => {
    return FlashSale.deployed(
      registeredUsersMerkleRoot,
      existingUsersMerkleRoot
    ).then(instance => {
      flashSale_instance = instance;
    });
  });

  //  Test case for testing contract is deployed properly or not
  it("checks 'FlashSale' Contract is deployed", async () => {
    assert.equal(
      flashSale_instance.address.length,
      42,
      "Incorrent address - Length of address mismatch"
    );
    assert.ok(flashSale_instance.address, "Contract is not deployed..!!");
  });

  // Check contract is deployed with registered users merkle root or not
  it("should check registeredUsersMerkleRoot value", async () => {
    const result = await flashSale_instance.registeredUsersMerkleRoot();
    assert.equal(
      result.length,
      66,
      "Received 'registeredUsersMerkleRoot' is not of bytes32"
    );
    assert.equal(
      result,
      registeredUsersMerkleRoot,
      "Registered Users Merkle root mismatch"
    );
  });

  //  Check contract is deployed with existing users merkke root or not
  it("should check existingUsersMerkleRoot value", async () => {
    const result = await flashSale_instance.existingUsersMerkleRoot();
    assert.equal(
      result.length,
      66,
      "Received 'existingUsersMerkleRoot' is not of bytes32"
    );
    assert.equal(
      result,
      existingUsersMerkleRoot,
      "Existing Users Merkle root mismatch"
    );
  });

  // Test Case for calculating the gas estimate and check it is less than 0.12 million or not
  it("Check the gas estimate of the buyAppleProduct() function", async () => {
    const registeredUsersPath = 15; //  Index of the registered user based on registered users list
    const registeredUsersWitnesses = [
      "0x3834d65a0911f843c8fda7acb88b957c4a5b8692b5652ba0e83702e6a82d2d58",
      "0xe9b79f3c458d7fac2276ec5766a30b67a3690b66b3dcb9352d475a097c1907e4",
      "0xa28969650fe104d21a7737f93c0cd5461335ae1518200379437749c78b70ee05",
      "0xd3563641798131a1ce3240877592440de29ad8399b2152597bd0c5c733b97200",
      "0x05e0e970b9a76b622617d9cb8278bb2ef7ce55a9d7638274c28acf3ca5f767c1",
      "0xd0c3d8c99cd476fcd34f316d12e37f04c5f778d3d96db4feaebefc9fcae7deb5",
      "0xff490457071a7641cbcc9caded39c2f0151930d0ff1b7a206fa5e8104ac46c12",
      "0xd8372d2fcc3e3bce9e5fe87dae578b7caf77d931f4016da2aea361ed2c41ea34",
      "0xd06bd6f251fa7e26ed009b49c50b1e5f5e9133d70cd561628033f8fc05255b60",
      "0x14baf3f0a11419f2b3a7a992b2965a2c6871630866561410f5610bdcc2d645ba"
    ]; //  Witnesses for the registered user based on registered users list
    const existingUsersPath = 14; //  Index of the existing user based on existing users list
    const existingUsersWitnesses = [
      "0xfe172ec0b270fc1e2dfc9f2ace046483c7b302d372b56d678720138f75ce0c40",
      "0xe7eb96a3958b9796ba26f86734e7c1d1aa248415bd6633eb48232463f36b62c1",
      "0x3c2ebabb70e176f7fcadd18ea4733b2c6e84c201e240f74627048dbfe5db5818",
      "0xd715bb7a913531efb75200f82ba3f394bdefc7ad8e6be673a358ff1ee3c8a616",
      "0x9b73ce3d8eac829c0ab99d28d25324f33c41c50aad229868080092c741a0ba02",
      "0xdb31224f31009a089fbafe1d9993cf56abb0772d99d0b63e36b2c14670492b6b",
      "0x7b2cfd6caa0026c8d32ecffab51282f5c463d2d164dc33ab44146b6978231189",
      "0x0c44e5a66beb1854ebe9a9e5bfaee786f470112b8e848ccb920d3d8b32ee58ad",
      "0xa0851ce165d63ccc421e65ccceb37ea8faebb07efa8f962898f8bbfbfeb3b2e7",
      "0xa39e172f13c34acc77af8315389f5768c8d910ba4b829a3149b5c6cdad476900"
    ]; //  Witnesses for the existing user based on existing users list
    const productId = 1; //  Product Id of the product, user is going to buy

    let gas = await flashSale_instance.buyAppleProduct.estimateGas(
      registeredUsersPath,
      existingUsersPath,
      registeredUsersWitnesses,
      existingUsersWitnesses,
      productId,
      { from: accounts[1] }
    );
    assert.isBelow(gas, 130000, "Gas Estimate is not less than 0.13 Million");
  });

  //  Test case for buying the product for registered and existing user
  it("should check buyAppleProduct() function for registered and existing user", async () => {
    const registeredUsersPath = 15; //  Index of the registered user based on registered users list
    const registeredUsersWitnesses = [
      "0x3834d65a0911f843c8fda7acb88b957c4a5b8692b5652ba0e83702e6a82d2d58",
      "0xe9b79f3c458d7fac2276ec5766a30b67a3690b66b3dcb9352d475a097c1907e4",
      "0xa28969650fe104d21a7737f93c0cd5461335ae1518200379437749c78b70ee05",
      "0xd3563641798131a1ce3240877592440de29ad8399b2152597bd0c5c733b97200",
      "0x05e0e970b9a76b622617d9cb8278bb2ef7ce55a9d7638274c28acf3ca5f767c1",
      "0xd0c3d8c99cd476fcd34f316d12e37f04c5f778d3d96db4feaebefc9fcae7deb5",
      "0xff490457071a7641cbcc9caded39c2f0151930d0ff1b7a206fa5e8104ac46c12",
      "0xd8372d2fcc3e3bce9e5fe87dae578b7caf77d931f4016da2aea361ed2c41ea34",
      "0xd06bd6f251fa7e26ed009b49c50b1e5f5e9133d70cd561628033f8fc05255b60",
      "0x14baf3f0a11419f2b3a7a992b2965a2c6871630866561410f5610bdcc2d645ba"
    ]; //  Witnesses for the registered user based on registered users list
    const existingUsersPath = 14; //  Index of the existing user based on existing users list
    const existingUsersWitnesses = [
      "0xfe172ec0b270fc1e2dfc9f2ace046483c7b302d372b56d678720138f75ce0c40",
      "0xe7eb96a3958b9796ba26f86734e7c1d1aa248415bd6633eb48232463f36b62c1",
      "0x3c2ebabb70e176f7fcadd18ea4733b2c6e84c201e240f74627048dbfe5db5818",
      "0xd715bb7a913531efb75200f82ba3f394bdefc7ad8e6be673a358ff1ee3c8a616",
      "0x9b73ce3d8eac829c0ab99d28d25324f33c41c50aad229868080092c741a0ba02",
      "0xdb31224f31009a089fbafe1d9993cf56abb0772d99d0b63e36b2c14670492b6b",
      "0x7b2cfd6caa0026c8d32ecffab51282f5c463d2d164dc33ab44146b6978231189",
      "0x0c44e5a66beb1854ebe9a9e5bfaee786f470112b8e848ccb920d3d8b32ee58ad",
      "0xa0851ce165d63ccc421e65ccceb37ea8faebb07efa8f962898f8bbfbfeb3b2e7",
      "0xa39e172f13c34acc77af8315389f5768c8d910ba4b829a3149b5c6cdad476900"
    ]; //  Witnesses for the existing user based on existing users list
    const productId = 1; //  Product Id of the product, user is going to buy

    const productPrice = await flashSale_instance.productPrice(productId); //  Get the price of the product
    const amountToPay = (productPrice * 60) / 100; //  Calculate the amount, user has to pay/has paid for the product

    // console.log(web3.utils.fromWei(amountToPay.toString(), "ether"));
    const buyAppleProductTx = await flashSale_instance.buyAppleProduct(
      registeredUsersPath,
      existingUsersPath,
      registeredUsersWitnesses,
      existingUsersWitnesses,
      productId,
      { from: accounts[1] }
    ); //  Perform transaction for call to buyAppleProduct() function by user 'accounts[1] i.e. 0xFFcf8FDEE72ac11b5c542428B35EEF5769C409f0'
    // console.log(buyAppleProductTx);

    assert.ok(
      buyAppleProductTx.receipt.status == true,
      "Transaction status is false."
    );
    assert.ok(
      buyAppleProductTx.logs[0].args.productId.toString() ===
        productId.toString(),
      "Product Id mismatch"
    );
    assert.ok(
      buyAppleProductTx.logs[0].args.discountOffered.toString() === "40",
      "Discount Offered mismatch. It should be 40% for registered and existing users"
    );
    assert.ok(
      buyAppleProductTx.logs[0].args.price.toString() ===
        amountToPay.toString(),
      "Amount Paid for the product mismatch"
    );

    // Test LogPurchaseDetails Event from the above transaction performed explicitly
    truffleAssert.eventEmitted(
      buyAppleProductTx,
      "LogPurchaseDetails",
      async event => {
        assert.ok(
          event.productId.toString() === productId.toString(),
          "Product Id mismatch"
        );
        assert.ok(
          event.discountOffered.toString() === "40",
          "Discount Offered mismatch"
        );
        assert.ok(
          event.price.toString() === amountToPay.toString(),
          "Amount Paid for the product mismatch"
        );
        return (
          event.productId.toString() === productId.toString() &&
          event.discountOffered.toString() === "40" &&
          event.price.toString() === amountToPay.toString()
        );
      },
      "LogPurchaseDetails event emitted successfully..!!"
    );
  });

  //  Test case for buying the product for registered but not existing user
  it("should check buyAppleProduct() function for registered but not existing user", async () => {
    const registeredUsersPath = 7; //  Index of the registered user based on registered users list
    const registeredUsersWitnesses = [
      "0xa107903e774f2209cb886ce87190378ca537edeb3f117e4a102ed63a3e8d7994",
      "0x439f58e20f3741f105b2ac4836c7b45f5478c045defe05f9dfdab111f005767f",
      "0x9d094d48e88d50df3f45e012379621e0d14c67315cee790055034b191246001c",
      "0x98ffe58e55ca061b5a2f402e3d8e7d8c71d77ce10819509e60acc5fa2c7d833f",
      "0x05e0e970b9a76b622617d9cb8278bb2ef7ce55a9d7638274c28acf3ca5f767c1",
      "0xd0c3d8c99cd476fcd34f316d12e37f04c5f778d3d96db4feaebefc9fcae7deb5",
      "0xff490457071a7641cbcc9caded39c2f0151930d0ff1b7a206fa5e8104ac46c12",
      "0xd8372d2fcc3e3bce9e5fe87dae578b7caf77d931f4016da2aea361ed2c41ea34",
      "0xd06bd6f251fa7e26ed009b49c50b1e5f5e9133d70cd561628033f8fc05255b60",
      "0x14baf3f0a11419f2b3a7a992b2965a2c6871630866561410f5610bdcc2d645ba"
    ]; //  Witnesses for the registered user based on registered users list
    const existingUsersPath = 0; //  Index of the user for considering the case when the user was not the existing user (Can be any non-zero value)
    const existingUsersWitnesses = []; //  Empty list of Witnesses for the user for considering the case when the user was not the existing user
    const productId = 1; //  Product Id of the product, user is going to buy

    const productPrice = await flashSale_instance.productPrice(productId); //  Get the price of the product
    const amountToPay = (productPrice * 80) / 100; //  Calculate the amount, user has to pay/has paid for the product

    // console.log(web3.utils.fromWei(amountToPay.toString(), "ether"));
    const buyAppleProductTx = await flashSale_instance.buyAppleProduct(
      registeredUsersPath,
      existingUsersPath,
      registeredUsersWitnesses,
      existingUsersWitnesses,
      productId,
      { from: accounts[3] }
    ); //  Perform transaction for call to buyAppleProduct() function by user 'accounts[1] i.e. 0xFFcf8FDEE72ac11b5c542428B35EEF5769C409f0'
    // console.log(buyAppleProductTx);

    assert.ok(
      buyAppleProductTx.receipt.status == true,
      "Transaction status is false."
    );
    assert.ok(
      buyAppleProductTx.logs[0].args.productId.toString() ===
        productId.toString(),
      "Product Id mismatch"
    );
    assert.ok(
      buyAppleProductTx.logs[0].args.discountOffered.toString() === "20",
      "Discount Offered mismatch. It should be 20% for registered but not existing users"
    );
    assert.ok(
      buyAppleProductTx.logs[0].args.price.toString() ===
        amountToPay.toString(),
      "Amount Paid for the product mismatch"
    );

    // Test LogPurchaseDetails Event from the above transaction performed explicitly
    truffleAssert.eventEmitted(
      buyAppleProductTx,
      "LogPurchaseDetails",
      async event => {
        assert.ok(
          event.productId.toString() === productId.toString(),
          "Product Id mismatch"
        );
        assert.ok(
          event.discountOffered.toString() === "20",
          "Discount Offered mismatch"
        );
        assert.ok(
          event.price.toString() === amountToPay.toString(),
          "Amount Paid for the product mismatch"
        );
        return (
          event.productId.toString() === productId.toString() &&
          event.discountOffered.toString() === "20" &&
          event.price.toString() === amountToPay.toString()
        );
      },
      "LogPurchaseDetails event emitted successfully..!!"
    );
  });

  // Negative Scenarios
  //  Test case for checking, user should able to buy only 1 product on Flash Day
  it("Check user should able to buy only 1 product", async () => {
    const registeredUsersPath = 15; //  Index of the registered user based on registered users list
    const registeredUsersWitnesses = [
      "0x3834d65a0911f843c8fda7acb88b957c4a5b8692b5652ba0e83702e6a82d2d58",
      "0xe9b79f3c458d7fac2276ec5766a30b67a3690b66b3dcb9352d475a097c1907e4",
      "0xa28969650fe104d21a7737f93c0cd5461335ae1518200379437749c78b70ee05",
      "0xd3563641798131a1ce3240877592440de29ad8399b2152597bd0c5c733b97200",
      "0x05e0e970b9a76b622617d9cb8278bb2ef7ce55a9d7638274c28acf3ca5f767c1",
      "0xd0c3d8c99cd476fcd34f316d12e37f04c5f778d3d96db4feaebefc9fcae7deb5",
      "0xff490457071a7641cbcc9caded39c2f0151930d0ff1b7a206fa5e8104ac46c12",
      "0xd8372d2fcc3e3bce9e5fe87dae578b7caf77d931f4016da2aea361ed2c41ea34",
      "0xd06bd6f251fa7e26ed009b49c50b1e5f5e9133d70cd561628033f8fc05255b60",
      "0x14baf3f0a11419f2b3a7a992b2965a2c6871630866561410f5610bdcc2d645ba"
    ]; //  Witnesses for the registered user based on registered users list
    const existingUsersPath = 14; //  Index of the existing user based on existing users list
    const existingUsersWitnesses = [
      "0xfe172ec0b270fc1e2dfc9f2ace046483c7b302d372b56d678720138f75ce0c40",
      "0xe7eb96a3958b9796ba26f86734e7c1d1aa248415bd6633eb48232463f36b62c1",
      "0x3c2ebabb70e176f7fcadd18ea4733b2c6e84c201e240f74627048dbfe5db5818",
      "0xd715bb7a913531efb75200f82ba3f394bdefc7ad8e6be673a358ff1ee3c8a616",
      "0x9b73ce3d8eac829c0ab99d28d25324f33c41c50aad229868080092c741a0ba02",
      "0xdb31224f31009a089fbafe1d9993cf56abb0772d99d0b63e36b2c14670492b6b",
      "0x7b2cfd6caa0026c8d32ecffab51282f5c463d2d164dc33ab44146b6978231189",
      "0x0c44e5a66beb1854ebe9a9e5bfaee786f470112b8e848ccb920d3d8b32ee58ad",
      "0xa0851ce165d63ccc421e65ccceb37ea8faebb07efa8f962898f8bbfbfeb3b2e7",
      "0xa39e172f13c34acc77af8315389f5768c8d910ba4b829a3149b5c6cdad476900"
    ]; //  Witnesses for the existing user based on existing users list
    const productId = 1; //  Product Id of the product, user is going to buy

    await expectRevert(
      flashSale_instance.buyAppleProduct(
        registeredUsersPath,
        existingUsersPath,
        registeredUsersWitnesses,
        existingUsersWitnesses,
        productId,
        { from: accounts[1] }
      ),
      "Only 1 product allowed to buy on flash sale"
    );
  });

  // Test case for user is not registered for the flash sale
  it("Verifies product Id while purchasing the product", async () => {
    const registeredUsersPath = 15123; //  Index of the registered user based on registered users list
    const registeredUsersWitnesses = []; //  Witnesses for the registered user based on registered users list
    const existingUsersPath = 14123; //  Index of the existing user based on existing users list
    const existingUsersWitnesses = []; //  Witnesses for the existing user based on existing users list
    const productId = 10; //  Invalid Product Id of the product, user is going to buy

    // const wrongRegisteredUse
    await expectRevert(
      flashSale_instance.buyAppleProduct(
        registeredUsersPath,
        existingUsersPath,
        registeredUsersWitnesses,
        existingUsersWitnesses,
        productId,
        { from: accounts[2] }
      ),
      "Product is not available at the store"
    );
  });

  // Test case for user is not registered for the flash sale
  it("Check user is not registered for flash sale", async () => {
    const registeredUsersPath = 15123; //  Index of the registered user based on registered users list
    const registeredUsersWitnesses = []; //  Witnesses for the registered user based on registered users list
    const existingUsersPath = 14123; //  Index of the existing user based on existing users list
    const existingUsersWitnesses = []; //  Witnesses for the existing user based on existing users list
    const productId = 1; //  Product Id of the product, user is going to buy

    // const wrongRegisteredUse
    await expectRevert(
      flashSale_instance.buyAppleProduct(
        registeredUsersPath,
        existingUsersPath,
        registeredUsersWitnesses,
        existingUsersWitnesses,
        productId,
        { from: accounts[2] }
      ),
      "User is not registered for flash sale."
    );
  });

  // Test case for checking whether user is registered or not even if path and witnesses are provided as valid values but of
  // another registered user. (In short, attacker tries to access registered user account for buying the product on flash sale)
  it("Check attacker tries to access registered user account to buy the product", async () => {
    const registeredUsersPath = 15; //  Index of the registered user based on registered users list
    const registeredUsersWitnesses = [
      "0x3834d65a0911f843c8fda7acb88b957c4a5b8692b5652ba0e83702e6a82d2d58",
      "0xe9b79f3c458d7fac2276ec5766a30b67a3690b66b3dcb9352d475a097c1907e4",
      "0xa28969650fe104d21a7737f93c0cd5461335ae1518200379437749c78b70ee05",
      "0xd3563641798131a1ce3240877592440de29ad8399b2152597bd0c5c733b97200",
      "0x05e0e970b9a76b622617d9cb8278bb2ef7ce55a9d7638274c28acf3ca5f767c1",
      "0xd0c3d8c99cd476fcd34f316d12e37f04c5f778d3d96db4feaebefc9fcae7deb5",
      "0xff490457071a7641cbcc9caded39c2f0151930d0ff1b7a206fa5e8104ac46c12",
      "0xd8372d2fcc3e3bce9e5fe87dae578b7caf77d931f4016da2aea361ed2c41ea34",
      "0xd06bd6f251fa7e26ed009b49c50b1e5f5e9133d70cd561628033f8fc05255b60",
      "0x14baf3f0a11419f2b3a7a992b2965a2c6871630866561410f5610bdcc2d645ba"
    ]; //  Witnesses for the registered user based on registered users list
    const existingUsersPath = 14; //  Index of the existing user based on existing users list
    const existingUsersWitnesses = [
      "0xfe172ec0b270fc1e2dfc9f2ace046483c7b302d372b56d678720138f75ce0c40",
      "0xe7eb96a3958b9796ba26f86734e7c1d1aa248415bd6633eb48232463f36b62c1",
      "0x3c2ebabb70e176f7fcadd18ea4733b2c6e84c201e240f74627048dbfe5db5818",
      "0xd715bb7a913531efb75200f82ba3f394bdefc7ad8e6be673a358ff1ee3c8a616",
      "0x9b73ce3d8eac829c0ab99d28d25324f33c41c50aad229868080092c741a0ba02",
      "0xdb31224f31009a089fbafe1d9993cf56abb0772d99d0b63e36b2c14670492b6b",
      "0x7b2cfd6caa0026c8d32ecffab51282f5c463d2d164dc33ab44146b6978231189",
      "0x0c44e5a66beb1854ebe9a9e5bfaee786f470112b8e848ccb920d3d8b32ee58ad",
      "0xa0851ce165d63ccc421e65ccceb37ea8faebb07efa8f962898f8bbfbfeb3b2e7",
      "0xa39e172f13c34acc77af8315389f5768c8d910ba4b829a3149b5c6cdad476900"
    ]; //  Witnesses for the existing user based on existing users list
    const productId = 1; //  Product Id of the product, user is going to buy

    // const wrongRegisteredUse
    await expectRevert(
      flashSale_instance.buyAppleProduct(
        registeredUsersPath,
        existingUsersPath,
        registeredUsersWitnesses,
        existingUsersWitnesses,
        productId,
        { from: accounts[2] }
      ),
      "User is not registered for flash sale."
    );
  });

  // Test case for calculating the gas estimate of existingUsersMerkleRoot() is valid or not
  it("Check gas estimate of existingUsersMerkleRoot() function", async () => {
    const gasEstimate = await flashSale_instance.existingUsersMerkleRoot.estimateGas();
    assert.isBelow(
      gasEstimate,
      23000,
      "Gas estimate for existingUsersMerkleRoot() is not less than 23K"
    );
  });

  // Test case for calculating the gas estimate of registeredUsersMerkleRoot() is valid or not
  it("Check gas estimate of registeredUsersMerkleRoot() function", async () => {
    const gasEstimate = await flashSale_instance.registeredUsersMerkleRoot.estimateGas();
    assert.isBelow(
      gasEstimate,
      23000,
      "Gas estimate for registeredUsersMerkleRoot() is not less than 23K"
    );
  });

  // Test case for calculating the gas estimate of productPrice() is valid or not
  it("Check gas estimate of productPrice() function", async () => {
    const productId = 1;
    const gasEstimate = await flashSale_instance.productPrice.estimateGas(
      productId
    );
    assert.isBelow(
      gasEstimate,
      23000,
      "Gas estimate for productPrice() is not less than 23K"
    );
  });

  // Test case for calculating the gas estimate of userProductInfo() is valid or not
  it("Check gas estimate of userProductInfo() function", async () => {
    const gasEstimate = await flashSale_instance.userProductInfo.estimateGas(
      accounts[1]
    );
    assert.isBelow(
      gasEstimate,
      25000,
      "Gas estimate for userProductInfo() is not less than 25K"
    );
  });
});
