import useMessage from "antd/es/message/useMessage";
import useNotification from "antd/es/notification/useNotification";
import { ethers} from 'ethers';
import { Web3Provider } from "@ethersproject/providers";
import { getAddress } from "ethers";

const { createContext, useState } = require("react");


const GlobalContext = createContext();

const GlobalContextProvider = (props) => {
    const [message, messageProvider] = useMessage();
    const [notification, notificationProvider] = useNotification();

    const abi = [
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "_id",
                    "type": "uint256"
                }
            ],
            "name": "addToEnvelope",
            "outputs": [],
            "stateMutability": "payable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "_id",
                    "type": "uint256"
                }
            ],
            "name": "claim",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "_timeLimitInSeconds",
                    "type": "uint256"
                },
                {
                    "internalType": "address",
                    "name": "_token",
                    "type": "address"
                }
            ],
            "name": "createEnvelope",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "stateMutability": "payable",
            "type": "function"
        },
        {
            "inputs": [],
            "stateMutability": "nonpayable",
            "type": "constructor"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "owner",
                    "type": "address"
                }
            ],
            "name": "OwnableInvalidOwner",
            "type": "error"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "account",
                    "type": "address"
                }
            ],
            "name": "OwnableUnauthorizedAccount",
            "type": "error"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": false,
                    "internalType": "uint256",
                    "name": "id",
                    "type": "uint256"
                },
                {
                    "indexed": false,
                    "internalType": "uint256",
                    "name": "amount",
                    "type": "uint256"
                },
                {
                    "indexed": false,
                    "internalType": "uint256",
                    "name": "creationTime",
                    "type": "uint256"
                },
                {
                    "indexed": false,
                    "internalType": "uint256",
                    "name": "timeLimit",
                    "type": "uint256"
                },
                {
                    "indexed": false,
                    "internalType": "address",
                    "name": "creator",
                    "type": "address"
                },
                {
                    "indexed": false,
                    "internalType": "address",
                    "name": "token",
                    "type": "address"
                },
                {
                    "indexed": false,
                    "internalType": "bool",
                    "name": "alreadyClaimed",
                    "type": "bool"
                },
                {
                    "indexed": false,
                    "internalType": "uint256",
                    "name": "balance",
                    "type": "uint256"
                }
            ],
            "name": "ClaimAttempt",
            "type": "event"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": false,
                    "internalType": "uint256",
                    "name": "id",
                    "type": "uint256"
                }
            ],
            "name": "EnvelopeCreated",
            "type": "event"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": true,
                    "internalType": "address",
                    "name": "previousOwner",
                    "type": "address"
                },
                {
                    "indexed": true,
                    "internalType": "address",
                    "name": "newOwner",
                    "type": "address"
                }
            ],
            "name": "OwnershipTransferred",
            "type": "event"
        },
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "_id",
                    "type": "uint256"
                }
            ],
            "name": "reclaim",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "renounceOwnership",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "newOwner",
                    "type": "address"
                }
            ],
            "name": "transferOwnership",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "name": "envelopes",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "amount",
                    "type": "uint256"
                },
                {
                    "internalType": "uint256",
                    "name": "creationTime",
                    "type": "uint256"
                },
                {
                    "internalType": "uint256",
                    "name": "timeLimit",
                    "type": "uint256"
                },
                {
                    "internalType": "address",
                    "name": "creator",
                    "type": "address"
                },
                {
                    "internalType": "address",
                    "name": "token",
                    "type": "address"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "getHistory",
            "outputs": [
                {
                    "internalType": "uint256[]",
                    "name": "",
                    "type": "uint256[]"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "_id",
                    "type": "uint256"
                }
            ],
            "name": "getRemainingAmount",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "_id",
                    "type": "uint256"
                }
            ],
            "name": "getTimeLeft",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "",
                    "type": "address"
                },
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "name": "history",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "_id",
                    "type": "uint256"
                }
            ],
            "name": "isInvalidID",
            "outputs": [
                {
                    "internalType": "bool",
                    "name": "",
                    "type": "bool"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "owner",
            "outputs": [
                {
                    "internalType": "address",
                    "name": "",
                    "type": "address"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        }
    ];
    const contractAddress = '0xDE802Ee8fa7ff6bD39AE1CdED82AD505CafA5fFd';

    const provider = new Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, abi, signer);

    // Function to create an envelope
async function createEnvelope(timeLimitInSeconds, token) {
    const tx = await contract.createEnvelope(timeLimitInSeconds, token, { value: ethers.parseEther('1') });
    await tx.wait();
  }
  
  // Function to claim an envelope
  async function claim(id) {
    const tx = await contract.claim(id);
    await tx.wait();
  }
  
  // Function to add to an envelope
  async function addToEnvelope(id) {
    const tx = await contract.addToEnvelope(id, { value: ethers.parseEther('1') });
    await tx.wait();
  }
  
  // Function to reclaim an envelope
  async function reclaim(id) {
    const tx = await contract.reclaim(id);
    await tx.wait();
  }
  
  // Function to get time left for an envelope
  async function getTimeLeft(id) {
    const timeLeft = await contract.getTimeLeft(id);
    console.log('Time left:', timeLeft.toString());
  }
  
  // Function to check if an ID is invalid
  async function isInvalidID(id) {
    const isInvalid = await contract.isInvalidID(id);
    console.log('Is invalid ID:', isInvalid);
  }
  
  // Function to get remaining amount in an envelope
  async function getRemainingAmount(id) {
    const remainingAmount = await contract.getRemainingAmount(id);
    console.log('Remaining amount:', ethers.formatEther(remainingAmount));
  }
  
  // Function to get history of envelopes for the current user
  async function getHistory() {
    const history = await contract.getHistory();
    console.log('History:', history);
  }


    return (
        <GlobalContext.Provider value={{ message, notification, createEnvelope, claim, addToEnvelope, reclaim, getTimeLeft, isInvalidID, getRemainingAmount, getHistory  }}>
            {props.children}
            {messageProvider}
            {notificationProvider}
        </GlobalContext.Provider>
    )
}

export { GlobalContext, GlobalContextProvider };