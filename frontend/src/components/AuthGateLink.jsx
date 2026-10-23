// src/components/AuthGateLink.jsx
// A drop-in replacement for react-router-dom's <Link> that requires the
// visitor to be signed in before navigating. If they aren't signed in,
// clicking sends them to /login (with a redirect param) first; once they
// log in, they land on the page they originally tried to open.
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AuthGateLink = ({ to, onClick, children, ...rest }) => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleClick = (e) => {
    if (onClick) onClick(e);
    if (e.defaultPrevented) return;

    if (!isAuthenticated) {
      e.preventDefault();
      navigate(`/login?redirect=${encodeURIComponent(to)}`);
    }
  };

  return (
    <Link to={to} onClick={handleClick} {...rest}>
      {children}
    </Link>
  );
};

export default AuthGateLink;
