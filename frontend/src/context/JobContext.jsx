import React, { createContext, useContext, useState, useCallback } from 'react';
import { jobService } from '../services/jobService';

const JobContext = createContext(undefined);

export const JobProvider = ({ children }) => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [savedJobs, setSavedJobs] = useState([]);
  const [filters, setFilters] = useState({});

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const data = await jobService.getJobs(filters);
      setJobs(data);
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const getJob = async (id) => {
    return await jobService.getJob(id);
  };

  const applyToJob = async (jobId, data) => {
    await jobService.applyToJob(jobId, data);
  };

  const toggleSaveJob = async (jobId) => {
    const isSaved = savedJobs.includes(jobId);
    if (isSaved) {
      await jobService.unsaveJob(jobId);
      setSavedJobs(prev => prev.filter(id => id !== jobId));
    } else {
      await jobService.saveJob(jobId);
      setSavedJobs(prev => [...prev, jobId]);
    }
  };

  return (
    <JobContext.Provider
      value={{
        jobs,
        loading,
        filters,
        setFilters,
        fetchJobs,
        getJob,
        applyToJob,
        savedJobs,
        toggleSaveJob,
      }}
    >
      {children}
    </JobContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components -- useJobs hook is intentionally colocated with JobProvider
export const useJobs = () => {
  const context = useContext(JobContext);
  if (!context) {
    throw new Error('useJobs must be used within a JobProvider');
  }
  return context;
};