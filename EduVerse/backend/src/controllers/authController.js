const User = require('../models/User');
const { ErrorResponse } = require('../middleware/errorHandler');
const { verifySignature, generateAuthMessage, isValidAddress } = require('../config/web3');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, walletAddress, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, ...(walletAddress ? [{ walletAddress: walletAddress.toLowerCase() }] : [])]
    });

    if (existingUser) {
      return next(new ErrorResponse('User already exists with this email or wallet', 400));
    }

    // Validate wallet address if provided
    if (walletAddress && !isValidAddress(walletAddress)) {
      return next(new ErrorResponse('Invalid wallet address', 400));
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      walletAddress: walletAddress?.toLowerCase(),
      role: role || 'student',
      loginMethod: walletAddress ? 'wallet' : 'email'
    });

    sendTokenResponse(user, 201, res, 'User registered successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Login user with email/password
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return next(new ErrorResponse('Please provide email and password', 400));
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return next(new ErrorResponse('Invalid credentials', 401));
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return next(new ErrorResponse('Invalid credentials', 401));
    }

    // Update last login
    user.lastLogin = Date.now();
    user.loginMethod = 'email';
    await user.save();

    sendTokenResponse(user, 200, res, 'Login successful');
  } catch (error) {
    next(error);
  }
};

// @desc    Get nonce for wallet authentication
// @route   POST /api/auth/wallet/nonce
// @access  Public
exports.getWalletNonce = async (req, res, next) => {
  try {
    const { walletAddress } = req.body;

    if (!walletAddress || !isValidAddress(walletAddress)) {
      return next(new ErrorResponse('Invalid wallet address', 400));
    }

    // Find or create user
    let user = await User.findOne({ walletAddress: walletAddress.toLowerCase() });

    if (!user) {
      // Create new user with wallet
      user = await User.create({
        walletAddress: walletAddress.toLowerCase(),
        name: `User_${walletAddress.slice(0, 6)}`,
        email: `${walletAddress.toLowerCase()}@eduverse.temp`,
        loginMethod: 'wallet',
        nonce: Math.floor(Math.random() * 1000000).toString()
      });
    } else {
      // Generate new nonce
      user.generateNonce();
      await user.save();
    }

    const message = generateAuthMessage(walletAddress, user.nonce);

    res.status(200).json({
      success: true,
      data: {
        nonce: user.nonce,
        message
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login with wallet signature
// @route   POST /api/auth/wallet/login
// @access  Public
exports.walletLogin = async (req, res, next) => {
  try {
    const { walletAddress, signature } = req.body;

    if (!walletAddress || !signature) {
      return next(new ErrorResponse('Wallet address and signature required', 400));
    }

    if (!isValidAddress(walletAddress)) {
      return next(new ErrorResponse('Invalid wallet address', 400));
    }

    // Find user
    const user = await User.findOne({ walletAddress: walletAddress.toLowerCase() });

    if (!user) {
      return next(new ErrorResponse('User not found. Please get nonce first', 404));
    }

    // Verify signature
    const message = generateAuthMessage(walletAddress, user.nonce);
    const isValid = verifySignature(message, signature, walletAddress);

    if (!isValid) {
      return next(new ErrorResponse('Invalid signature', 401));
    }

    // Generate new nonce for next login
    user.generateNonce();
    user.lastLogin = Date.now();
    user.loginMethod = 'wallet';
    await user.save();

    sendTokenResponse(user, 200, res, 'Wallet authentication successful');
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('classroomsJoined', 'title subject thumbnail')
      .populate('classroomsOwned', 'title subject thumbnail');

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res, next) => {
  try {
    const fieldsToUpdate = {
      name: req.body.name,
      bio: req.body.bio,
      institution: req.body.institution,
      grade: req.body.grade,
      interests: req.body.interests,
      avatarData: req.body.avatarData
    };

    // Remove undefined fields
    Object.keys(fieldsToUpdate).forEach(key => 
      fieldsToUpdate[key] === undefined && delete fieldsToUpdate[key]
    );

    const user = await User.findByIdAndUpdate(
      req.user.id,
      fieldsToUpdate,
      {
        new: true,
        runValidators: true
      }
    );

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update password
// @route   PUT /api/auth/password
// @access  Private
exports.updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return next(new ErrorResponse('Please provide current and new password', 400));
    }

    const user = await User.findById(req.user.id).select('+password');

    // Check current password
    const isMatch = await user.matchPassword(currentPassword);

    if (!isMatch) {
      return next(new ErrorResponse('Current password is incorrect', 401));
    }

    user.password = newPassword;
    await user.save();

    sendTokenResponse(user, 200, res, 'Password updated successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Link wallet to existing account
// @route   POST /api/auth/link-wallet
// @access  Private
exports.linkWallet = async (req, res, next) => {
  try {
    const { walletAddress, signature } = req.body;

    if (!walletAddress || !signature) {
      return next(new ErrorResponse('Wallet address and signature required', 400));
    }

    if (!isValidAddress(walletAddress)) {
      return next(new ErrorResponse('Invalid wallet address', 400));
    }

    // Check if wallet is already linked
    const existingWallet = await User.findOne({ 
      walletAddress: walletAddress.toLowerCase() 
    });

    if (existingWallet && existingWallet._id.toString() !== req.user.id) {
      return next(new ErrorResponse('Wallet already linked to another account', 400));
    }

    // Verify signature
    const message = `Link wallet ${walletAddress} to EduVerse account`;
    const isValid = verifySignature(message, signature, walletAddress);

    if (!isValid) {
      return next(new ErrorResponse('Invalid signature', 401));
    }

    // Update user
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { walletAddress: walletAddress.toLowerCase() },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Wallet linked successfully',
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
exports.logout = async (req, res, next) => {
  try {
    res.cookie('token', 'none', {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true
    });

    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Helper function to send token response
const sendTokenResponse = (user, statusCode, res, message) => {
  const token = user.getSignedJwtToken();

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  };

  // Remove password from output
  user.password = undefined;

  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      message,
      token,
      data: user
    });
};
