pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SimpleERC721Token is ERC721, Ownable {
    uint256 private _tokenIdCounter;
    address private _trustedFactory;

    constructor(address trustedFactory) ERC721("SimpleERC721Token", "SET") Ownable(msg.sender) {
        _trustedFactory = trustedFactory;
    }

    function mint(address to) public {
        require(msg.sender == owner() || msg.sender == _trustedFactory, "Not authorized");
        _safeMint(to, _tokenIdCounter);
        _tokenIdCounter++;
    }
}

contract SimpleERC721TokenFactory {

    mapping(address=>bool) public claimed;
    mapping(address=>SimpleERC721Token) public ERC_Address;


    function createSimpleERC721Token() public {
        require(!claimed[msg.sender],"NFT Contract already exists for the address");
        SimpleERC721Token newToken = new SimpleERC721Token(address(this));
        // Transfer ownership to the caller
        newToken.transferOwnership(msg.sender);
        claimed[msg.sender] = true;
        ERC_Address[msg.sender] = newToken;
    }

    function mint(address _to) public{
        require(claimed[msg.sender],"NFT Contract Not created for the address");
        ERC_Address[msg.sender].mint(_to);
    }

    function getNFTAddress(address _id) public view returns(address){
        require(claimed[_id],"NFT Contract Not created for the address");
        return address(ERC_Address[_id]);
    }

    function getClaimed() public view returns(bool){
        return claimed[msg.sender];
    }
}