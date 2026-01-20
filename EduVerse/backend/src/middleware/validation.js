const { validationResult } = require('express-validator');

// Middleware to handle validation errors
exports.validate = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.param,
        message: err.msg,
        value: err.value
      }))
    });
  }
  
  next();
};

// Custom validators
exports.validators = {
  isEthereumAddress: (value) => {
    if (!/^0x[a-fA-F0-9]{40}$/.test(value)) {
      throw new Error('Invalid Ethereum address');
    }
    return true;
  },
  
  isValidRole: (value) => {
    const validRoles = ['student', 'educator', 'admin'];
    if (!validRoles.includes(value)) {
      throw new Error('Invalid role');
    }
    return true;
  },
  
  isValidSubject: (value) => {
    const validSubjects = [
      'Mathematics', 'Science', 'History', 'Literature', 'Computer Science',
      'Art', 'Music', 'Languages', 'Business', 'Engineering', 'Other'
    ];
    if (!validSubjects.includes(value)) {
      throw new Error('Invalid subject');
    }
    return true;
  },
  
  isPositiveNumber: (value) => {
    if (isNaN(value) || value < 0) {
      throw new Error('Must be a positive number');
    }
    return true;
  }
};

module.exports = exports;
