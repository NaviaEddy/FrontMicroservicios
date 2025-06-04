import React from 'react';
import { Link } from 'react-router-dom';
const NotFound: React.FC = () => {
  return <div className="text-center py-16">
      <h1 className="text-6xl font-bold text-indigo-600 mb-4">404</h1>
      <h2 className="text-3xl font-semibold text-gray-900 mb-6">
        Page Not Found
      </h2>
      <p className="text-gray-600 mb-8 max-w-md mx-auto">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link to="/" className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700">
        Go back home
      </Link>
    </div>;
};
export default NotFound;