import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { FaCoins, FaShoppingCart, FaListAlt, FaStore, FaUser } from 'react-icons/fa';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const { user, userData, logOut } = useAuth();
  const pathname = usePathname();

  // Determine if a link is active
  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link 
              href="/" 
              className="flex-shrink-0 flex items-center"
              aria-label="Go to homepage"
            >
              <div className="flex items-center">
                <h1 className="text-2xl font-bold text-blue-600">
                  InstaBooster
                </h1>
              </div>
            </Link>
            {user && (
              <nav className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link
                  href="/dashboard"
                  className={`${
                    isActive('/dashboard') 
                      ? 'border-blue-500 text-blue-600' 
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                >
                  Dashboard
                </Link>
                <Link
                  href="/dashboard/orders"
                  className={`${
                    isActive('/dashboard/orders') 
                      ? 'border-blue-500 text-blue-600' 
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                >
                  <FaListAlt className="mr-1" />
                  Orders
                </Link>
                <Link
                  href="/services"
                  className={`${
                    isActive('/services') 
                      ? 'border-blue-500 text-blue-600' 
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                >
                  <FaStore className="mr-1" />
                  Services
                </Link>
                <Link
                  href="/boost/likes"
                  className={`${
                    isActive('/boost/likes') 
                      ? 'border-blue-500 text-blue-600' 
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                >
                  Boost Likes
                </Link>
                <Link
                  href="/boost/followers"
                  className={`${
                    isActive('/boost/followers') 
                      ? 'border-blue-500 text-blue-600' 
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                >
                  Boost Followers
                </Link>
                <Link
                  href="/boost/reels"
                  className={`${
                    isActive('/boost/reels') 
                      ? 'border-blue-500 text-blue-600' 
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                >
                  Boost Reels
                </Link>
                {userData?.isAdmin && (
                  <Link
                    href="/admin"
                    className={`${
                      isActive('/admin') 
                        ? 'border-blue-500 text-blue-600' 
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                  >
                    Admin Panel
                  </Link>
                )}
              </nav>
            )}
          </div>
          <div className="flex items-center">
            {user ? (
              <div className="flex items-center gap-4">
                <motion.div 
                  className="flex items-center gap-1 bg-yellow-100 rounded-full px-3 py-1"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FaCoins className="text-yellow-500" />
                  <span className="font-semibold text-yellow-800">
                    {userData?.coins || 0}
                  </span>
                </motion.div>
                
                <Link href="/profile">
                  <Button
                    variant="outline"
                    size="sm"
                    className={isActive('/profile') ? 'border-blue-500 text-blue-600' : ''}
                  >
                    <FaUser className="mr-1" />
                    Profile
                  </Button>
                </Link>
                
                {pathname !== '/services' && (
                  <Link href="/services">
                    <Button
                      variant="primary"
                      size="sm"
                      className="mr-2"
                    >
                      <FaShoppingCart className="mr-1" />
                      Buy Services
                    </Button>
                  </Link>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => logOut()}
                >
                  Sign Out
                </Button>
              </div>
            ) : (
              <div>
                <Link href="/login">
                  <Button variant="primary" size="sm">
                    Sign In
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
} 