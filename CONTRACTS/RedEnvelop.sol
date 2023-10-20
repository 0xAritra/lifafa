pragma solidity ^0.8.20;
 
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
 
contract RedEnvelope {
 
    struct Envelope {
        uint256 amount;
        uint256 creationTime;
        uint256 timeLimit;
        address creator;
        address token;
        mapping(address => bool) claimed;
    }
 
    event EnvelopeCreated(uint256 id);
 
    mapping(uint256 => Envelope) public envelopes;
    mapping(address => uint256[]) public history;
 
    function createEnvelope(uint256 _timeLimitInSeconds, address _token) public payable returns (uint256) {
        require(msg.value > 0, "Amount should be greater than 0");
 
        uint256 id = uint256(keccak256(abi.encodePacked(block.timestamp, msg.sender))) % (10**18);
 
        envelopes[id].amount = msg.value;
        envelopes[id].creationTime = block.timestamp;
        envelopes[id].timeLimit = _timeLimitInSeconds;
        envelopes[id].creator = msg.sender;
        envelopes[id].token = _token;
 
        emit EnvelopeCreated(id);

        history[msg.sender].push(id);
        return id;
    }

    function claim(uint256 _id) public returns (uint256) {
        require(!isInvalidID(_id), "Invalid ID");
        require(getTimeLeft(_id) > 0, "Time limit exceeded");
        require(envelopes[_id].amount > 0, "No funds available");
        require(!envelopes[_id].claimed[msg.sender], "Already claimed");
 
        if (envelopes[_id].token != address(0)) {
            require(IERC721(envelopes[_id].token).balanceOf(msg.sender) > 0, "Must own the specified token to claim");
        }
 
        uint256 claimAmount = getRandomAmount(envelopes[_id].amount);
        envelopes[_id].amount -= claimAmount;
        envelopes[_id].claimed[msg.sender] = true;
 
        payable(msg.sender).transfer(claimAmount);
        return claimAmount;
    }

    function addToEnvelope(uint256 _id) public payable {
        require(!isInvalidID(_id), "Invalid ID");
        require(msg.value > 0, "Amount should be greater than 0");
        require(getTimeLeft(_id) > 0, "Envelope has expired");

        envelopes[_id].amount += msg.value;
    }
 
    function reclaim(uint256 _id) public {
        require(!isInvalidID(_id), "Invalid ID");
        require(msg.sender == envelopes[_id].creator, "Only the creator can reclaim");
        require(block.timestamp > envelopes[_id].creationTime + envelopes[_id].timeLimit, "Cannot reclaim before time limit");
 
        uint256 remainingAmount = envelopes[_id].amount;
        envelopes[_id].amount = 0;
        (bool sent, bytes memory data) = payable(msg.sender).call{value: remainingAmount}("");
        require(sent, "Failed to send Ether");
        return remainingAmount;
    } 
 
    function getRandomAmount(uint256 _max) private view returns (uint256) {
        return uint256(keccak256(abi.encodePacked(block.timestamp))) % _max;
    }

    function getTimeLeft(uint256 _id) public view returns (uint256) {
        require(!isInvalidID(_id), "Invalid ID");
        uint256 currentTime = block.timestamp;
        uint256 creationTime = envelopes[_id].creationTime;
        uint256 timeLimit = envelopes[_id].timeLimit;
        
        if (currentTime > creationTime + timeLimit) {
            return 0;
        } else {
            return creationTime + timeLimit - currentTime;
        }
    }

    function isInvalidID(uint256 _id) public view returns (bool) {
        return envelopes[_id].creator == address(0);
    }

    function getRemainingAmount(uint256 _id) public view returns (uint256) {
        require(!isInvalidID(_id), "Invalid ID");
        return envelopes[_id].amount;
    }

    function getHistory() public view returns (uint256[] memory) {
        return history[msg.sender];
    }
}