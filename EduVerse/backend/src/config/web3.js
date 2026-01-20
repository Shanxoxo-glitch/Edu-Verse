const { ethers } = require('ethers');
const Web3 = require('web3');

// Initialize providers
const getProvider = () => {
  const rpcUrl = process.env.NODE_ENV === 'production' 
    ? process.env.POLYGON_RPC_URL 
    : process.env.POLYGON_TESTNET_RPC_URL;
  
  return new ethers.JsonRpcProvider(rpcUrl);
};

const getWeb3Provider = () => {
  const rpcUrl = process.env.NODE_ENV === 'production' 
    ? process.env.POLYGON_RPC_URL 
    : process.env.POLYGON_TESTNET_RPC_URL;
  
  return new Web3(rpcUrl);
};

// Get wallet for contract interactions
const getWallet = () => {
  const provider = getProvider();
  return new ethers.Wallet(process.env.PRIVATE_KEY, provider);
};

// Verify wallet signature
const verifySignature = (message, signature, address) => {
  try {
    const recoveredAddress = ethers.verifyMessage(message, signature);
    return recoveredAddress.toLowerCase() === address.toLowerCase();
  } catch (error) {
    console.error('Signature verification error:', error);
    return false;
  }
};

// Generate authentication message
const generateAuthMessage = (address, nonce) => {
  return `Welcome to EduVerse!\n\nSign this message to authenticate your wallet.\n\nWallet: ${address}\nNonce: ${nonce}\n\nThis request will not trigger a blockchain transaction or cost any gas fees.`;
};

// Check if address is valid
const isValidAddress = (address) => {
  return ethers.isAddress(address);
};

// Get contract instance
const getContract = (contractAddress, abi) => {
  const wallet = getWallet();
  return new ethers.Contract(contractAddress, abi, wallet);
};

// Format ether amounts
const formatEther = (wei) => {
  return ethers.formatEther(wei);
};

const parseEther = (ether) => {
  return ethers.parseEther(ether.toString());
};

module.exports = {
  getProvider,
  getWeb3Provider,
  getWallet,
  verifySignature,
  generateAuthMessage,
  isValidAddress,
  getContract,
  formatEther,
  parseEther
};
