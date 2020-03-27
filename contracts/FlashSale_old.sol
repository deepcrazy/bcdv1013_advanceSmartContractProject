pragma solidity ^0.5.0;


contract FlashSale {
    bytes32 registeredUsersMerkleRoot;
    bytes32 existingUsersMerkleRoot;
    // mapping(address => bool) voted;
    mapping(address => uint8) productId;
    // uint256 yesVotes;
    // uint256 noVotes;
    uint256 users40Off;
    uint256 users20Off;

    constructor(
        bytes32 _registeredUsersMerkleRoot,
        bytes32 _existingUsersMerkleRoot
    ) public {
        registeredUsersMerkleRoot = _registeredUsersMerkleRoot;
        existingUsersMerkleRoot = _existingUsersMerkleRoot;
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

    // function vote(uint256 path, bytes32[] memory witnesses, bool myVote)
    //     public
    // {
    //     require(!voted[msg.sender], "already voted");
    //     voted[msg.sender] = true;

    //     // EDIT ME: validate the proof!

    //     bytes32 candidateRoot = leafHash(msg.sender);
    //     for (uint16 i = 0; i < witnesses.length; i++) {
    //         if ((path & 0x01) == 1) {
    //             candidateRoot = nodeHash(witnesses[i], candidateRoot);
    //         } else {
    //             candidateRoot = nodeHash(candidateRoot, witnesses[i]);
    //         }
    //         path /= 2;
    //     }

    //     require(
    //         candidateRoot == registeredUsersMerkleRoot,
    //         "Merkle Root proof failed"
    //     );

    //     if (myVote) yesVotes++;
    //     else noVotes++;

    // }

    function buyProduct(
        uint256 registeredUserPath,
        uint256 existingUserPath,
        bytes32[] memory registeredUsersWitnesses,
        bytes32[] memory existingUsersWitnesses,
        uint8 _productId
    ) public {
        require(
            productId[msg.sender] == 0,
            "Only 1 product allowed to buy on flash sale"
        );

        bytes32 registeredUserRoot = leafHash(msg.sender);
        bytes32 existingUserRoot = leafHash(msg.sender);
        for (uint16 i = 0; i < registeredUsersWitnesses.length; i++) {
            if ((registeredUserPath & 0x01) == 1) {
                registeredUserRoot = nodeHash(
                    registeredUsersWitnesses[i],
                    registeredUserRoot
                );
            } else {
                registeredUserRoot = nodeHash(
                    registeredUserRoot,
                    registeredUsersWitnesses[i]
                );
            }
            registeredUserPath /= 2;
        }

        for (uint16 i = 0; i < existingUsersWitnesses.length; i++) {
            if ((existingUserPath & 0x01) == 1) {
                existingUserRoot = nodeHash(
                    existingUsersWitnesses[i],
                    existingUserRoot
                );
            } else {
                existingUserRoot = nodeHash(
                    existingUserRoot,
                    existingUsersWitnesses[i]
                );
            }
            existingUserPath /= 2;
        }

        require(
            registeredUserRoot == registeredUsersMerkleRoot,
            "User is not registered for flash sale."
        );
        // require(
        //     existingUserRoot == existingUsersMerkleRoot,
        //     "Merkle Root proof failed"
        // );

        productId[msg.sender] = _productId;
        if (productId[msg.sender] != 0) {
            if (existingUserRoot == existingUsersMerkleRoot) {
                users40Off++;
            } else {
                users20Off;
            }
        }
    }
}
