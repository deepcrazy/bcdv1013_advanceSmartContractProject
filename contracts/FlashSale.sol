pragma solidity ^0.6.0;

import "./SafeMath.sol";

struct UserProduct {
    uint8 productId;
    uint8 discount;
    uint256 price;
}

contract FlashSale {
    bytes32 public registeredUsersMerkleRoot; //  Merkle Root of list of registered users
    bytes32 public existingUsersMerkleRoot; //  Merkle Root of list of existing users
    uint256 users40Off; //  Track of number of users purchased the product at 40%
    uint256 usersOff20; //  Track of number of users purchased the product at 20%

    mapping(uint8 => uint256) public productPrice; //  mapping of productId with the price
    mapping(address => UserProduct) public userProductInfo; //  mapping of user to the product details user purchased.

    event LogPurchaseDetails(
        uint8 productId,
        uint8 discountOffered,
        uint256 price
    ); //  Event to log the Purchase Details of the product user has purchased.

    //  Constructor to be called during deploying
    constructor(
        bytes32 _registeredUsersMerkleRoot,
        bytes32 _existingUsersMerkleRoot
    ) public {
        registeredUsersMerkleRoot = _registeredUsersMerkleRoot; //  Set the registered users merkle root
        existingUsersMerkleRoot = _existingUsersMerkleRoot; //  Set the exisiting users merkle root
        //  Set the price of the 5 products.
        // 0: No product
        // 1: iPhone
        // 2: iPad
        // 3: Macbook Pro
        // 4: Macbook Air
        // 5: Airpods
        productPrice[1] = 6 ether;
        productPrice[2] = 3 ether;
        productPrice[3] = 11 ether;
        productPrice[4] = 9 ether;
        productPrice[5] = 1 ether;
    }

    /// @notice Check user/owner address is zero or not
    /// @param _address An address for whom to validate it is zero or not.
    function validateCallerAddress(address _address) internal pure {
        require(_address != address(0), "Error: User is of zero address.");
        return;
    }

    /// @notice Calculates the leaf Hash of the user
    /// @param leaf Address of the user
    /// @return bytes32 Leaf Hash of the user
    function leafHash(address leaf) private pure returns (bytes32) {
        return keccak256(abi.encodePacked(uint8(0x00), leaf));
    }

    /// @notice Calculates the node Hash of the user
    /// @param left Address or Witness of the user (based on data '0x00 and 0x01')
    /// @param right Witness or address of the user (based on data '0x01 and 0x00')
    /// @return bytes32 Node Hash of the user
    function nodeHash(bytes32 left, bytes32 right)
        private
        pure
        returns (bytes32)
    {
        return keccak256(abi.encodePacked(uint8(0x01), left, right));
    }

    /// @notice Calculates the candidate root of the user
    /// @param  _path Path (Index) for the registered/existing user in the regisered/existing users list
    /// @param  _witnesses Witnesses for the users from registered/ existing users list
    /// @param _userAddress Address of the user
    /// @return  bytes32 Candidate root of the user
    function calculateCandidateRoot(
        uint256 _path,
        bytes32[] memory _witnesses,
        address _userAddress
    ) private pure returns (bytes32) {
        // Assigning local variabless
        // Reason: Security/No-assign-param”: Avoid assigning to function parameters
        uint256 path = _path;
        bytes32[] memory witnesses = _witnesses;
        address userAddress = _userAddress;
        bytes32 candidateRoot = leafHash(userAddress); //  Calculates the leaf Hash of the user
        for (uint16 i = 0; i < witnesses.length; i++) {
            if ((path & 0x01) == 1) {
                //  Calculates the node hash of the user, if data is '0x01'
                candidateRoot = nodeHash(witnesses[i], candidateRoot);
            } else {
                //  Calculates the node hash of the user, if data is '0x00'
                candidateRoot = nodeHash(candidateRoot, witnesses[i]);
            }
            path /= 2;
        }
        return candidateRoot;
    }

    /// @notice Function to buy the product. Verifies user and Calculates product discounted price
    /// @param  registeredUserPath  Path (Index) of the registered user from the registered users list (computed off-chain)
    /// @param  existingUserPath    Path (Index) of the existing user from the existing users list (computed off-chain)
    /// @param  registeredUsersWitnesses    Witnesses for the registered user based on the registered users list (computed off-chain)
    /// @param  existingUsersWitnesses  Witnesses for the existing user based on the existing users list (computed off-chain)
    /// @param  _productId  Product Id (1,2,3,4,5) of the product users wants to purchase
    /// @return productId   Product Id of the product, user has purchased
    /// @return discount    Discount offered to the user
    /// @return price   Price (amount paid or amount to pay) of  the product by the user
    function buyAppleProduct(
        uint256 registeredUserPath,
        uint256 existingUserPath,
        bytes32[] memory registeredUsersWitnesses,
        bytes32[] memory existingUsersWitnesses,
        uint8 _productId
    ) public returns (uint8 productId, uint8 discount, uint256 price) {
        validateCallerAddress(msg.sender); //  Validate the user's address
        require(
            userProductInfo[msg.sender].productId == 0,
            "Only 1 product allowed to buy on flash sale"
        ); //  User can buy 1 product during the Flash Sale
        require(
            _productId > 0 && _productId <= 5,
            "Product is not available at the store"
        ); //  Check for the Product Id user want to buy

        bytes32 registeredUserRoot = calculateCandidateRoot(
            registeredUserPath,
            registeredUsersWitnesses,
            msg.sender
        );
        require(
            registeredUserRoot == registeredUsersMerkleRoot,
            "User is not registered for flash sale."
        ); //  Verifies the user is registered and user is present in the registered users list stored off-chain

        bytes32 existingUserRoot = calculateCandidateRoot(
            existingUserPath,
            existingUsersWitnesses,
            msg.sender
        );

        //  Verifies the user is existing user or not. If yes, then he will get 40% off else he will get 20% on the product
        if (existingUserRoot == existingUsersMerkleRoot) {
            userProductInfo[msg.sender].productId = _productId; //  Set the product Id
            userProductInfo[msg.sender].discount = 40; //  Set the discount Offered
            userProductInfo[msg.sender].price = SafeMath.div(
                SafeMath.mul(productPrice[_productId], 60),
                100
            ); //  Set the amount has to pay/ has paid for the product
            users40Off++; //  Increment the number of user purchased product at 40% off
        } else {
            userProductInfo[msg.sender].productId = _productId; //  Set the product Id
            userProductInfo[msg.sender].discount = 20; //  Set the discount Offered
            userProductInfo[msg.sender].price = SafeMath.div(
                SafeMath.mul(productPrice[_productId], 80),
                100
            ); //  Set the amount has to pay/ has paid for the product
            usersOff20++; //  Increment the number of user purchased product at 20% off
        }

        emit LogPurchaseDetails(
            userProductInfo[msg.sender].productId,
            userProductInfo[msg.sender].discount,
            userProductInfo[msg.sender].price
        ); //  Emit the event for the purchase details of the user
        return (
            userProductInfo[msg.sender].productId,
            userProductInfo[msg.sender].discount,
            userProductInfo[msg.sender].price
        );
    }
}
