const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email'
    ]
  },
  password: {
    type: String,
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  walletAddress: {
    type: String,
    unique: true,
    sparse: true,
    lowercase: true,
    validate: {
      validator: function(v) {
        return !v || /^0x[a-fA-F0-9]{40}$/.test(v);
      },
      message: 'Invalid wallet address format'
    }
  },
  role: {
    type: String,
    enum: ['student', 'educator', 'admin'],
    default: 'student'
  },
  tokensEarned: {
    type: Number,
    default: 0,
    min: 0
  },
  avatarData: {
    skinColor: { type: String, default: '#FFD1A4' },
    hairStyle: { type: String, default: 'default' },
    hairColor: { type: String, default: '#000000' },
    outfit: { type: String, default: 'casual' },
    accessories: [String]
  },
  bio: {
    type: String,
    maxlength: [500, 'Bio cannot be more than 500 characters']
  },
  institution: {
    type: String,
    maxlength: [100, 'Institution name cannot be more than 100 characters']
  },
  grade: String,
  interests: [String],
  achievements: [{
    title: String,
    description: String,
    earnedAt: { type: Date, default: Date.now },
    nftHash: String
  }],
  classroomsJoined: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Classroom'
  }],
  classroomsOwned: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Classroom'
  }],
  nonce: {
    type: String,
    default: () => Math.floor(Math.random() * 1000000).toString()
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: Date,
  loginMethod: {
    type: String,
    enum: ['email', 'wallet'],
    default: 'email'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Encrypt password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  if (this.password) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

// Match password
UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate JWT token
UserSchema.methods.getSignedJwtToken = function() {
  return jwt.sign(
    { id: this._id, role: this.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }
  );
};

// Generate new nonce for wallet authentication
UserSchema.methods.generateNonce = function() {
  this.nonce = Math.floor(Math.random() * 1000000).toString();
  return this.nonce;
};

// Virtual for total achievements
UserSchema.virtual('achievementCount').get(function() {
  return this.achievements.length;
});

module.exports = mongoose.model('User', UserSchema);
