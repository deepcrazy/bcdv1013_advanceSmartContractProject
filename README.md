# _BCDV 1013 - Advance Smart Contracts Final Assignment_

```
Developed by:
    Name: Deepanshu Gupta
    Student Id: 101253525
    Course: BCDV1013 - Advance Smart Contracts
    Use Case: Flash Sale User Verfification
```

## Introduction

This project's Idea is based on `Flash Sale` generally held on Black Fridays or any Festive Season. Let's consider `Apple Retailer` as a `Retailer` made the annoucement of the _Flash Sale_ on a particular day `(Let's say: 25th December)` and in the annoucement, they mention that the users who will be registered for the offer before `24th December, 7 PM` will receive _20% OFF_ on MRP of the Apple products. <br>
_*Note: The users those who are already our existing customers will receive an additional 20% off on all the Apple Products. Therefore, the existing users are eligible for in total of 40% off on the Apple Products.*_

## Approach

- `Use of Off-chain computation such as merkle trees` as an approach, I have choosen from the options provided and implemented for the project's idea.

**Impementation:** <br>
&ensp;&ensp;&ensp;&ensp; I have implemented the solution for this idea in the following manner. Let's consider the Apple Retailer have the list of the users who have registered for the flash sale `(Lets call these users as registered users)` and Apple Retailer will also have the list of users those who are their existing users`(Lets call these users as existing users)`.
Now, when the users to any of the Apple store, they will check whether the user is registered or not and if registered, then the user is already a existing user or not. On the basis of the user registered or registered and existing user, he will offered discount and will able to buy the Apple Product. <br> <br>
_Note 1: This implementation doesn't involve transfer of money (ethers) as of now and only will let user know that user has purchased the product with the following product details:_

- _Product Id_
- _Discount Offered_
- _Price (Amount Paid)_

_*Note 2: The User can only buy 1 Apple product at discounted price on Flash Sale Day.*_

## High Level Design

- Store the list of registered and existing users off-chain and verify the user in the smart contract using its path (index), witnesses (proof) calculated using the off-chain merkle root computation.
  - User will receive the `path (index)` and `list of Witnesses (acts as proof)` during registration by off-chain computation.
- This will prevent the usage of storage on blockchain and hence makes the smart contract gas efficient.

_Functions implemented_ <br>

1. buyAppleProduct() - Public Function to buy the product
2. leafHash() - Private Function to calculate the leaf hash
3. nodeHash() - Private Function to calculate the node hash
4. calculateCandidateRoot() - Private Function to calculate the candidateRoot to verify the user
5. validateCallerAddress() - Internal Function to validate the user's address is valid address or not.

## Security Considerations and Gas Optimizations:

During the implementation of the smart contract, I have tried to implement it security bug free and therefore, considered some of the following points during implementation:

_Security Considerations_

- Users are verified using Merkle Root concept for verification whether user is registered or not.
  - Further, users are again checked whether the registered users are already the existing users or not.
- Check the user's address if it is zero address or not before doing any operation.
- Used `SafeMath` Library for calculating the discounted price to avoid overflow or underflow.

_Posible Security Attack_:

- Any unknown user or attacker who is not registered and can try to call buyAppleProduct() function.
  - This issue is already considered and is being addressed using off-chain computation of root and proof hashes via merkle tree algorithm.

_Gas Optimizations_

- Instead of storing the list of users on blockchain, users are stored off-chain.
- Calculates the merkle root of the registered and existing users off-chain and deploy the smart contract with these params and verify the user on the basis of path and witnesses provided when call the buyAppleProduct() function.
- Variables are declared from short to large data types (top to bottom).
  - This will prevent gas as it will share slots for storgae and hence less gas will be used.
- Counters and fixed data types are assigned the minimum the storage data type under which there values can be fit to make the smart contract gas efficient.

_MythX Security Check_

- Checked the smart contract using MythX
- Made the variables public to consider their getter functions.
  - This feature allows not the define the getter functions explicitly.<br>
- _Note: Few warnings provided by the MythX are not implemented (75% warning are considered and fixed) as of now and kept under `Future Scope`_

## Steps for deploying and running the project

_List of users used for testing:_

1. 0xFFcf8FDEE72ac11b5c542428B35EEF5769C409f0 (registered and exiting)
2. 0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1 (registered and exiting)
3. 0x22d491Bde2303f2f43325b2108D26f1eAbA1e32b (registered and exiting)
4. 0xd03ea8624C8C5987235048901fB614fDcA89b117 (registered but not exiting)
5. 0xE11BA2b4D45Eaed5996Cd0823791E0C93114882d (registered but not exiting)

**_Steps for running smart contract on Remix explicilty:_**

1. Clone the project by running: <br>
   - git clone https://github.com/deepcrazy/bcdv1013_advanceSmartContractProject.git
2. _Opional Step:_ Add the user's ethereum address apart from the 1st 5 addresses from `ganache-cli -d` as first 1st five addresses are already added into the users registered list and 1st three are already into the existing users list.
3. Run `node users-tree.js root registeredUserAddresses.txt` to get the merke root for the list of registered users.
   - Note: If errors comes regarding `ethers`, then Run `npm install ethers` and again do Step 3 and continue to Step 4 after running Step 3.
4. Run `node users-tree.js root existingUserAddresses.txt` to get the merkle root for the list of existing users.
5. Run `node users-tree.js proof registeredUserAddresses.txt 0xFFcf8FDEE72ac11b5c542428B35EEF5769C409f0` to get the `path` and `witnesses list` for the registered users.
6. Run `node users-tree.js proof existingUserAddresses.txt 0xFFcf8FDEE72ac11b5c542428B35EEF5769C409f0` to get the `path` and `witnesses list` for the existing users.
7. cd `contracts/`
8. Copy `FlashSale.sol` code and `SafeMath.sol` code into Remix IDE.
9. Select Compiler greater than `0.6.0` and click `Compile FlashSale.sol`
10. Deploy the contract.
    - Make sure ganache is running by running `ganache-cli -d`
    - Choose the Environment as `Web3 provider` and provide details where ganache is running locally.
    - Choose Account as `0xFFcf8FDEE72ac11b5c542428B35EEF5769C409f0`.
    - Provide inputs obtained from `Step 3` and `Step 4` before clicking `deploy button`.
    - Click on `Deploy`
11. Call the buyAppleProduct() function:
    - Provide the inputs obtained from `Step 5` and `Step 6` along with productId.
      - Choose productId only from `1 to 5`.
    - Click `transact` button and check the output on console.
12. Call the `userProductInfo` to check the purchase details for the user.

**_Steps for Testing using Truffle:_**

1.  Clone the project by running: <br>
    - git clone https://github.com/deepcrazy/bcdv1013_advanceSmartContractProject.git
2.  Run `ganache-cli -d`. <br>
    - `-d` is used so that accounts remain same for running truffle tests. (Mandatory to use `-d` as of now for testing the project.)
3.  Run `npm install`
4.  Run `npm test` for testing the smart contract using truffle.
