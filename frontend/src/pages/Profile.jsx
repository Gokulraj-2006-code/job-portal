import React, { useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/userService';
import {
  User, Mail, Phone, MapPin, FileText, Upload, Trash2, Plus, X, Camera,
  GraduationCap, Briefcase as BriefcaseIcon,
} from 'lucide-react';
import toast from 'react-hot-toast';

const fileToBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const emptyEducation = () => ({ id: `edu_${Date.now()}_${Math.random()}`, degree: '', institution: '', year: '' });
const emptyExperience = () => ({ id: `exp_${Date.now()}_${Math.random()}`, title: '', company: '', duration: '', description: '' });

const Profile = () => {
  const { user, updateUser } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [headline, setHeadline] = useState(user?.headline || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [location, setLocation] = useState(user?.location || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [skills, setSkills] = useState(user?.skills || []);
  const [skillInput, setSkillInput] = useState('');
  const [education, setEducation] = useState(user?.education?.length ? user.education : [emptyEducation()]);
  const [experience, setExperience] = useState(user?.experience?.length ? user.experience : [emptyExperience()]);

  const [saving, setSaving] = useState(false);
  const [resume, setResume] = useState(user?.resume || null);
  const [uploadingResume, setUploadingResume] = useState(false);
  const fileInputRef = useRef(null);
  const [avatar, setAvatar] = useState(user?.avatar || null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const avatarInputRef = useRef(null);

  const handleAddSkill = (e) => {
    e.preventDefault();
    const value = skillInput.trim();
    if (value && !skills.includes(value)) {
      setSkills([...skills, value]);
    }
    setSkillInput('');
  };

  const handleRemoveSkill = (skill) => {
    setSkills(skills.filter((s) => s !== skill));
  };

  const updateEducation = (id, field, value) => {
    setEducation(education.map((edu) => (edu.id === id ? { ...edu, [field]: value } : edu)));
  };

  const updateExperience = (id, field, value) => {
    setExperience(experience.map((exp) => (exp.id === id ? { ...exp, [field]: value } : exp)));
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Resume must be under 5MB');
      return;
    }
    setUploadingResume(true);
    try {
      const updated = await userService.uploadResume(file);
      setResume(updated.resume);
      updateUser(updated);
      toast.success('Resume uploaded');
    } catch (error) {
      toast.error(error?.message || 'Failed to upload resume');
    } finally {
      setUploadingResume(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDeleteResume = async () => {
    try {
      const updated = await userService.deleteResume();
      setResume(null);
      updateUser(updated);
      toast.success('Resume removed');
    } catch (error) {
      toast.error(error?.message || 'Failed to remove resume');
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Photo must be under 2MB');
      return;
    }
    setUploadingAvatar(true);
    try {
      const dataUrl = await fileToBase64(file);
      const updated = await userService.uploadAvatar(dataUrl);
      setAvatar(updated.avatar);
      updateUser(updated);
      toast.success('Profile photo updated');
    } catch (error) {
      toast.error(error?.message || 'Failed to upload photo');
    } finally {
      setUploadingAvatar(false);
      if (avatarInputRef.current) avatarInputRef.current.value = '';
    }
  };

  const handleDeleteAvatar = async () => {
    try {
      const updated = await userService.deleteAvatar();
      setAvatar(null);
      updateUser(updated);
      toast.success('Profile photo removed');
    } catch (error) {
      toast.error(error?.message || 'Failed to remove photo');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await userService.updateProfile({
        name,
        headline,
        phone,
        location,
        bio,
        skills,
        education: education.filter((edu) => edu.degree || edu.institution),
        experience: experience.filter((exp) => exp.title || exp.company),
      });
      updateUser(updated);
      toast.success('Profile updated');
    } catch (error) {
      toast.error(error?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-dashboard-profile">
      <h1 className="text-2xl font-bold mb-6">Profile</h1>

      <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
        {/* Header / Basic Info */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 dark:bg-slate-800 dark:border-slate-700">
          <div className="flex items-center gap-4 mb-6">
            <div className="relative shrink-0 group">
              <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center overflow-hidden dark:bg-primary-900/40">
                {avatar ? (
                  <img src={avatar} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-8 h-8 text-primary-600" />
                )}
              </div>
              <label
                htmlFor="avatar-upload"
                className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary-600 hover:bg-primary-700 text-white rounded-full flex items-center justify-center cursor-pointer transition shadow"
                title={avatar ? 'Change photo' : 'Upload photo'}
              >
                <Camera className="w-3.5 h-3.5" />
              </label>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
                id="avatar-upload"
              />
            </div>
            <div>
              <p className="font-semibold text-lg">{name || 'Your Name'}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">{headline || 'Add a professional headline'}</p>
              <div className="flex items-center gap-3 mt-1">
                {uploadingAvatar && (
                  <span className="text-xs text-slate-400 dark:text-slate-500">Uploading...</span>
                )}
                {avatar && !uploadingAvatar && (
                  <button
                    type="button"
                    onClick={handleDeleteAvatar}
                    className="text-xs text-red-500 hover:text-red-600 transition"
                  >
                    Remove photo
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label-text">Full Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="label-text">Headline</label>
              <input
                type="text"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                className="input-field"
                placeholder="Full Stack Developer | React Expert"
              />
            </div>
            <div>
              <label className="label-text flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> Email</label>
              <input type="email" value={user?.email || ''} disabled className="input-field opacity-60 cursor-not-allowed" />
            </div>
            <div>
              <label className="label-text flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> Phone</label>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="input-field" />
            </div>
            <div className="sm:col-span-2">
              <label className="label-text flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> Location</label>
              <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} className="input-field" placeholder="City, Country" />
            </div>
          </div>

          <div className="mt-4">
            <label className="label-text">About</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              className="input-field resize-none"
              placeholder="A short summary about your experience and what you're looking for..."
            />
          </div>
        </div>

        {/* Resume */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 dark:bg-slate-800 dark:border-slate-700">
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary-600" /> Resume
          </h2>
          {resume ? (
            <div className="flex items-center justify-between bg-slate-50 rounded-lg p-4 dark:bg-slate-700">
              <div>
                <p className="text-sm font-medium">{resume.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {(resume.size / 1024).toFixed(0)} KB
                </p>
              </div>
              <button
                type="button"
                onClick={handleDeleteResume}
                className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition dark:hover:bg-red-900/30"
                aria-label="Remove resume"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">No resume uploaded yet</p>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={handleResumeUpload}
            className="hidden"
            id="resume-upload"
          />
          <label
            htmlFor="resume-upload"
            className="mt-3 inline-flex items-center gap-2 btn-secondary cursor-pointer w-fit"
          >
            <Upload className="w-4 h-4" />
            {uploadingResume ? 'Uploading...' : resume ? 'Replace Resume' : 'Upload Resume'}
          </label>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">PDF or Word, up to 5MB</p>
        </div>

        {/* Skills */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 dark:bg-slate-800 dark:border-slate-700">
          <h2 className="font-semibold mb-4">Skills</h2>
          <div className="flex flex-wrap gap-2 mb-4">
            {skills.map((skill) => (
              <span
                key={skill}
                className="flex items-center gap-1 px-3 py-1 bg-primary-50 text-primary-700 text-sm font-medium rounded-full dark:bg-primary-900/40 dark:text-primary-300"
              >
                {skill}
                <button type="button" onClick={() => handleRemoveSkill(skill)} aria-label={`Remove ${skill}`}>
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
            {skills.length === 0 && (
              <p className="text-sm text-slate-400 dark:text-slate-500">No skills added yet</p>
            )}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddSkill(e)}
              className="input-field"
              placeholder="e.g. React, Node.js, SQL"
            />
            <button type="button" onClick={handleAddSkill} className="btn-secondary shrink-0">
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Education */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 dark:bg-slate-800 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-primary-600" /> Education
            </h2>
            <button
              type="button"
              onClick={() => setEducation([...education, emptyEducation()])}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1 dark:text-primary-400"
            >
              <Plus className="w-4 h-4" /> Add
            </button>
          </div>
          <div className="space-y-4">
            {education.map((edu) => (
              <div key={edu.id} className="grid grid-cols-1 sm:grid-cols-3 gap-3 pb-4 border-b border-slate-100 last:border-0 last:pb-0 dark:border-slate-700">
                <input
                  type="text"
                  value={edu.degree}
                  onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)}
                  className="input-field"
                  placeholder="Degree (e.g. B.Tech Computer Science)"
                />
                <input
                  type="text"
                  value={edu.institution}
                  onChange={(e) => updateEducation(edu.id, 'institution', e.target.value)}
                  className="input-field"
                  placeholder="Institution"
                />
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={edu.year}
                    onChange={(e) => updateEducation(edu.id, 'year', e.target.value)}
                    className="input-field"
                    placeholder="Year"
                  />
                  {education.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setEducation(education.filter((e) => e.id !== edu.id))}
                      className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition shrink-0 dark:hover:bg-red-900/30"
                      aria-label="Remove education entry"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Experience */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 dark:bg-slate-800 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold flex items-center gap-2">
              <BriefcaseIcon className="w-5 h-5 text-primary-600" /> Experience
            </h2>
            <button
              type="button"
              onClick={() => setExperience([...experience, emptyExperience()])}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1 dark:text-primary-400"
            >
              <Plus className="w-4 h-4" /> Add
            </button>
          </div>
          <div className="space-y-4">
            {experience.map((exp) => (
              <div key={exp.id} className="pb-4 border-b border-slate-100 last:border-0 last:pb-0 dark:border-slate-700 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={exp.title}
                    onChange={(e) => updateExperience(exp.id, 'title', e.target.value)}
                    className="input-field"
                    placeholder="Job Title"
                  />
                  <input
                    type="text"
                    value={exp.company}
                    onChange={(e) => updateExperience(exp.id, 'company', e.target.value)}
                    className="input-field"
                    placeholder="Company"
                  />
                </div>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={exp.duration}
                    onChange={(e) => updateExperience(exp.id, 'duration', e.target.value)}
                    className="input-field"
                    placeholder="Duration (e.g. 2021 - Present)"
                  />
                  {experience.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setExperience(experience.filter((x) => x.id !== exp.id))}
                      className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition shrink-0 dark:hover:bg-red-900/30"
                      aria-label="Remove experience entry"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <textarea
                  value={exp.description}
                  onChange={(e) => updateExperience(exp.id, 'description', e.target.value)}
                  rows={2}
                  className="input-field resize-none"
                  placeholder="What did you work on?"
                />
              </div>
            ))}
          </div>
        </div>

        <button type="submit" disabled={saving} className="btn-primary disabled:opacity-50">
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
};

export default Profile;
