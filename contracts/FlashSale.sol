pragma solidity ^0.6.0;

import "./SafeMath.sol";

struct UserProduct {
    uint8 productId;
    uint8 discount;
    uint256 price;
}

contract FlashSale {
    
    address owner;
    bytes32 registeredUsersMerkleRoot;
    bytes32 existingUsersMerkleRoot;
    
    uint256 users40Off;
    uint256 usersOff20;
    // mapping(address => uint8) productId;                //  mapping of user with the productId
    mapping (uint8 => uint256) productPrice;            //  mapping of productId with the price
    mapping (address => UserProduct) userProductInfo;   //  mapping of user to the product details user purchased.
    

    constructor(bytes32 _registeredUsersMerkleRoot, bytes32 _existingUsersMerkleRoot) public {
        registeredUsersMerkleRoot = _registeredUsersMerkleRoot;
        existingUsersMerkleRoot = _existingUsersMerkleRoot;
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

    function leafHash(address leaf) private pure returns (bytes32) {
        return keccak256(abi.encodePacked(uint8(0x00), leaf));
    }

    function nodeHash(bytes32 left, bytes32 right)
        private
        pure
        returns (bytes32)
    {
        return keccak256(abi.encodePacked(uint8(0x01), left, right));
    }

    // 0: No product
    // 1: iPhone
    // 2: iPad
    // 3: Macbook Pro
    // 4: Macbook Air
    // 5: Airpods
    function buyAppleProduct(uint256 registeredUserPath, uint256 existingUserPath, bytes32[] memory registeredUsersWitnesses, bytes32[] memory existingUsersWitnesses, uint8 _productId)
        public returns (uint8 productId, uint8 discount, uint256 price)
    {
        validateCallerAddress(msg.sender);
        require(userProductInfo[msg.sender].productId == 0, "Only 1 product allowed to buy on flash sale");
        require(_productId > 0 && _productId <= 5, "Product is not available at the store");
        
        bytes32 registeredUserRoot = leafHash(msg.sender);
        for (uint16 i = 0; i < registeredUsersWitnesses.length; i++) {
            if ((registeredUserPath & 0x01) == 1) {
                registeredUserRoot = nodeHash(registeredUsersWitnesses[i], registeredUserRoot);
            } else {
                registeredUserRoot = nodeHash(registeredUserRoot, registeredUsersWitnesses[i]);
            }
            registeredUserPath /= 2;
        }
        
        require(
            registeredUserRoot == registeredUsersMerkleRoot,
            "User is not registered for flash sale."
        );
        
        bytes32 existingUserRoot = leafHash(msg.sender);
        for (uint16 i = 0; i < existingUsersWitnesses.length; i++) {
            if ((existingUserPath & 0x01) == 1) {
                existingUserRoot = nodeHash(existingUsersWitnesses[i], existingUserRoot);
            } else {
                existingUserRoot = nodeHash(existingUserRoot, existingUsersWitnesses[i]);
            }
            existingUserPath /= 2;
        }
        
        if (existingUserRoot == existingUsersMerkleRoot) {
            userProductInfo[msg.sender].productId = _productId;
            userProductInfo[msg.sender].discount = 40;
            userProductInfo[msg.sender].price = SafeMath.div(SafeMath.mul(productPrice[_productId], 60), 100);
            users40Off++;
        }
        else {
            userProductInfo[msg.sender].productId = _productId;
            userProductInfo[msg.sender].discount = 20;
            userProductInfo[msg.sender].price = SafeMath.div(SafeMath.mul(productPrice[_productId], 80), 100);
            usersOff20++;
        }
        
        return (userProductInfo[msg.sender].productId, userProductInfo[msg.sender].discount, userProductInfo[msg.sender].price);

    }
}
