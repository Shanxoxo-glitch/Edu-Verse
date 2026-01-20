const axios = require('axios');
const FormData = require('form-data');

// Upload JSON data to IPFS using Infura API
const uploadJSON = async (data) => {
  try {
    if (!process.env.IPFS_PROJECT_ID || !process.env.IPFS_PROJECT_SECRET) {
      console.warn('IPFS credentials not configured. Skipping IPFS upload.');
      return {
        success: false,
        error: 'IPFS not configured'
      };
    }

    const auth = Buffer.from(
      process.env.IPFS_PROJECT_ID + ':' + process.env.IPFS_PROJECT_SECRET
    ).toString('base64');

    const jsonString = JSON.stringify(data);
    const formData = new FormData();
    formData.append('file', Buffer.from(jsonString), {
      filename: 'data.json',
      contentType: 'application/json'
    });

    const response = await axios.post(
      `https://${process.env.IPFS_HOST || 'ipfs.infura.io'}:${process.env.IPFS_PORT || 5001}/api/v0/add`,
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          Authorization: `Basic ${auth}`
        }
      }
    );

    const hash = response.data.Hash;
    
    return {
      success: true,
      hash: hash,
      url: `https://ipfs.io/ipfs/${hash}`
    };
  } catch (error) {
    console.error('IPFS upload error:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
};

// Upload file to IPFS
const uploadFile = async (fileBuffer, fileName) => {
  try {
    if (!process.env.IPFS_PROJECT_ID || !process.env.IPFS_PROJECT_SECRET) {
      console.warn('IPFS credentials not configured. Skipping IPFS upload.');
      return {
        success: false,
        error: 'IPFS not configured'
      };
    }

    const auth = Buffer.from(
      process.env.IPFS_PROJECT_ID + ':' + process.env.IPFS_PROJECT_SECRET
    ).toString('base64');

    const formData = new FormData();
    formData.append('file', fileBuffer, { filename: fileName });

    const response = await axios.post(
      `https://${process.env.IPFS_HOST || 'ipfs.infura.io'}:${process.env.IPFS_PORT || 5001}/api/v0/add`,
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          Authorization: `Basic ${auth}`
        }
      }
    );

    const hash = response.data.Hash;
    
    return {
      success: true,
      hash: hash,
      url: `https://ipfs.io/ipfs/${hash}`
    };
  } catch (error) {
    console.error('IPFS file upload error:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
};

// Retrieve data from IPFS
const retrieveFromIPFS = async (hash) => {
  try {
    const response = await axios.get(`https://ipfs.io/ipfs/${hash}`, {
      timeout: 10000
    });
    
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('IPFS retrieve error:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
};

module.exports = {
  uploadJSON,
  uploadFile,
  retrieveFromIPFS
};
