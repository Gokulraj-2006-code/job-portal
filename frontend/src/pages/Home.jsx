import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Briefcase, Users, Award, TrendingUp, ArrowRight, Building } from 'lucide-react';
import { useJobs } from '../context/JobContext';
import JobCard from '../components/jobs/JobCard';
import { companyService } from '../services/companyService';
import AuthGateLink from '../components/AuthGateLink';

const Home = () => {
  const { jobs, loading, fetchJobs } = useJobs();
  const [companies, setCompanies] = useState([]);

  useEffect(() => {
    fetchJobs();
    companyService.getCompanies().then(setCompanies);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const features = [
    {
      icon: Briefcase,
      title: 'Find Jobs',
      description: 'Browse thousands of job opportunities from top companies',
    },
    {
      icon: Users,
      title: 'Network',
      description: 'Connect with professionals and recruiters in your industry',
    },
    {
      icon: Award,
      title: 'Career Growth',
      description: 'Access resources to advance your career',
    },
    {
      icon: TrendingUp,
      title: 'AI Matching',
      description: 'Get job recommendations tailored to your skills',
    },
  ];

  return (
    <div className="page-home">
      {/* Hero Section */}
      <section className="home-hero-section bg-gradient-to-r from-primary-900 to-primary-700 text-white py-20">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
              Your Dream Job Awaits
            </h1>
            <p className="text-lg sm:text-xl text-primary-100 mb-8">
              Find the perfect career opportunity with our AI-powered job matching platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/jobs" className="bg-white text-primary-700 px-8 py-3 rounded-lg font-semibold hover:bg-primary-50 transition dark:bg-slate-900 dark:text-primary-300 text-center">
                Browse Jobs
              </Link>
              <Link to="/register" className="bg-primary-800 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-900 transition text-center">
                Get Started
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="home-features-section py-16 bg-white dark:bg-slate-900">
        <div className="container-custom">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose JobPortal</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="text-center p-6 rounded-xl border border-slate-200 hover:shadow-lg transition dark:border-slate-800"
              >
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4 dark:bg-primary-900/40">
                  <feature.icon className="w-6 h-6 text-primary-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Jobs */}
      <section className="home-featured-jobs-section py-16">
        <div className="container-custom">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">Featured Jobs</h2>
            <Link to="/jobs" className="text-primary-600 hover:text-primary-700 font-semibold flex items-center">
              View All <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              <div className="col-span-3 text-center py-12">Loading jobs...</div>
            ) : jobs.slice(0, 3).map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        </div>
      </section>

      {/* Featured Companies - same companies list shown on the Companies page */}
      <section className="home-featured-companies-section py-16 bg-white dark:bg-slate-900">
        <div className="container-custom">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">Featured Companies</h2>
            <Link to="/companies" className="text-primary-600 hover:text-primary-700 font-semibold flex items-center">
              View All <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {companies.slice(0, 3).map((company) => (
              <AuthGateLink key={company.id} to={`/companies/${company.id}`} className="card p-6 flex items-center gap-4">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center shrink-0 dark:bg-primary-900/40">
                  {company.logo ? (
                    <img src={company.logo} alt={company.name} className="w-8 h-8 rounded" />
                  ) : (
                    <Building className="w-6 h-6 text-primary-600" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold">{company.name}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{company.industry} · {company.jobCount} open roles</p>
                </div>
              </AuthGateLink>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
