import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase, Building, Users, Target, Rocket, ShieldCheck, HeartHandshake,
  Search, UserPlus, Send, CheckCircle2,
} from 'lucide-react';
import { jobService } from '../services/jobService';
import { companyService } from '../services/companyService';

const About = () => {
  const [stats, setStats] = useState({ jobs: 0, companies: 0 });

  useEffect(() => {
    Promise.all([jobService.getJobs({}), companyService.getCompanies()]).then(
      ([jobs, companies]) => setStats({ jobs: jobs.length, companies: companies.length })
    );
  }, []);

  const statCards = [
    { icon: Briefcase, label: 'Active Job Listings', value: stats.jobs },
    { icon: Building, label: 'Hiring Companies', value: stats.companies },
    { icon: Users, label: 'Registered Job Seekers', value: '2' },
    { icon: Target, label: 'Successful Placements', value: '1' },
  ];

  const values = [
    {
      icon: Rocket,
      title: 'Move Fast',
      description: 'Streamlined applications and recruiter workflows mean less waiting and faster hiring decisions for everyone.',
    },
    {
      icon: ShieldCheck,
      title: 'Trust & Safety',
      description: 'Every company and job listing is reviewed before it goes live, so job seekers can apply with confidence.',
    },
    {
      icon: HeartHandshake,
      title: 'Fair Opportunities',
      description: 'We give equal visibility to startups and enterprises alike, helping talent discover roles beyond the obvious names.',
    },
  ];

  const steps = [
    {
      icon: UserPlus,
      title: 'Create your account',
      description: 'Sign up as a job seeker or recruiter using your email address or mobile number in just a few seconds.',
    },
    {
      icon: Search,
      title: 'Discover the right match',
      description: 'Browse curated listings by role, location, experience level, and skills, or explore companies directly.',
    },
    {
      icon: Send,
      title: 'Apply or hire',
      description: 'Job seekers submit applications in one click; recruiters review candidates and manage every stage of the pipeline.',
    },
    {
      icon: CheckCircle2,
      title: 'Track progress',
      description: 'Follow every application from "Applied" through "Shortlisted" to a final decision, all in one dashboard.',
    },
  ];

  return (
    <div className="page-about container-custom py-16">
      <h1 className="text-3xl font-bold mb-4">About JobPortal</h1>
      <p className="text-slate-600 max-w-2xl dark:text-slate-300">
        JobPortal is a modern job matching platform built with the MERN stack.
        We connect talented professionals with amazing companies like{' '}
        <Link to="/companies" className="text-primary-600 hover:underline">
          Nimbus Technologies, Bluepeak Financial, and Verdant Health
        </Link>
        , the same employers you&apos;ll find actively hiring across our{' '}
        <Link to="/jobs" className="text-primary-600 hover:underline">job listings</Link>{' '}
        today.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
        {statCards.map(({ icon: Icon, label, value }) => (
          <div key={label} className="card p-6 text-center">
            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4 dark:bg-primary-900/40">
              <Icon className="w-6 h-6 text-primary-600" />
            </div>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
          </div>
        ))}
      </div>

      <div className="mt-16">
        <h2 className="text-2xl font-bold mb-2">Our Mission</h2>
        <p className="text-slate-600 max-w-3xl dark:text-slate-300">
          Job hunting shouldn&apos;t feel like a second job. Our mission is to remove the
          friction from hiring, on both sides of the table, so job seekers spend less
          time searching and more time growing their careers, and so companies spend
          less time sifting through noise and more time meeting great candidates.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
        <div>
          <h2 className="text-xl font-semibold mb-3">For Job Seekers</h2>
          <p className="text-slate-600 dark:text-slate-300">
            Build a profile, upload your resume, and apply to roles across engineering,
            design, product, marketing, sales, finance, and HR — then track every
            application from &quot;Applied&quot; through &quot;Shortlisted&quot; to a final decision.
          </p>
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-3">For Recruiters</h2>
          <p className="text-slate-600 dark:text-slate-300">
            Post and manage job openings, review applicants, and move candidates
            through your hiring pipeline, all from one recruiter dashboard.
          </p>
        </div>
      </div>

      <div className="mt-16">
        <h2 className="text-2xl font-bold mb-8 text-center">How JobPortal Works</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map(({ icon: Icon, title, description }, index) => (
            <div key={title} className="card p-6 relative">
              <span className="absolute top-4 right-4 text-3xl font-bold text-primary-100 dark:text-primary-900/40">
                {index + 1}
              </span>
              <div className="w-11 h-11 bg-primary-100 rounded-lg flex items-center justify-center mb-4 dark:bg-primary-900/40">
                <Icon className="w-5 h-5 text-primary-600" />
              </div>
              <h3 className="font-semibold mb-2">{title}</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300">{description}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-16">
        <h2 className="text-2xl font-bold mb-8 text-center">What We Stand For</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {values.map(({ icon: Icon, title, description }) => (
            <div key={title} className="card p-6">
              <div className="w-11 h-11 bg-primary-100 rounded-lg flex items-center justify-center mb-4 dark:bg-primary-900/40">
                <Icon className="w-5 h-5 text-primary-600" />
              </div>
              <h3 className="font-semibold mb-2">{title}</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300">{description}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-16 card p-10 text-center bg-gradient-to-b from-primary-50 to-white dark:from-primary-900/20 dark:to-slate-900">
        <h2 className="text-2xl font-bold mb-3">Ready to get started?</h2>
        <p className="text-slate-600 max-w-xl mx-auto mb-6 dark:text-slate-300">
          Whether you&apos;re looking for your next role or your next great hire,
          JobPortal makes it simple to get moving.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link to="/jobs" className="btn-primary">Browse Jobs</Link>
          <Link to="/register" className="btn-outline">Create an Account</Link>
        </div>
      </div>
    </div>
  );
};

export default About;
