// src/components/NotFound.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="page-not-found min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-primary-600">404</h1>
        <h2 className="text-2xl font-semibold mt-4">Page Not Found</h2>
        <p className="text-slate-600 mt-2 dark:text-slate-300">The page you&apos;re looking for doesn&apos;t exist.</p>
        <Link to="/" className="btn-primary mt-6 inline-block">
          Go Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;