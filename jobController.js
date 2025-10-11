// backend/controllers/jobController.js
const Job = require('../models/Job');

// @desc    Get all jobs
// @route   GET /api/jobs
// @access  Private
exports.getAllJobs = async (req, res) => {
  try {
    const { status, department, postingType, search } = req.query;
    
    let query = {};
    
    if (status) query.status = status;
    if (department) query.department = department;
    if (postingType) query.postingType = postingType;
    if (search) {
      query.$text = { $search: search };
    }

    const jobs = await Job.find(query)
      .populate('postedBy', 'name email')
      .populate('hiringManager', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: jobs.length,
      data: jobs
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to fetch jobs',
      error: error.message
    });
  }
};

// @desc    Get single job
// @route   GET /api/jobs/:id
// @access  Private
exports.getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('postedBy', 'name email role')
      .populate('hiringManager', 'name email role');

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    res.status(200).json({
      success: true,
      data: job
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to fetch job',
      error: error.message
    });
  }
};

// @desc    Create new job
// @route   POST /api/jobs
// @access  Private (HR, Hiring Manager)
exports.createJob = async (req, res) => {
  try {
    const jobData = {
      ...req.body,
      postedBy: req.user._id
    };

    const job = await Job.create(jobData);

    res.status(201).json({
      success: true,
      data: job
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to create job',
      error: error.message
    });
  }
};

// @desc    Update job
// @route   PUT /api/jobs/:id
// @access  Private
exports.updateJob = async (req, res) => {
  try {
    let job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    job = await Job.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: job
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to update job',
      error: error.message
    });
  }
};

// @desc    Delete job
// @route   DELETE /api/jobs/:id
// @access  Private (Admin, HR Manager)
exports.deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    await job.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Job deleted successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to delete job',
      error: error.message
    });
  }
};

// @desc    Get job statistics
// @route   GET /api/jobs/stats/overview
// @access  Private
exports.getJobStats = async (req, res) => {
  try {
    const totalJobs = await Job.countDocuments();
    const activeJobs = await Job.countDocuments({ status: 'active' });
    const closedJobs = await Job.countDocuments({ status: 'closed' });
    const draftJobs = await Job.countDocuments({ status: 'draft' });

    const jobsByDepartment = await Job.aggregate([
      { $group: { _id: '$department', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        total: totalJobs,
        active: activeJobs,
        closed: closedJobs,
        draft: draftJobs,
        byDepartment: jobsByDepartment
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to fetch job statistics',
      error: error.message
    });
  }
};