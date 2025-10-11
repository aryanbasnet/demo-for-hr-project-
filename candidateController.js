// backend/controllers/candidateController.js
const Candidate = require('../models/Candidate');
const Job = require('../models/Job');

// Rule-based scoring algorithm
const calculateRuleBasedScore = (candidate, job) => {
  let score = 0;
  
  // Experience match (30 points)
  if (job.experienceLevel === 'Entry' && candidate.experience <= 2) score += 30;
  else if (job.experienceLevel === 'Mid' && candidate.experience >= 2 && candidate.experience <= 5) score += 30;
  else if (job.experienceLevel === 'Senior' && candidate.experience >= 5) score += 30;
  else score += 10;
  
  // Skills match (40 points)
  if (job.skills && candidate.skills) {
    const matchingSkills = candidate.skills.filter(skill => 
      job.skills.some(jobSkill => jobSkill.toLowerCase().includes(skill.toLowerCase()))
    );
    score += Math.min((matchingSkills.length / job.skills.length) * 40, 40);
  }
  
  // Education (15 points)
  if (candidate.education && candidate.education.length > 0) score += 15;
  
  // Resume/Cover Letter (15 points)
  if (candidate.resume && candidate.resume.url) score += 10;
  if (candidate.coverLetter) score += 5;
  
  return Math.round(score);
};

// @desc    Get all candidates
// @route   GET /api/candidates
// @access  Private
exports.getAllCandidates = async (req, res) => {
  try {
    const { status, jobId, source, search } = req.query;
    
    let query = {};
    
    if (status) query.status = status;
    if (jobId) query.jobAppliedFor = jobId;
    if (source) query.source = source;
    if (search) {
      query.$text = { $search: search };
    }

    const candidates = await Candidate.find(query)
      .populate('jobAppliedFor', 'title department location')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: candidates.length,
      data: candidates
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to fetch candidates',
      error: error.message
    });
  }
};

// @desc    Get single candidate
// @route   GET /api/candidates/:id
// @access  Private
exports.getCandidateById = async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id)
      .populate('jobAppliedFor')
      .populate('assignedTo', 'name email role')
      .populate('notes.addedBy', 'name')
      .populate('interviews.interviewer', 'name email');

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: 'Candidate not found'
      });
    }

    res.status(200).json({
      success: true,
      data: candidate
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to fetch candidate',
      error: error.message
    });
  }
};

// @desc    Create new candidate (application)
// @route   POST /api/candidates
// @access  Public/Private
exports.createCandidate = async (req, res) => {
  try {
    const candidate = await Candidate.create(req.body);

    // Calculate rule-based score
    const job = await Job.findById(candidate.jobAppliedFor);
    if (job) {
      candidate.ruleBasedScore = calculateRuleBasedScore(candidate, job);
      await candidate.save();
      
      // Update job applications count
      job.applicationsCount += 1;
      await job.save();
    }

    res.status(201).json({
      success: true,
      data: candidate
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to create candidate',
      error: error.message
    });
  }
};

// @desc    Update candidate
// @route   PUT /api/candidates/:id
// @access  Private
exports.updateCandidate = async (req, res) => {
  try {
    let candidate = await Candidate.findById(req.params.id);

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: 'Candidate not found'
      });
    }

    candidate = await Candidate.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: candidate
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to update candidate',
      error: error.message
    });
  }
};

// @desc    Delete candidate
// @route   DELETE /api/candidates/:id
// @access  Private
exports.deleteCandidate = async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id);

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: 'Candidate not found'
      });
    }

    await candidate.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Candidate deleted successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to delete candidate',
      error: error.message
    });
  }
};

// @desc    Add note to candidate
// @route   POST /api/candidates/:id/notes
// @access  Private
exports.addNote = async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id);

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: 'Candidate not found'
      });
    }

    candidate.notes.push({
      text: req.body.text,
      addedBy: req.user._id,
      addedAt: Date.now()
    });

    await candidate.save();

    res.status(200).json({
      success: true,
      data: candidate
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to add note',
      error: error.message
    });
  }
};

// @desc    Schedule interview
// @route   POST /api/candidates/:id/interviews
// @access  Private
exports.scheduleInterview = async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id);

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: 'Candidate not found'
      });
    }

    candidate.interviews.push({
      ...req.body,
      status: 'scheduled'
    });

    candidate.status = 'interview_scheduled';
    await candidate.save();

    res.status(200).json({
      success: true,
      data: candidate
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to schedule interview',
      error: error.message
    });
  }
};

// @desc    Shortlist candidates (bulk action)
// @route   POST /api/candidates/shortlist
// @access  Private
exports.shortlistCandidates = async (req, res) => {
  try {
    const { candidateIds } = req.body;

    await Candidate.updateMany(
      { _id: { $in: candidateIds } },
      { status: 'shortlisted' }
    );

    res.status(200).json({
      success: true,
      message: `${candidateIds.length} candidates shortlisted successfully`
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to shortlist candidates',
      error: error.message
    });
  }
};

// @desc    Get candidate statistics
// @route   GET /api/candidates/stats/overview
// @access  Private
exports.getCandidateStats = async (req, res) => {
  try {
    const totalCandidates = await Candidate.countDocuments();
    const newCandidates = await Candidate.countDocuments({ status: 'new' });
    const shortlisted = await Candidate.countDocuments({ status: 'shortlisted' });
    const hired = await Candidate.countDocuments({ status: 'hired' });

    const candidatesByStatus = await Candidate.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const candidatesBySource = await Candidate.aggregate([
      { $group: { _id: '$source', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        total: totalCandidates,
        new: newCandidates,
        shortlisted,
        hired,
        byStatus: candidatesByStatus,
        bySource: candidatesBySource
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to fetch candidate statistics',
      error: error.message
    });
  }
};