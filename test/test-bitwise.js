// import registeredUsersMerkleRoot from "../migrations/2_deploy_contracts";
const FlashSale = artifacts.require("FlashSale.sol");
const deployContractsFileInstance = require("../migrations/2_deploy_contracts");
const truffleAssert = require("truffle-assertions");
const BigNumber = require("bignumber.js");
const web3 = require("web3");

const registeredUsersMerkleRoot = deployContractsFileInstance.getRegisteredUsersMerkleRoot();
const existingUsersMerkleRoot = deployContractsFileInstance.getExistingUsersMerkleRoot();

// contract("FlashSale", accounts => {
//   it("checks token is deployed", async () => {
//     const flashSale_instance = await FlashSale.deployed(
//     );
//     assert.ok(flashSale_instance.address, "Contract is not deployed..!!");
//   });

//   it("should return the registered user's merkle root", async function() {
//     let loan = await FlashSale.deployed("0xcbe9f791262c5be1860def4ba6ef53b7eb6c7adc365786e167a9a120de746da1", "0xcbe9f791262c5be1860def4ba6ef53b7eb6c7adc365786e167a9a120de746d9y").catch(err => {
//         console.log("1st")
//         console.error(err.message)
//     }
//     );
//     let res = await loan
//       .getRegisteredUsersMerkleRoot()
//       .catch(err => console.error(err.message));
//     assert.equal(
//       res,
//       "0xcbe9f791262c5be1860def4ba6ef53b7eb6c7adc365786e167a9a120de746de",
//       "Registered user merkle root mismatch."
//     );
//     console.log("2nd")
//     console.log(res);
//   });

// //   it("should return the registered user's merkle root", async function() {
// //     let loan = await LoanContract.deployed().catch(err =>
// //       console.error(err.message)
// //     );
// //     let res = await loan
// //       .getRegisteredUsersMerkleRoot()
// //       .catch(err => console.error(err.message));
// //     // assert.equal(res,true, "Contract owner set properly")
// //     console.log(res);
// //   });
// });

contract("FlashSale", (accounts) => {
  let flashSale_instance;
  before(() => {
    return FlashSale.deployed().then(instance => {
      flashSale_instance = instance;
    });
  });

  it("checks 'FlashSale' Contract is deployed", async () => {
    assert.equal(
      flashSale_instance.address.length,
      42,
      "Incorrent address - Length of address mismatch"
    );
    console.log("Contract Address: " + flashSale_instance.address.toString())
    assert.ok(flashSale_instance.address, "Contract is not deployed..!!");
  });

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

  it("should check buyAppleProduct() function", async () => {
    const registeredUsersPath = 15;
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
    ];
    const existingUsersPath = 14;
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
    ];
    const productId = 1;
    console.log("--------------------Test Case 5-----------------------------")
    console.log("0xFFcf8FDEE72ac11b5c542428B35EEF5769C409f0");
    console.log(accounts[1]);
    const productPrice = await flashSale_instance.productPrice(productId);
    console.log("Product price: " + productPrice);
    const amountToPay = (productPrice * 60) / 100;
    console.log(amountToPay);
    console.log(web3.utils.fromWei(amountToPay.toString(), 'ether'));
    const buyAppleProductTx = await flashSale_instance.buyAppleProduct(registeredUsersPath,
        existingUsersPath,
        registeredUsersWitnesses,
        existingUsersWitnesses,
        productId,
        {from : accounts[1]});
    // console.log(buyAppleProductTx);

    // Test case for checking Transfer Event
    truffleAssert.eventEmitted(
        buyAppleProductTx,
        "LogPurchaseDetails",
        async (event) => {
            assert.ok(event.productId.toString() === productId.toString());
            assert.ok(event.discountOffered.toString() === "40", "Discount mismatch");
            assert.ok(event.price.toString() === amountToPay.toString());
          return (
            event.productId.toString() === productId.toString() &&
            event.discountOffered.toString() === "40" &&
            event.price.toString() === amountToPay.toString()
          );
        },
        "Transfer event emitted successfully..!!"
      );
  });

  // it('getRegisteredUsersMerkleRoot() should pass', async () => {
  //     // const myNumber = 250;
  //     // const gas = await bitwise.countBitSet.estimateGas(myNumber);
  //     // const gasAsm = await bitwise.countBitSetAsm.estimateGas(myNumber);
  //     // expect(gas).to.be.gt(gasAsm, "Assembly should be more gas efficient");

  //     const gas = await flashSale_instance.getRegisteredUsersMerkleRoot.estimateGas();
  //     console.log("gas estimating");
  //     console.log(gas);

  //     const registeredUserMerkleRoot = await flashSale_instance.getRegisteredUsersMerkleRoot();
  //     console.log("printing merkle root")
  //     console.log(registeredUserMerkleRoot);
  //     assert.ok(registeredUserMerkleRoot, "Registered User's Merkle Root is not correct")
  //     // const resultAsm = await bitwise.countBitSetAsm(myNumber);
  //     // expect(result).to.be.a.bignumber.that.equal(resultAsm, "result should match");
  // })

  // it('countBitSet() should pass', async () => {
  //     const myNumber = 0;
  //     const result = await bitwise.countBitSet(myNumber);
  //     const resultAsm = await bitwise.countBitSetAsm(myNumber);
  //     assert.equal(result, myNumber, "result should match");
  //     assert.equal(resultAsm, myNumber, "result should match");
  //     expect(result).to.be.a.bignumber.that.equal(resultAsm, "result should match");
  // })
});

