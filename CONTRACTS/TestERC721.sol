pragma solidity ^0.8.20;
 
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
 
contract SimpleERC721Token is ERC721, Ownable {
    uint256 private _tokenIdCounter;
 
    constructor() ERC721("SimpleERC721Token", "SET") Ownable(msg.sender) {}
 
    function mint(address to) public onlyOwner {
        _safeMint(to, _tokenIdCounter);
        _tokenIdCounter++;
    }
}