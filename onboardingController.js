// backend/controllers/onboardingController.js
const Onboarding = require('../models/Onboarding');

// @desc    Get all onboarding records
// @route   GET /api/onboarding
// @access  Private
exports.getAllOnboarding = async (req, res) => {
  try {
    const { status } = req.query;
    
    let query = {};
    if (status) query.overallStatus = status;

    const onboardingRecords = await Onboarding.find(query)
      .populate('employee', 'firstName lastName email phone')
      .populate('manager', 'name email')
      .populate('buddy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: onboardingRecords.length,
      data: onboardingRecords
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to fetch onboarding records',
      error: error.message
    });
  }
};

// @desc    Get single onboarding record
// @route   GET /api/onboarding/:id
// @access  Private
exports.getOnboardingById = async (req, res) => {
  try {
    const onboarding = await Onboarding.findById(req.params.id)
      .populate('employee')
      .populate('manager', 'name email role department')
      .populate('buddy', 'name email')
      .populate('checklist.completedBy', 'name')
      .populate('orientation.coordinator', 'name email');

    if (!onboarding) {
      return res.status(404).json({
        success: false,
        message: 'Onboarding record not found'
      });
    }

    res.status(200).json({
      success: true,
      data: onboarding
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to fetch onboarding record',
      error: error.message
    });
  }
};

// @desc    Create new onboarding record
// @route   POST /api/onboarding
// @access  Private
exports.createOnboarding = async (req, res) => {
  try {
    // Generate employee ID
    const count = await Onboarding.countDocuments();
    const employeeId = `EMP${String(count + 1).padStart(5, '0')}`;

    const defaultChecklist = [
      { task: 'Create employee account', assignedTo: 'IT', description: 'Set up email and system access' },
      { task: 'Prepare workstation', assignedTo: 'IT', description: 'Setup computer and required software' },
      { task: 'Complete employment forms', assignedTo: 'HR', description: 'Tax forms, contracts, and policies' },
      { task: 'Assign mentor/buddy', assignedTo: 'HR', description: 'Pair with experienced team member' },
      { task: 'Schedule orientation', assignedTo: 'Training', description: 'Company overview and culture training' },
      { task: 'Department introduction', assignedTo: 'Manager', description: 'Meet team and tour facilities' },
      { task: 'Review job responsibilities', assignedTo: 'Manager', description: 'Discuss role expectations and goals' },
      { task: 'Complete mandatory training', assignedTo: 'Employee', description: 'Safety, compliance, and systems training' }
    ];

    const onboardingData = {
      ...req.body,
      employeeId,
      checklist: req.body.checklist || defaultChecklist
    };

    const onboarding = await Onboarding.create(onboardingData);

    res.status(201).json({
      success: true,
      data: onboarding
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to create onboarding record',
      error: error.message
    });
  }
};

// @desc    Update onboarding record
// @route   PUT /api/onboarding/:id
// @access  Private
exports.updateOnboarding = async (req, res) => {
  try {
    let onboarding = await Onboarding.findById(req.params.id);

    if (!onboarding) {
      return res.status(404).json({
        success: false,
        message: 'Onboarding record not found'
      });
    }

    onboarding = await Onboarding.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: onboarding
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to update onboarding record',
      error: error.message
    });
  }
};

// @desc    Update checklist item
// @route   PUT /api/onboarding/:id/checklist/:itemId
// @access  Private
exports.updateChecklistItem = async (req, res) => {
  try {
    const onboarding = await Onboarding.findById(req.params.id);

    if (!onboarding) {
      return res.status(404).json({
        success: false,
        message: 'Onboarding record not found'
      });
    }

    const checklistItem = onboarding.checklist.id(req.params.itemId);
    
    if (!checklistItem) {
      return res.status(404).json({
        success: false,
        message: 'Checklist item not found'
      });
    }

    if (req.body.status) checklistItem.status = req.body.status;
    if (req.body.status === 'completed') {
      checklistItem.completedDate = Date.now();
      checklistItem.completedBy = req.user._id;
    }

    await onboarding.save();

    res.status(200).json({
      success: true,
      data: onboarding
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to update checklist item',
      error: error.message
    });
  }
};

// @desc    Submit document
// @route   POST /api/onboarding/:id/documents
// @access  Private
exports.submitDocument = async (req, res) => {
  try {
    const onboarding = await Onboarding.findById(req.params.id);

    if (!onboarding) {
      return res.status(404).json({
        success: false,
        message: 'Onboarding record not found'
      });
    }

    onboarding.documents.push({
      ...req.body,
      status: 'submitted',
      uploadedAt: Date.now()
    });

    await onboarding.save();

    res.status(200).json({
      success: true,
      data: onboarding
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to submit document',
      error: error.message
    });
  }
};

// @desc    Get onboarding statistics
// @route   GET /api/onboarding/stats/overview
// @access  Private
exports.getOnboardingStats = async (req, res) => {
  try {
    const total = await Onboarding.countDocuments();
    const inProgress = await Onboarding.countDocuments({ overallStatus: 'in_progress' });
    const completed = await Onboarding.countDocuments({ overallStatus: 'completed' });
    const notStarted = await Onboarding.countDocuments({ overallStatus: 'not_started' });

    const avgCompletion = await Onboarding.aggregate([
      { $group: { _id: null, avgPercentage: { $avg: '$completionPercentage' } } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        total,
        inProgress,
        completed,
        notStarted,
        averageCompletion: avgCompletion[0]?.avgPercentage || 0
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to fetch onboarding statistics',
      error: error.message
    });
  }
};