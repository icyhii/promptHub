import { Link } from 'react-router-dom';
import Button from '../components/common/Button';
import { Home, AlertCircle } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center">
      <div className="text-center max-w-md">
        <div className="mb-6 flex justify-center">
          <div className="p-4 bg-error-100 dark:bg-error-900/30 rounded-full text-error-500">
            <AlertCircle size={40} />
          </div>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-3">404 - Page Not Found</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-8">
          Oops! The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex justify-center">
          <Link to="/">
            <Button leftIcon={<Home size={16} />}>Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}