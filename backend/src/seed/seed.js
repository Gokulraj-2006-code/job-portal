// Seeds MongoDB with demo data equivalent to the original frontend's
// mock localStorage database, so the app has something to show
// immediately after connecting the real backend.
//
// Usage:
//   npm run seed            (wipes and re-seeds all collections)
//   npm run seed:destroy    (wipes all collections, no re-seed)

const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

const mongoose = require('mongoose');
const connectDB = require('../config/db');

const User = require('../models/User');
const Company = require('../models/Company');
const Job = require('../models/Job');
const Application = require('../models/Application');
const Notification = require('../models/Notification');
const Message = require('../models/Message');
const AuditLog = require('../models/AuditLog');
const Settings = require('../models/Settings');
const SavedJob = require('../models/SavedJob');

const wipeAll = async () => {
  await Promise.all([
    User.deleteMany({}),
    Company.deleteMany({}),
    Job.deleteMany({}),
    Application.deleteMany({}),
    Notification.deleteMany({}),
    Message.deleteMany({}),
    AuditLog.deleteMany({}),
    Settings.deleteMany({}),
    SavedJob.deleteMany({}),
  ]);
};

const run = async () => {
  await connectDB();

  if (process.argv.includes('--destroy')) {
    await wipeAll();
    console.log('All collections cleared.');
    process.exit(0);
  }

  await wipeAll();

  // ---------- Companies (created first, recruiterId patched in after users exist) ----------
  const companies = await Company.insertMany([
    {
      name: 'Nimbus Technologies',
      industry: 'Software / SaaS',
      location: 'Bengaluru, India',
      website: 'https://nimbustech.example.com',
      logo: 'https://ui-avatars.com/api/?name=Nimbus+Technologies&background=4f46e5&color=fff&bold=true&format=svg',
      description: 'Nimbus builds cloud infrastructure tooling used by thousands of engineering teams worldwide.',
      status: 'approved',
    },
    {
      name: 'Bluepeak Financial',
      industry: 'FinTech',
      location: 'Mumbai, India',
      website: 'https://bluepeak.example.com',
      logo: 'https://ui-avatars.com/api/?name=Bluepeak+Financial&background=0f766e&color=fff&bold=true&format=svg',
      description: 'Bluepeak is reinventing digital lending for small businesses across South Asia.',
      status: 'approved',
    },
    {
      name: 'Verdant Health',
      industry: 'HealthTech',
      location: 'Hyderabad, India',
      website: 'https://verdanthealth.example.com',
      logo: 'https://ui-avatars.com/api/?name=Verdant+Health&background=15803d&color=fff&bold=true&format=svg',
      description: 'Verdant Health connects patients with specialists through an AI-assisted telehealth platform.',
      status: 'approved',
    },
    {
      name: 'Skyline Analytics',
      industry: 'Data & Analytics',
      location: 'Chennai, India',
      website: 'https://skylineanalytics.example.com',
      logo: 'https://ui-avatars.com/api/?name=Skyline+Analytics&background=b45309&color=fff&bold=true&format=svg',
      description: 'Skyline builds business intelligence and forecasting tools for retail and logistics companies.',
      status: 'approved',
    },
  ]);
  const [nimbus, bluepeak, verdant, skyline] = companies;

  // ---------- Users ----------
  const seekerPassword = 'password123';
  const users = await User.create([
    {
      role: 'seeker',
      name: 'Aditi Sharma',
      email: 'seeker@example.com',
      password: seekerPassword,
      phone: '+91 98765 43210',
      location: 'Bengaluru, India',
      headline: 'Frontend Developer | React & TypeScript',
      bio: 'Frontend developer with 3 years of experience building accessible, performant web apps.',
      skills: ['React', 'JavaScript', 'TypeScript', 'Tailwind CSS', 'Redux'],
      education: [{ degree: 'B.Tech in Computer Science', institution: 'VIT Vellore', year: '2021' }],
      experience: [
        {
          title: 'Frontend Developer',
          company: 'PixelWorks Studio',
          duration: '2021 - Present',
          description: 'Built and maintained React dashboards used by 50k+ monthly users.',
        },
      ],
    },
    {
      role: 'seeker',
      name: 'Rahul Verma',
      email: 'rahul@example.com',
      password: seekerPassword,
      phone: '+91 91234 56780',
      location: 'Pune, India',
      headline: 'Backend Engineer | Node.js & MongoDB',
      bio: 'Backend engineer focused on scalable REST APIs and database design.',
      skills: ['Node.js', 'Express', 'MongoDB', 'Docker'],
      education: [{ degree: 'B.E. in Information Technology', institution: 'Pune University', year: '2020' }],
      experience: [
        {
          title: 'Backend Engineer',
          company: 'DataForge Labs',
          duration: '2020 - Present',
          description: 'Designed microservices handling 2M+ requests/day.',
        },
      ],
    },
    {
      role: 'recruiter',
      name: 'Priya Nair',
      email: 'recruiter@example.com',
      password: seekerPassword,
      phone: '+91 90000 11122',
      companyId: nimbus._id,
      companyName: nimbus.name,
      designation: 'Senior Talent Acquisition Partner',
    },
    {
      role: 'recruiter',
      name: 'Karan Mehta',
      email: 'karan@bluepeak.example.com',
      password: seekerPassword,
      phone: '+91 90000 33344',
      companyId: bluepeak._id,
      companyName: bluepeak.name,
      designation: 'HR Manager',
    },
    {
      role: 'admin',
      name: 'Site Admin',
      email: 'admin@jobportal.com',
      password: seekerPassword,
    },
  ]);
  const [seeker1, seeker2, recruiter1, recruiter2] = users;

  nimbus.recruiterId = recruiter1._id;
  bluepeak.recruiterId = recruiter2._id;
  verdant.recruiterId = recruiter1._id;
  await Promise.all([nimbus.save(), bluepeak.save(), verdant.save()]);

  // ---------- Jobs ----------
  const jobDefs = [
    { title: 'Senior Frontend Developer', company: nimbus, recruiter: recruiter1, location: 'Bengaluru, India', type: 'Full-time', category: 'Engineering', experienceLevel: '3+ Years', remote: true, salaryMin: 1800000, salaryMax: 2600000, skills: ['React', 'TypeScript', 'Tailwind CSS'], description: 'Lead development of our customer-facing dashboards.' },
    { title: 'Backend Engineer (Node.js)', company: nimbus, recruiter: recruiter1, location: 'Bengaluru, India', type: 'Full-time', category: 'Engineering', experienceLevel: '1-3 Years', remote: false, salaryMin: 1400000, salaryMax: 2000000, skills: ['Node.js', 'Express', 'MongoDB'], description: 'Build and scale the services powering our cloud tooling suite.' },
    { title: 'Product Designer', company: nimbus, recruiter: recruiter1, location: 'Remote', type: 'Full-time', category: 'Design', experienceLevel: '1-3 Years', remote: true, salaryMin: 1200000, salaryMax: 1800000, skills: ['Figma', 'Design Systems'], description: 'Own end-to-end product design for our developer tools.' },
    { title: 'Data Analyst', company: bluepeak, recruiter: recruiter2, location: 'Mumbai, India', type: 'Full-time', category: 'Finance', experienceLevel: 'Fresher', remote: false, salaryMin: 700000, salaryMax: 1000000, skills: ['SQL', 'Excel', 'Power BI'], description: 'Support our risk and lending teams with data-driven insights.' },
    { title: 'Full Stack Developer (MERN)', company: bluepeak, recruiter: recruiter2, location: 'Mumbai, India', type: 'Full-time', category: 'Engineering', experienceLevel: '1-3 Years', remote: true, salaryMin: 1500000, salaryMax: 2200000, skills: ['React', 'Node.js', 'MongoDB'], description: 'Build new lending products end-to-end across our MERN stack.' },
    { title: 'DevOps Engineer', company: verdant, recruiter: recruiter1, location: 'Hyderabad, India', type: 'Contract', category: 'Engineering', experienceLevel: '3+ Years', remote: false, salaryMin: 1600000, salaryMax: 2400000, skills: ['AWS', 'Kubernetes', 'Terraform'], description: 'Own our infrastructure-as-code and deployment pipelines.' },
    { title: 'HR Executive', company: verdant, recruiter: recruiter1, location: 'Hyderabad, India', type: 'Full-time', category: 'Human Resources', experienceLevel: 'Fresher', remote: false, salaryMin: 500000, salaryMax: 750000, skills: ['Recruitment', 'Onboarding'], description: 'Support end-to-end recruitment and onboarding.' },
    { title: 'Data Engineer', company: skyline, recruiter: null, location: 'Chennai, India', type: 'Full-time', category: 'Engineering', experienceLevel: '1-3 Years', remote: false, salaryMin: 1200000, salaryMax: 1800000, skills: ['Python', 'Airflow', 'SQL'], description: 'Build and maintain data pipelines powering forecasting dashboards.' },
    { title: 'Business Intelligence Analyst', company: skyline, recruiter: null, location: 'Chennai, India', type: 'Full-time', category: 'Finance', experienceLevel: 'Fresher', remote: false, salaryMin: 700000, salaryMax: 1000000, skills: ['Power BI', 'Excel', 'SQL'], description: 'Turn raw operational data into dashboards clients rely on.' },
    { title: 'React Native Developer (Internship)', company: bluepeak, recruiter: recruiter2, location: 'Remote', type: 'Internship', category: 'Engineering', experienceLevel: 'Fresher', remote: true, salaryMin: 180000, salaryMax: 300000, skills: ['React Native', 'JavaScript'], description: 'A 6-month internship building features for our mobile lending app.' },
  ];

  const jobs = await Job.insertMany(
    jobDefs.map((j) => ({
      title: j.title,
      companyId: j.company._id,
      recruiterId: j.recruiter ? j.recruiter._id : null,
      location: j.location,
      type: j.type,
      category: j.category,
      experienceLevel: j.experienceLevel,
      remote: j.remote,
      salaryMin: j.salaryMin,
      salaryMax: j.salaryMax,
      skills: j.skills,
      description: j.description,
      status: 'active',
      applicants: 0,
    }))
  );

  // ---------- Applications ----------
  const applications = await Application.insertMany([
    { jobId: jobs[0]._id, seekerId: seeker1._id, status: 'Shortlisted', fullName: seeker1.name, email: seeker1.email },
    { jobId: jobs[4]._id, seekerId: seeker2._id, status: 'Applied', fullName: seeker2.name, email: seeker2.email },
    { jobId: jobs[1]._id, seekerId: seeker1._id, status: 'Applied', fullName: seeker1.name, email: seeker1.email },
  ]);
  await Job.findByIdAndUpdate(jobs[0]._id, { $inc: { applicants: 1 } });
  await Job.findByIdAndUpdate(jobs[4]._id, { $inc: { applicants: 1 } });
  await Job.findByIdAndUpdate(jobs[1]._id, { $inc: { applicants: 1 } });

  // ---------- Notifications ----------
  await Notification.insertMany([
    { userId: seeker1._id, message: 'Your application for "Senior Frontend Developer" was shortlisted.', read: false },
    { userId: seeker1._id, message: 'Nimbus Technologies viewed your profile.', read: true },
  ]);

  // ---------- Contact messages ----------
  await Message.insertMany([
    {
      name: 'Ananya Rao',
      email: 'ananya.rao@example.com',
      subject: 'Question about posting a job',
      message: "Hi, I'd like to know if there's a discount for posting multiple job listings at once.",
      read: false,
    },
    {
      name: 'Vikram Shah',
      email: 'vikram.shah@example.com',
      subject: 'Trouble uploading resume',
      message: 'My resume upload keeps failing on the profile page. Could you take a look?',
      read: true,
    },
  ]);

  // ---------- Audit log ----------
  await AuditLog.create({
    adminId: users[4]._id.toString(),
    adminName: users[4].name,
    action: 'Approved company',
    target: nimbus.name,
  });

  // ---------- Settings singleton ----------
  await Settings.create({});

  console.log('Database seeded successfully.');
  console.log('');
  console.log('Demo accounts (all use password: password123):');
  console.log('  Job Seeker : seeker@example.com');
  console.log('  Job Seeker : rahul@example.com');
  console.log('  Recruiter  : recruiter@example.com');
  console.log('  Recruiter  : karan@bluepeak.example.com');
  console.log('  Admin      : admin@jobportal.com');

  process.exit(0);
};

run().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
