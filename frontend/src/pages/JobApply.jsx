import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Upload, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { jobService } from '../services/jobService';
import toast from 'react-hot-toast';

const emptyForm = {
  fullName: '',
  email: '',
  mobile: '',
  location: '',
  dob: '',
  gender: '',
  qualification: '',
  experience: '',
  skills: '',
  currentCompany: '',
  expectedSalary: '',
  coverLetter: '',
  portfolioUrl: '',
};

const requiredFields = [
  'fullName', 'email', 'mobile', 'location', 'dob', 'gender',
  'qualification', 'experience', 'skills', 'expectedSalary', 'coverLetter',
];

const fileToBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const JobApply = () => {
  const { id } = useParams();
  const { user } = useAuth();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [resumeFile, setResumeFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    let isMounted = true;
    jobService.getJob(id).then((data) => {
      if (isMounted) {
        setJob(data);
        setLoading(false);
      }
    }).catch(() => {
      if (isMounted) setLoading(false);
    });

    // Pre-fill from the user's profile where possible
    if (user) {
      setForm((prev) => ({
        ...prev,
        fullName: user.name || '',
        email: user.email || '',
        mobile: user.phone || '',
        location: user.location || '',
        skills: (user.skills || []).join(', '),
      }));
    }

    return () => { isMounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Resume must be under 5MB');
      return;
    }
    setResumeFile(file);
    setErrors((prev) => ({ ...prev, resume: undefined }));
  };

  const validate = () => {
    const newErrors = {};
    requiredFields.forEach((field) => {
      if (!String(form[field] || '').trim()) {
        newErrors[field] = 'This field is required';
      }
    });
    if (!resumeFile) {
      newErrors.resume = 'Please upload your resume';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error('Please fill in all required fields');
      return;
    }
    setSubmitting(true);
    try {
      const resumeData = await fileToBase64(resumeFile);
      await jobService.applyToJob(id, {
        ...form,
        resume: { name: resumeFile.name, size: resumeFile.size, data: resumeData },
      });
      setSubmitted(true);
    } catch (error) {
      toast.error(error?.message || 'Failed to submit application');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="container-custom py-16 text-center text-slate-500 dark:text-slate-400">Loading...</div>;
  }

  if (!job) {
    return (
      <div className="container-custom py-16 text-center">
        <p className="text-slate-500 dark:text-slate-400 mb-4">This job could not be found.</p>
        <Link to="/jobs" className="btn-primary inline-block">Back to Jobs</Link>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="container-custom py-16 max-w-lg text-center">
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 dark:bg-emerald-900/40">
          <CheckCircle className="w-8 h-8 text-emerald-600" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Application Submitted!</h1>
        <p className="text-slate-600 dark:text-slate-300 mb-8">
          Your application for <strong>{job.title}</strong> at {job.company?.name} has been sent. You can track its status from your Applied Jobs page.
        </p>
        <div className="flex gap-3 justify-center">
          <Link to="/applied-jobs" className="btn-primary">View Applied Jobs</Link>
          <Link to="/jobs" className="btn-secondary">Browse More Jobs</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-job-apply container-custom py-8 max-w-2xl">
      <Link
        to={`/jobs/${id}`}
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-primary-600 transition dark:text-slate-300 dark:hover:text-primary-400 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Job Details
      </Link>

      <div className="card p-6 mb-6">
        <h1 className="text-xl font-bold">Apply for {job.title}</h1>
        <p className="text-slate-500 dark:text-slate-400">{job.company?.name} · {job.location}</p>
      </div>

      <form onSubmit={handleSubmit} className="card p-6 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label-text">Full Name *</label>
            <input type="text" value={form.fullName} onChange={(e) => handleChange('fullName', e.target.value)} className="input-field" />
            {errors.fullName && <p className="text-xs text-red-600 mt-1">{errors.fullName}</p>}
          </div>
          <div>
            <label className="label-text">Email Address *</label>
            <input type="email" value={form.email} onChange={(e) => handleChange('email', e.target.value)} className="input-field" />
            {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
          </div>
          <div>
            <label className="label-text">Mobile Number *</label>
            <input type="tel" value={form.mobile} onChange={(e) => handleChange('mobile', e.target.value)} className="input-field" />
            {errors.mobile && <p className="text-xs text-red-600 mt-1">{errors.mobile}</p>}
          </div>
          <div>
            <label className="label-text">Current Location *</label>
            <input type="text" value={form.location} onChange={(e) => handleChange('location', e.target.value)} className="input-field" />
            {errors.location && <p className="text-xs text-red-600 mt-1">{errors.location}</p>}
          </div>
          <div>
            <label className="label-text">Date of Birth *</label>
            <input type="date" value={form.dob} onChange={(e) => handleChange('dob', e.target.value)} className="input-field" />
            {errors.dob && <p className="text-xs text-red-600 mt-1">{errors.dob}</p>}
          </div>
          <div>
            <label className="label-text">Gender *</label>
            <select value={form.gender} onChange={(e) => handleChange('gender', e.target.value)} className="input-field">
              <option value="">Select</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
              <option value="Prefer not to say">Prefer not to say</option>
            </select>
            {errors.gender && <p className="text-xs text-red-600 mt-1">{errors.gender}</p>}
          </div>
          <div>
            <label className="label-text">Highest Qualification *</label>
            <input type="text" value={form.qualification} onChange={(e) => handleChange('qualification', e.target.value)} className="input-field" placeholder="e.g. B.Tech Computer Science" />
            {errors.qualification && <p className="text-xs text-red-600 mt-1">{errors.qualification}</p>}
          </div>
          <div>
            <label className="label-text">Experience *</label>
            <input type="text" value={form.experience} onChange={(e) => handleChange('experience', e.target.value)} className="input-field" placeholder="e.g. 2 years" />
            {errors.experience && <p className="text-xs text-red-600 mt-1">{errors.experience}</p>}
          </div>
        </div>

        <div>
          <label className="label-text">Skills *</label>
          <input type="text" value={form.skills} onChange={(e) => handleChange('skills', e.target.value)} className="input-field" placeholder="React, Node.js, SQL" />
          {errors.skills && <p className="text-xs text-red-600 mt-1">{errors.skills}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label-text">Current Company (Optional)</label>
            <input type="text" value={form.currentCompany} onChange={(e) => handleChange('currentCompany', e.target.value)} className="input-field" />
          </div>
          <div>
            <label className="label-text">Expected Salary *</label>
            <input type="text" value={form.expectedSalary} onChange={(e) => handleChange('expectedSalary', e.target.value)} className="input-field" placeholder="e.g. ₹12,00,000/year" />
            {errors.expectedSalary && <p className="text-xs text-red-600 mt-1">{errors.expectedSalary}</p>}
          </div>
        </div>

        <div>
          <label className="label-text">Portfolio / LinkedIn (Optional)</label>
          <input type="text" value={form.portfolioUrl} onChange={(e) => handleChange('portfolioUrl', e.target.value)} className="input-field" placeholder="https://linkedin.com/in/..." />
        </div>

        <div>
          <label className="label-text">Cover Letter *</label>
          <textarea
            rows={4}
            value={form.coverLetter}
            onChange={(e) => handleChange('coverLetter', e.target.value)}
            className="input-field resize-none"
            placeholder="Tell us why you're a great fit for this role..."
          />
          {errors.coverLetter && <p className="text-xs text-red-600 mt-1">{errors.coverLetter}</p>}
        </div>

        <div>
          <label className="label-text">Resume Upload (PDF/DOC) *</label>
          <input
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={handleFileChange}
            className="hidden"
            id="resume-upload"
          />
          <label htmlFor="resume-upload" className="inline-flex items-center gap-2 btn-secondary cursor-pointer">
            <Upload className="w-4 h-4" />
            {resumeFile ? resumeFile.name : 'Choose File'}
          </label>
          {errors.resume && <p className="text-xs text-red-600 mt-1">{errors.resume}</p>}
        </div>

        <button type="submit" disabled={submitting} className="btn-3d w-full disabled:opacity-50">
          {submitting ? 'Submitting...' : 'Submit Application'}
        </button>
      </form>
    </div>
  );
};

export default JobApply;
