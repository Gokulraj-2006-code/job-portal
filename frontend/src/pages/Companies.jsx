import React, { useEffect, useState } from 'react';
import { Building } from 'lucide-react';
import { companyService } from '../services/companyService';
import AuthGateLink from '../components/AuthGateLink';

const Companies = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const data = await companyService.getCompanies();
        if (isMounted) setCompanies(Array.isArray(data) ? data : []);
      } catch (error) {
        if (isMounted) setCompanies([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    load();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="page-companies container-custom py-8">
      <h1 className="text-3xl font-bold mb-8">Companies</h1>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-32 bg-slate-100 rounded-lg animate-pulse dark:bg-slate-800" />
          ))}
        </div>
      ) : companies.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl dark:bg-slate-900">
          <p className="text-slate-500 dark:text-slate-400">No companies found yet</p>
        </div>
      ) : (
        <div className="company-card-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {companies.map((company) => (
            <AuthGateLink key={company.id} to={`/companies/${company.id}`} className="company-card card p-6 flex items-center gap-4">
              <div className="company-card-logo w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center shrink-0 dark:bg-primary-900/40">
                {company.logo ? (
                  <img src={company.logo} alt={company.name} className="w-8 h-8 rounded" />
                ) : (
                  <Building className="w-6 h-6 text-primary-600" />
                )}
              </div>
              <div className="min-w-0">
                <h3 className="company-card-name font-semibold">{company.name}</h3>
                <p className="company-card-meta text-sm text-slate-500 dark:text-slate-400">{company.industry} · {company.jobCount} open roles</p>
              </div>
            </AuthGateLink>
          ))}
        </div>
      )}
    </div>
  );
};

export default Companies;
