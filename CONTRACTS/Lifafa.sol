// SPDX-License-Identifier: GPL-3.0
pragma solidity 0.8.20;

import "@chainlink/contracts/src/v0.8/vrf/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

contract Lifafa is VRFConsumerBaseV2 {
    struct Envelope {
        uint256 amount;
        uint256 creationTime;
        uint256 timeLimit;
        address creator;
        address token;
        mapping(address => bool) claimed;
    }
    struct RequestStatus {
        bool fulfilled;
        bool exists;
        uint256[] randomWords;
        uint256 envelopeId;
        address claimerAddress;
        uint256 claimedAmount;
    }

    VRFCoordinatorV2Interface COORDINATOR;
    uint64 s_subscriptionId;
    uint256[] public requestIds;
    uint256 public lastRequestId;
    bytes32 keyHash =
        0x4b09e658ed251bcafeebbc69400383d49f344ace09b9576fe248bb02c003fe9f;
    uint32 callbackGasLimit = 2500000;
    uint16 requestConfirmations = 3;
    uint32 numWords = 1;

    event EnvelopeCreated(uint256 id);
    event RequestSent(uint256 requestId, uint32 numWords);
    event RequestFulfilled(uint256 requestId, uint256[] randomWords);

    mapping(uint256 => Envelope) public envelopes;
    mapping(address => uint256[]) public history;
    mapping(uint256 => RequestStatus) public s_requests;

    constructor(
        uint64 subscriptionId
    ) VRFConsumerBaseV2(0x7a1BaC17Ccc5b313516C5E16fb24f7659aA5ebed) {
        COORDINATOR = VRFCoordinatorV2Interface(
            0x7a1BaC17Ccc5b313516C5E16fb24f7659aA5ebed
        );
        s_subscriptionId = subscriptionId;
    }

    function fulfillRandomWords(
        uint256 _requestId,
        uint256[] memory _randomWords
    ) internal override {
        require(s_requests[_requestId].exists, "request not found");
        s_requests[_requestId].fulfilled = true;
        s_requests[_requestId].randomWords = _randomWords;
        //
        uint256 _id = s_requests[_requestId].envelopeId;

        uint256 claimAmount = _randomWords[0] % (envelopes[_id].amount);
        s_requests[_requestId].claimedAmount = claimAmount;
        envelopes[_id].amount -= claimAmount;
        envelopes[_id].claimed[msg.sender] = true;

        (bool sent, ) = payable(s_requests[_requestId].claimerAddress).call{
            value: claimAmount
        }("");
        require(sent, "Failed to send Ether");

        emit RequestFulfilled(_requestId, _randomWords);
        // return claimAmount;
    }

    function getRequestStatus(
        uint256 _requestId
    ) external view returns (bool fulfilled, uint256[] memory randomWords) {
        require(s_requests[_requestId].exists, "request not found");
        RequestStatus memory request = s_requests[_requestId];
        return (request.fulfilled, request.randomWords);
    }

    function createEnvelope(
        uint256 _timeLimitInSeconds,
        address _token
    ) public payable returns (uint256) {
        require(msg.value > 0, "Amount should be greater than 0");

        uint256 id = uint256(
            keccak256(abi.encodePacked(block.timestamp, msg.sender))
        ) % (10 ** 18);

        envelopes[id].amount = msg.value;
        envelopes[id].creationTime = block.timestamp;
        envelopes[id].timeLimit = _timeLimitInSeconds;
        envelopes[id].creator = msg.sender;
        envelopes[id].token = _token;

        emit EnvelopeCreated(id);

        history[msg.sender].push(id);
        return id;
    }

    function claim(uint256 _id) public returns (uint256 requestId) {
        require(!isInvalidID(_id), "Invalid ID");
        require(getTimeLeft(_id) > 0, "Time limit exceeded");
        require(envelopes[_id].amount > 0, "No funds available");
        require(!envelopes[_id].claimed[msg.sender], "Already claimed");

        if (envelopes[_id].token != address(0)) {
            require(
                IERC721(envelopes[_id].token).balanceOf(msg.sender) > 0,
                "Must own the specified token to claim"
            );
        }

        requestId = COORDINATOR.requestRandomWords(
            keyHash,
            s_subscriptionId,
            requestConfirmations,
            callbackGasLimit,
            numWords
        );
        s_requests[requestId] = RequestStatus({
            randomWords: new uint256[](0),
            exists: true,
            fulfilled: false,
            envelopeId: _id,
            claimedAmount: 0,
            claimerAddress: msg.sender
        });
        requestIds.push(requestId);
        lastRequestId = requestId;
        emit RequestSent(requestId, numWords);
        return requestId;
    }

    function addToEnvelope(uint256 _id) public payable {
        require(!isInvalidID(_id), "Invalid ID");
        require(msg.value > 0, "Amount should be greater than 0");
        require(getTimeLeft(_id) > 0, "Envelope has expired");

        envelopes[_id].amount += msg.value;
    }

    function reclaim(uint256 _id) public returns (uint256) {
        require(!isInvalidID(_id), "Invalid ID");
        require(
            msg.sender == envelopes[_id].creator,
            "Only the creator can reclaim"
        );
        require(
            block.timestamp >
                envelopes[_id].creationTime + envelopes[_id].timeLimit,
            "Cannot reclaim before time limit"
        );

        uint256 remainingAmount = envelopes[_id].amount;
        envelopes[_id].amount = 0;
        (bool sent, ) = payable(msg.sender).call{value: remainingAmount}("");
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