// const BitWise = artifacts.require('FlashSale');
// const { BN } = require('@openzeppelin/test-helpers');
// const chaiBN = require('chai-bn')(BN);
// require('chai').use(chaiBN);
// const { expect } = require('chai');

// contract("BitWise", () =>{
//     let bitwise;
//    before(() => {
//         return BitWise.deployed().then(instance => {
//             bitwise = instance;
//         })
//     })

//     it('countBitSet() should pass', async () => {
//         const myNumber = 250;
//         const gas = await bitwise.countBitSet.estimateGas(myNumber);
//         const gasAsm = await bitwise.countBitSetAsm.estimateGas(myNumber);
//         expect(gas).to.be.gt(gasAsm, "Assembly should be more gas efficient");

//         const result = await bitwise.countBitSet(myNumber);
//         const resultAsm = await bitwise.countBitSetAsm(myNumber);
//         expect(result).to.be.a.bignumber.that.equal(resultAsm, "result should match");
//     })

//     it('countBitSet() should pass', async () => {
//         const myNumber = 0;
//         const result = await bitwise.countBitSet(myNumber);
//         const resultAsm = await bitwise.countBitSetAsm(myNumber);
//         assert.equal(result, myNumber, "result should match");
//         assert.equal(resultAsm, myNumber, "result should match");
//         expect(result).to.be.a.bignumber.that.equal(resultAsm, "result should match");
//     })
// })


// it("deployment gas optimization correct", async () => {
//   //test that the assembly code costs less gas than the non-assembly code
//   //https://ethereum.stackexchange.com/questions/36270/how-can-i-get-the-gas-cost-of-contract-creation-within-truffle-migrations-tes

//   //deploy contracts
//   const funcGas = await StringFunctions.new();
//   const assemGas = await StringFunctionsAssembly.new();

//   //get transaction receipts
//   const funcReceipt = await web3.eth.getTransactionReceipt(
//     funcGas.transactionHash
//   );
//   const assemReceipt = await web3.eth.getTransactionReceipt(
//     assemGas.transactionHash
//   );

//   //print gas costs
//   logOutput(
//     "Assembly:",
//     assemReceipt.gasUsed,
//     "Non-Assembly:",
//     funcReceipt.gasUsed
//   );
//   assert.isBelow(
//     assemReceipt.gasUsed,
//     funcReceipt.gasUsed,
//     "deployment gas consumption is less for assembly"
//   );
// });