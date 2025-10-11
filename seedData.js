// backend/seedData.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Job = require('./models/Job');
const Candidate = require('./models/Candidate');
const Onboarding = require('./models/Onboarding');

dotenv.config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/talent_management');

const users = [
  {
    name: 'Admin User',
    email: 'admin@company.com',
    password: 'admin123',
    role: 'admin',
    department: 'IT'
  },
  {
    name: 'Sarah Johnson',
    email: 'sarah.hr@company.com',
    password: 'password123',
    role: 'hr_manager',
    department: 'Human Resources'
  },
  {
    name: 'Mike Chen',
    email: 'mike.recruiter@company.com',
    password: 'password123',
    role: 'recruitment_specialist',
    department: 'Human Resources'
  },
  {
    name: 'David Wilson',
    email: 'david.manager@company.com',
    password: 'password123',
    role: 'hiring_manager',
    department: 'Engineering'
  }
];

const seedDatabase = async () => {
  try {
    // Clear existing data
    await User.deleteMany();
    await Job.deleteMany();
    await Candidate.deleteMany();
    await Onboarding.deleteMany();

    console.log('🗑️  Cleared existing data');

    // Create users
    const createdUsers = await User.create(users);
    console.log('✅ Users created');

    const hrManager = createdUsers.find(u => u.role === 'hr_manager');
    const hiringManager = createdUsers.find(u => u.role === 'hiring_manager');

    // Create jobs
    const jobs = [
      {
        title: 'Senior Software Engineer',
        department: 'Engineering',
        location: 'San Francisco, CA',
        employmentType: 'Full-time',
        experienceLevel: 'Senior',
        description: 'We are looking for an experienced software engineer to join our team.',
        requirements: ['5+ years of experience', 'JavaScript/TypeScript', 'React', 'Node.js'],
        responsibilities: ['Develop new features', 'Code reviews', 'Mentor junior developers'],
        salaryRange: { min: 120000, max: 180000, currency: 'USD' },
        postingType: 'both',
        status: 'active',
        postedBy: hrManager._id,
        hiringManager: hiringManager._id,
        openings: 2,
        skills: ['JavaScript', 'React', 'Node.js', 'MongoDB', 'AWS'],
        benefits: ['Health Insurance', '401k', 'Remote Work', 'Unlimited PTO']
      },
      {
        title: 'Product Manager',
        department: 'Product',
        location: 'New York, NY',
        employmentType: 'Full-time',
        experienceLevel: 'Mid',
        description: 'Seeking a product manager to drive product strategy and execution.',
        requirements: ['3+ years PM experience', 'Agile methodology', 'Stakeholder management'],
        responsibilities: ['Define product roadmap', 'Coordinate with engineering', 'Analyze metrics'],
        salaryRange: { min: 100000, max: 140000, currency: 'USD' },
        postingType: 'external',
        status: 'active',
        postedBy: hrManager._id,
        hiringManager: hiringManager._id,
        openings: 1,
        skills: ['Product Strategy', 'Agile', 'User Research', 'Analytics'],
        benefits: ['Health Insurance', '401k', 'Stock Options']
      },
      {
        title: 'Marketing Specialist',
        department: 'Marketing',
        location: 'Remote',
        employmentType: 'Full-time',
        experienceLevel: 'Entry',
        description: 'Join our marketing team to help grow our brand and reach.',
        requirements: ['Bachelor degree in Marketing', 'Social media experience', 'Content creation'],
        responsibilities: ['Manage social media', 'Create marketing content', 'Analyze campaigns'],
        salaryRange: { min: 55000, max: 75000, currency: 'USD' },
        postingType: 'both',
        status: 'active',
        postedBy: hrManager._id,
        openings: 1,
        skills: ['Social Media', 'Content Marketing', 'SEO', 'Analytics'],
        benefits: ['Health Insurance', 'Remote Work', 'Professional Development']
      },
      {
        title: 'Data Scientist',
        department: 'Analytics',
        location: 'Boston, MA',
        employmentType: 'Full-time',
        experienceLevel: 'Senior',
        description: 'Looking for a data scientist to drive insights from our data.',
        requirements: ['PhD or Masters in relevant field', 'Python', 'Machine Learning', 'SQL'],
        responsibilities: ['Build ML models', 'Analyze data', 'Present insights to stakeholders'],
        salaryRange: { min: 130000, max: 170000, currency: 'USD' },
        postingType: 'both',
        status: 'active',
        postedBy: hrManager._id,
        hiringManager: hiringManager._id,
        openings: 1,
        skills: ['Python', 'Machine Learning', 'SQL', 'Statistics', 'TensorFlow'],
        benefits: ['Health Insurance', '401k', 'Research Budget', 'Conference Attendance']
      }
    ];

    const createdJobs = await Job.create(jobs);
    console.log('✅ Jobs created');

    // Create candidates
    const candidates = [
      {
        firstName: 'John',
        lastName: 'Smith',
        email: 'john.smith@email.com',
        phone: '+1-555-0101',
        jobAppliedFor: createdJobs[0]._id,
        source: 'linkedin',
        experience: 6,
        currentCompany: 'Tech Corp',
        currentPosition: 'Software Engineer',
        skills: ['JavaScript', 'React', 'Node.js', 'Docker'],
        education: [{ degree: 'BS Computer Science', institution: 'MIT', year: 2017 }],
        status: 'shortlisted',
        ruleBasedScore: 85,
        expectedSalary: 150000
      },
      {
        firstName: 'Emily',
        lastName: 'Davis',
        email: 'emily.davis@email.com',
        phone: '+1-555-0102',
        jobAppliedFor: createdJobs[0]._id,
        source: 'referral',
        experience: 7,
        currentCompany: 'Startup Inc',
        currentPosition: 'Senior Developer',
        skills: ['JavaScript', 'React', 'Node.js', 'AWS', 'MongoDB'],
        education: [{ degree: 'MS Computer Science', institution: 'Stanford', year: 2016 }],
        status: 'interview_scheduled',
        ruleBasedScore: 92,
        expectedSalary: 160000
      },
      {
        firstName: 'Michael',
        lastName: 'Brown',
        email: 'michael.brown@email.com',
        phone: '+1-555-0103',
        jobAppliedFor: createdJobs[1]._id,
        source: 'website',
        experience: 4,
        currentCompany: 'Product Co',
        currentPosition: 'Associate PM',
        skills: ['Product Strategy', 'Agile', 'JIRA', 'User Research'],
        education: [{ degree: 'MBA', institution: 'Harvard', year: 2020 }],
        status: 'new',
        ruleBasedScore: 78,
        expectedSalary: 115000
      },
      {
        firstName: 'Jessica',
        lastName: 'Martinez',
        email: 'jessica.martinez@email.com',
        phone: '+1-555-0104',
        jobAppliedFor: createdJobs[2]._id,
        source: 'job_board',
        experience: 1,
        currentCompany: 'Marketing Agency',
        currentPosition: 'Marketing Coordinator',
        skills: ['Social Media', 'Content Writing', 'Canva', 'Instagram'],
        education: [{ degree: 'BA Marketing', institution: 'UCLA', year: 2023 }],
        status: 'screening',
        ruleBasedScore: 70,
        expectedSalary: 60000
      },
      {
        firstName: 'David',
        lastName: 'Lee',
        email: 'david.lee@email.com',
        phone: '+1-555-0105',
        jobAppliedFor: createdJobs[3]._id,
        source: 'linkedin',
        experience: 8,
        currentCompany: 'Data Analytics Corp',
        currentPosition: 'Senior Data Scientist',
        skills: ['Python', 'Machine Learning', 'SQL', 'TensorFlow', 'PyTorch'],
        education: [{ degree: 'PhD Statistics', institution: 'Berkeley', year: 2016 }],
        status: 'shortlisted',
        ruleBasedScore: 95,
        expectedSalary: 155000
      }
    ];

    const createdCandidates = await Candidate.create(candidates);
    console.log('✅ Candidates created');

    // Update job application counts
    for (let job of createdJobs) {
      const count = await Candidate.countDocuments({ jobAppliedFor: job._id });
      job.applicationsCount = count;
      await job.save();
    }

    // Create onboarding records
    const onboardingRecords = [
      {
        employee: createdCandidates[1]._id,
        employeeId: 'EMP00001',
        startDate: new Date('2025-01-15'),
        department: 'Engineering',
        position: 'Senior Software Engineer',
        manager: hiringManager._id,
        checklist: [
          { task: 'Create employee account', assignedTo: 'IT', status: 'completed', completedDate: new Date('2025-01-10') },
          { task: 'Prepare workstation', assignedTo: 'IT', status: 'completed', completedDate: new Date('2025-01-12') },
          { task: 'Complete employment forms', assignedTo: 'HR', status: 'completed', completedDate: new Date('2025-01-14') },
          { task: 'Assign mentor/buddy', assignedTo: 'HR', status: 'in_progress' },
          { task: 'Schedule orientation', assignedTo: 'Training', status: 'pending' },
          { task: 'Department introduction', assignedTo: 'Manager', status: 'pending' }
        ],
        orientation: {
          scheduled: true,
          date: new Date('2025-01-16'),
          location: 'Main Office - Room 301'
        },
        overallStatus: 'in_progress',
        completionPercentage: 50
      }
    ];

    await Onboarding.create(onboardingRecords);
    console.log('✅ Onboarding records created');

    console.log('\n🎉 Database seeded successfully!');
    console.log('\n📝 Test Credentials:');
    console.log('Admin: admin@company.com / admin123');
    console.log('HR Manager: sarah.hr@company.com / password123');
    console.log('Recruiter: mike.recruiter@company.com / password123');
    console.log('Hiring Manager: david.manager@company.com / password123');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();