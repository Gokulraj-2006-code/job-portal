const express = require('express');
const admin = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect, authorize('admin'));

// Dashboard
router.get('/stats', admin.getStats);
router.get('/applications/recent', admin.getRecentApplications);
router.get('/users/recent', admin.getRecentUsers);
router.get('/companies/stats', admin.getCompanyWiseStats);

// Users
router.get('/users', admin.getAllUsers);
router.get('/users/:id/applications', admin.getUserApplications);
router.put('/users/:id/status', admin.updateUserStatus);
router.delete('/users/:id', admin.deleteUser);

// Companies
router.get('/companies', admin.getAllCompanies);
router.post('/companies', admin.createCompany);
router.put('/companies/:id', admin.updateCompany);
router.delete('/companies/:id', admin.deleteCompany);
router.put('/companies/:id/approve', admin.approveCompany);
router.put('/companies/:id/reject', admin.rejectCompany);

// Jobs
router.get('/jobs', admin.getAllJobs);
router.post('/jobs', admin.createJob);
router.put('/jobs/:id', admin.updateJob);
router.delete('/jobs/:id', admin.deleteJob);
router.put('/jobs/:id/approve', admin.approveJob);
router.put('/jobs/:id/reject', admin.rejectJob);

// Applications
router.get('/applications', admin.getAllApplications);
router.put('/applications/:id/status', admin.updateApplicationStatus);
router.post('/applications/:id/notes', admin.addApplicationNote);

// Audit log
router.get('/audit-log', admin.getAuditLog);

// Site settings
router.get('/announcement', admin.getAnnouncement);
router.put('/announcement', admin.updateAnnouncement);

router.get('/categories', admin.getCategories);
router.post('/categories', admin.addCategory);
router.delete('/categories/:name', admin.deleteCategory);

router.get('/experience-levels', admin.getExperienceLevels);
router.post('/experience-levels', admin.addExperienceLevel);
router.delete('/experience-levels/:name', admin.deleteExperienceLevel);

router.get('/salary-settings', admin.getSalarySettings);
router.put('/salary-settings', admin.updateSalarySettings);

module.exports = router;
