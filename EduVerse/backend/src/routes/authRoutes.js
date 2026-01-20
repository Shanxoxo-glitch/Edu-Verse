const express = require('express');
const { body } = require('express-validator');
const {
  register,
  login,
  getWalletNonce,
  walletLogin,
  getMe,
  updateProfile,
  updatePassword,
  linkWallet,
  logout
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { validate, validators } = require('../middleware/validation');
const { authLimiter } = require('../middleware/security');

const router = express.Router();

// Public routes
router.post(
  '/register',
  authLimiter,
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password')
      .optional()
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
    body('walletAddress')
      .optional()
      .custom(validators.isEthereumAddress),
    body('role')
      .optional()
      .custom(validators.isValidRole)
  ],
  validate,
  register
);

router.post(
  '/login',
  authLimiter,
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required')
  ],
  validate,
  login
);

router.post(
  '/wallet/nonce',
  authLimiter,
  [
    body('walletAddress')
      .notEmpty()
      .withMessage('Wallet address is required')
      .custom(validators.isEthereumAddress)
  ],
  validate,
  getWalletNonce
);

router.post(
  '/wallet/login',
  authLimiter,
  [
    body('walletAddress')
      .notEmpty()
      .withMessage('Wallet address is required')
      .custom(validators.isEthereumAddress),
    body('signature').notEmpty().withMessage('Signature is required')
  ],
  validate,
  walletLogin
);

// Protected routes
router.get('/me', protect, getMe);

router.put(
  '/profile',
  protect,
  [
    body('name').optional().trim().notEmpty(),
    body('bio').optional().isLength({ max: 500 }),
    body('institution').optional().isLength({ max: 100 })
  ],
  validate,
  updateProfile
);

router.put(
  '/password',
  protect,
  [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword')
      .isLength({ min: 6 })
      .withMessage('New password must be at least 6 characters')
  ],
  validate,
  updatePassword
);

router.post(
  '/link-wallet',
  protect,
  [
    body('walletAddress')
      .notEmpty()
      .withMessage('Wallet address is required')
      .custom(validators.isEthereumAddress),
    body('signature').notEmpty().withMessage('Signature is required')
  ],
  validate,
  linkWallet
);

router.post('/logout', protect, logout);

module.exports = router;
