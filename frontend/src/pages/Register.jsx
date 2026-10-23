import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, Phone, Briefcase, Building } from 'lucide-react';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z
    .string()
    .min(1, 'Mobile number is required')
    .regex(/^\+?[\d\s-]{7,15}$/, 'Enter a valid mobile number'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  role: z.enum(['seeker', 'recruiter']),
  companyName: z.string().optional(),
  headline: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

const Register = () => {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirect');
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: 'seeker',
    },
  });

  const role = watch('role');

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      await registerUser({
        name: data.name,
        email: data.email,
        phone: data.phone,
        password: data.password,
        role: data.role,
        companyName: data.companyName,
        headline: data.headline,
      });
      navigate(redirectTo || '/dashboard');
    } catch (error) {
      // Error handled in auth context
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="page-register min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 dark:bg-slate-900">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg dark:bg-slate-900">
        <div>
          <h2 className="text-center text-3xl font-bold text-slate-900 dark:text-white">
            Create Account
          </h2>
          <p className="mt-2 text-center text-sm text-slate-600 dark:text-slate-300">
            Join thousands of professionals
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label className="label-text">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5 dark:text-slate-500" />
              <input
                type="text"
                {...register('name')}
                className="input-field pl-10"
                placeholder="John Doe"
              />
            </div>
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="label-text">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5 dark:text-slate-500" />
              <input
                type="email"
                {...register('email')}
                className="input-field pl-10"
                placeholder="you@example.com"
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="label-text">Mobile Number</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5 dark:text-slate-500" />
              <input
                type="tel"
                {...register('phone')}
                className="input-field pl-10"
                placeholder="+91 98765 43210"
              />
            </div>
            {errors.phone && (
              <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
            )}
          </div>

          <div>
            <label className="label-text">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5 dark:text-slate-500" />
              <input
                type="password"
                {...register('password')}
                className="input-field pl-10"
                placeholder="••••••••"
              />
            </div>
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
            )}
          </div>

          <div>
            <label className="label-text">Confirm Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5 dark:text-slate-500" />
              <input
                type="password"
                {...register('confirmPassword')}
                className="input-field pl-10"
                placeholder="••••••••"
              />
            </div>
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
            )}
          </div>

          <div>
            <label className="label-text">I am a</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setValue('role', 'seeker', { shouldValidate: true })}
                className={`p-3 rounded-lg border-2 transition ${
                  role === 'seeker'
                    ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/30'
                    : 'border-slate-200 hover:border-slate-300 dark:border-slate-700 dark:hover:border-slate-500'
                }`}
              >
                <Briefcase className="w-5 h-5 mx-auto mb-1" />
                <span className="text-sm">Job Seeker</span>
              </button>
              <button
                type="button"
                onClick={() => setValue('role', 'recruiter', { shouldValidate: true })}
                className={`p-3 rounded-lg border-2 transition ${
                  role === 'recruiter'
                    ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/30'
                    : 'border-slate-200 hover:border-slate-300 dark:border-slate-700 dark:hover:border-slate-500'
                }`}
              >
                <Building className="w-5 h-5 mx-auto mb-1" />
                <span className="text-sm">Recruiter</span>
              </button>
            </div>
          </div>

          {role === 'recruiter' && (
            <div>
              <label className="label-text">Company Name</label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5 dark:text-slate-500" />
                <input
                  type="text"
                  {...register('companyName')}
                  className="input-field pl-10"
                  placeholder="Acme Inc."
                />
              </div>
            </div>
          )}

          {role === 'seeker' && (
            <div>
              <label className="label-text">Professional Headline</label>
              <input
                type="text"
                {...register('headline')}
                className="input-field"
                placeholder="Full Stack Developer | React Expert"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Creating account...' : 'Create Account'}
          </button>

          <p className="text-center text-sm text-slate-600 dark:text-slate-300">
            Already have an account?{' '}
            <Link
              to={redirectTo ? `/login?redirect=${encodeURIComponent(redirectTo)}` : '/login'}
              className="text-primary-600 hover:text-primary-500 font-semibold"
            >
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Register;