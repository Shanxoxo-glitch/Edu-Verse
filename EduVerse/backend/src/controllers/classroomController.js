const Classroom = require('../models/Classroom');
const User = require('../models/User');
const { ErrorResponse } = require('../middleware/errorHandler');
const { uploadJSON } = require('../config/ipfs');
const { getContract } = require('../config/web3');

// @desc    Create new classroom (with optional NFT minting)
// @route   POST /api/classrooms/create
// @access  Private (Educator/Admin)
exports.createClassroom = async (req, res, next) => {
  try {
    const {
      title,
      description,
      subject,
      accessType,
      maxStudents,
      schedule,
      mintNFT
    } = req.body;

    // Create classroom data
    const classroomData = {
      title,
      description,
      subject,
      owner: req.user.id,
      accessType: accessType || 'public',
      maxStudents: maxStudents || 50,
      schedule: schedule || []
    };

    // Generate access token for private classrooms
    if (accessType === 'private') {
      const crypto = require('crypto');
      classroomData.accessToken = crypto.randomBytes(16).toString('hex');
    }

    // Create classroom
    const classroom = await Classroom.create(classroomData);

    // Mint NFT if requested
    if (mintNFT && process.env.NFT_CLASSROOM_CONTRACT) {
      try {
        // Prepare metadata
        const metadata = {
          name: title,
          description: description,
          subject: subject,
          creator: req.user.walletAddress,
          createdAt: new Date().toISOString(),
          attributes: [
            { trait_type: 'Subject', value: subject },
            { trait_type: 'Max Students', value: maxStudents },
            { trait_type: 'Access Type', value: accessType }
          ]
        };

        // Upload metadata to IPFS
        const ipfsResult = await uploadJSON(metadata);

        if (ipfsResult.success) {
          classroom.nftMetadataURI = ipfsResult.url;
          classroom.nftContractAddress = process.env.NFT_CLASSROOM_CONTRACT;
          
          // Note: Actual NFT minting would happen here via smart contract
          // This is a placeholder - implement actual contract interaction
          classroom.nftId = `${Date.now()}-${classroom._id}`;
          
          await classroom.save();
        }
      } catch (nftError) {
        console.error('NFT minting error:', nftError);
        // Continue even if NFT minting fails
      }
    }

    // Add classroom to user's owned classrooms
    await User.findByIdAndUpdate(req.user.id, {
      $push: { classroomsOwned: classroom._id }
    });

    res.status(201).json({
      success: true,
      message: 'Classroom created successfully',
      data: classroom
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all classrooms (with filters)
// @route   GET /api/classrooms
// @access  Public
exports.getClassrooms = async (req, res, next) => {
  try {
    const {
      subject,
      accessType,
      search,
      page = 1,
      limit = 10,
      sortBy = '-createdAt'
    } = req.query;

    // Build query
    const query = { isActive: true };

    if (subject) query.subject = subject;
    if (accessType) query.accessType = accessType;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Execute query with pagination
    const classrooms = await Classroom.find(query)
      .populate('owner', 'name walletAddress avatarData')
      .sort(sortBy)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-students -events -materials');

    const count = await Classroom.countDocuments(query);

    res.status(200).json({
      success: true,
      count: classrooms.length,
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      data: classrooms
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single classroom details
// @route   GET /api/classrooms/:id
// @access  Public
exports.getClassroom = async (req, res, next) => {
  try {
    const classroom = await Classroom.findById(req.params.id)
      .populate('owner', 'name email walletAddress avatarData institution')
      .populate('students.user', 'name avatarData tokensEarned')
      .populate('quizzes');

    if (!classroom) {
      return next(new ErrorResponse('Classroom not found', 404));
    }

    // Check if user has access (for private classrooms)
    if (classroom.accessType === 'private' && req.user) {
      const isOwner = classroom.owner._id.toString() === req.user.id;
      const isEnrolled = classroom.isUserEnrolled(req.user.id);
      
      if (!isOwner && !isEnrolled) {
        return next(new ErrorResponse('Access denied to this classroom', 403));
      }
    }

    res.status(200).json({
      success: true,
      data: classroom
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Join classroom
// @route   POST /api/classrooms/:id/join
// @access  Private
exports.joinClassroom = async (req, res, next) => {
  try {
    const { accessToken } = req.body;
    const classroom = await Classroom.findById(req.params.id);

    if (!classroom) {
      return next(new ErrorResponse('Classroom not found', 404));
    }

    // Check if classroom is full
    if (classroom.isFull()) {
      return next(new ErrorResponse('Classroom is full', 400));
    }

    // Check if already enrolled
    if (classroom.isUserEnrolled(req.user.id)) {
      return next(new ErrorResponse('Already enrolled in this classroom', 400));
    }

    // Verify access for private classrooms
    if (classroom.accessType === 'private') {
      if (!accessToken || accessToken !== classroom.accessToken) {
        return next(new ErrorResponse('Invalid access token', 403));
      }
    }

    // Verify NFT ownership for NFT-gated classrooms
    if (classroom.accessType === 'nft-gated') {
      if (!req.user.walletAddress) {
        return next(new ErrorResponse('Wallet address required for NFT-gated classroom', 400));
      }
      
      // Note: Implement actual NFT ownership verification here
      // This is a placeholder
      const hasNFT = true; // Replace with actual check
      
      if (!hasNFT) {
        return next(new ErrorResponse('NFT ownership required to join this classroom', 403));
      }
    }

    // Add student to classroom
    classroom.students.push({
      user: req.user.id,
      joinedAt: Date.now(),
      status: 'active'
    });

    await classroom.save();

    // Add classroom to user's joined classrooms
    await User.findByIdAndUpdate(req.user.id, {
      $push: { classroomsJoined: classroom._id }
    });

    res.status(200).json({
      success: true,
      message: 'Successfully joined classroom',
      data: classroom
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Leave classroom
// @route   POST /api/classrooms/:id/leave
// @access  Private
exports.leaveClassroom = async (req, res, next) => {
  try {
    const classroom = await Classroom.findById(req.params.id);

    if (!classroom) {
      return next(new ErrorResponse('Classroom not found', 404));
    }

    // Check if enrolled
    if (!classroom.isUserEnrolled(req.user.id)) {
      return next(new ErrorResponse('Not enrolled in this classroom', 400));
    }

    // Update student status
    const studentIndex = classroom.students.findIndex(
      s => s.user.toString() === req.user.id && s.status === 'active'
    );

    if (studentIndex !== -1) {
      classroom.students[studentIndex].status = 'inactive';
      await classroom.save();
    }

    // Remove from user's joined classrooms
    await User.findByIdAndUpdate(req.user.id, {
      $pull: { classroomsJoined: classroom._id }
    });

    res.status(200).json({
      success: true,
      message: 'Successfully left classroom'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update classroom
// @route   PUT /api/classrooms/:id
// @access  Private (Owner only)
exports.updateClassroom = async (req, res, next) => {
  try {
    let classroom = await Classroom.findById(req.params.id);

    if (!classroom) {
      return next(new ErrorResponse('Classroom not found', 404));
    }

    // Check ownership
    if (classroom.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new ErrorResponse('Not authorized to update this classroom', 403));
    }

    const allowedUpdates = [
      'title', 'description', 'maxStudents', 'schedule', 
      'settings', 'thumbnail', 'tags'
    ];

    const updates = {};
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    classroom = await Classroom.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Classroom updated successfully',
      data: classroom
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete classroom
// @route   DELETE /api/classrooms/:id
// @access  Private (Owner only)
exports.deleteClassroom = async (req, res, next) => {
  try {
    const classroom = await Classroom.findById(req.params.id);

    if (!classroom) {
      return next(new ErrorResponse('Classroom not found', 404));
    }

    // Check ownership
    if (classroom.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new ErrorResponse('Not authorized to delete this classroom', 403));
    }

    // Soft delete
    classroom.isActive = false;
    await classroom.save();

    res.status(200).json({
      success: true,
      message: 'Classroom deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add material to classroom
// @route   POST /api/classrooms/:id/materials
// @access  Private (Owner only)
exports.addMaterial = async (req, res, next) => {
  try {
    const classroom = await Classroom.findById(req.params.id);

    if (!classroom) {
      return next(new ErrorResponse('Classroom not found', 404));
    }

    // Check ownership
    if (classroom.owner.toString() !== req.user.id) {
      return next(new ErrorResponse('Not authorized', 403));
    }

    const { title, description, type, url, ipfsHash } = req.body;

    classroom.materials.push({
      title,
      description,
      type,
      url,
      ipfsHash,
      uploadedAt: Date.now()
    });

    await classroom.save();

    res.status(200).json({
      success: true,
      message: 'Material added successfully',
      data: classroom
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's classrooms
// @route   GET /api/classrooms/my/all
// @access  Private
exports.getMyClassrooms = async (req, res, next) => {
  try {
    const { type = 'joined' } = req.query;

    let classrooms;

    if (type === 'owned') {
      classrooms = await Classroom.find({
        owner: req.user.id,
        isActive: true
      }).populate('students.user', 'name avatarData');
    } else {
      classrooms = await Classroom.find({
        'students.user': req.user.id,
        'students.status': 'active',
        isActive: true
      }).populate('owner', 'name avatarData');
    }

    res.status(200).json({
      success: true,
      count: classrooms.length,
      data: classrooms
    });
  } catch (error) {
    next(error);
  }
};

module.exports = exports;
