"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import AppLayout from "@/components/layout/AppLayout";
import { BoostData } from "@/lib/api";
import { getUserBoosts } from "@/lib/firestore";
import { FaCoins, FaHeart, FaUsers, FaPlay, FaComments } from "react-icons/fa";
import { motion } from "framer-motion";
import Link from "next/link";

export default function DashboardPage() {
  const { userData, user } = useAuth();
  const [boosts, setBoosts] = useState<BoostData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBoosts = async () => {
      if (user?.uid) {
        try {
          const userBoosts = await getUserBoosts(user.uid);
          setBoosts(userBoosts);
        } catch (error) {
          console.error("Error fetching boosts:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchBoosts();
  }, [user]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "likes":
        return <FaHeart className="text-red-500" />;
      case "followers":
        return <FaUsers className="text-blue-500" />;
      case "reels":
        return <FaPlay className="text-purple-500" />;
      case "comments":
        return <FaComments className="text-green-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto">
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              Dashboard
            </h2>
          </div>
        </div>

        {/* Coins and quick actions */}
        <div className="mt-6 mb-10">
          <motion.div 
            className="bg-gradient-to-r from-yellow-50 to-amber-50 rounded-lg shadow-md overflow-hidden border border-yellow-100"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-yellow-100 rounded-full p-4 shadow-inner border border-yellow-200">
                  <FaCoins className="h-8 w-8 text-yellow-600" />
                </div>
                <div className="ml-5">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Available Coins
                  </h3>
                  <div className="mt-2 text-3xl font-bold text-gray-900 flex items-center">
                    <span>{userData?.coins || 0}</span>
                    <Link href="/coins" className="ml-4">
                      <motion.button 
                        className="bg-yellow-500 hover:bg-yellow-600 text-white text-sm py-1 px-3 rounded-full transition-colors duration-200 flex items-center"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <FaCoins className="mr-1 h-3 w-3" /> Buy More
                      </motion.button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-6 py-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Link href="/boost/likes" className="block w-full">
                  <motion.div 
                    className="bg-white p-5 rounded-lg border border-gray-200 flex items-center justify-between cursor-pointer hover:shadow-md hover:border-red-300 transition-all hover:bg-red-50"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center">
                      <div className="bg-red-100 p-2 rounded-full">
                        <FaHeart className="h-5 w-5 text-red-500" />
                      </div>
                      <span className="ml-3 font-medium text-gray-800">Boost Likes</span>
                    </div>
                    <span className="text-red-400 font-bold text-lg">→</span>
                  </motion.div>
                </Link>
                
                <Link href="/boost/followers" className="block w-full">
                  <motion.div 
                    className="bg-white p-5 rounded-lg border border-gray-200 flex items-center justify-between cursor-pointer hover:shadow-md hover:border-blue-300 transition-all hover:bg-blue-50"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center">
                      <div className="bg-blue-100 p-2 rounded-full">
                        <FaUsers className="h-5 w-5 text-blue-500" />
                      </div>
                      <span className="ml-3 font-medium text-gray-800">Boost Followers</span>
                    </div>
                    <span className="text-blue-400 font-bold text-lg">→</span>
                  </motion.div>
                </Link>
                
                <Link href="/boost/reels" className="block w-full">
                  <motion.div 
                    className="bg-white p-5 rounded-lg border border-gray-200 flex items-center justify-between cursor-pointer hover:shadow-md hover:border-purple-300 transition-all hover:bg-purple-50"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center">
                      <div className="bg-purple-100 p-2 rounded-full">
                        <FaPlay className="h-5 w-5 text-purple-500" />
                      </div>
                      <span className="ml-3 font-medium text-gray-800">Boost Reels</span>
                    </div>
                    <span className="text-purple-400 font-bold text-lg">→</span>
                  </motion.div>
                </Link>
                
                <Link href="/boost/comments" className="block w-full">
                  <motion.div 
                    className="bg-white p-5 rounded-lg border border-gray-200 flex items-center justify-between cursor-pointer hover:shadow-md hover:border-green-300 transition-all hover:bg-green-50"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center">
                      <div className="bg-green-100 p-2 rounded-full">
                        <FaComments className="h-5 w-5 text-green-500" />
                      </div>
                      <span className="ml-3 font-medium text-gray-800">Boost Comments</span>
                    </div>
                    <span className="text-green-400 font-bold text-lg">→</span>
                  </motion.div>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Recent Boosts */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg leading-6 font-semibold text-gray-900">
              Recent Boosts
            </h3>
            <Link href="/dashboard/orders">
              <span className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                View all →
              </span>
            </Link>
          </div>
          
          {loading ? (
            <div className="text-center py-10 bg-white rounded-lg shadow-md">
              <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent mx-auto"></div>
              <p className="mt-2 text-gray-500">Loading your boosts...</p>
            </div>
          ) : boosts.length === 0 ? (
            <div className="bg-white shadow-md rounded-lg">
              <div className="px-4 py-10 sm:p-6 text-center">
                <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-blue-100 mb-4">
                  <FaPlay className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Boosts Yet</h3>
                <p className="text-gray-500 mb-4">You haven't made any boosts yet.</p>
                <Link href="/boost/likes">
                  <motion.button
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Start Boosting Now
                  </motion.button>
                </Link>
              </div>
            </div>
          ) : (
            <motion.div 
              className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-100"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <ul className="divide-y divide-gray-200">
                {boosts.slice(0, 5).map((boost) => (
                  <li key={boost.id} className="px-6 py-5 hover:bg-gray-50 transition-colors duration-150">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="p-2 rounded-full bg-gray-100 mr-4">
                          {getTypeIcon(boost.type)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {boost.type.charAt(0).toUpperCase() + boost.type.slice(1)} Boost
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            {boost.target.length > 40 
                              ? `${boost.target.substring(0, 40)}...` 
                              : boost.target}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(boost.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className={`px-3 py-1 text-xs rounded-full ${getStatusColor(boost.status)} mb-2`}>
                          {boost.status.charAt(0).toUpperCase() + boost.status.slice(1)}
                        </span>
                        <span className="flex items-center text-sm text-gray-600 font-medium">
                          <FaCoins className="mr-1 h-3 w-3 text-yellow-500" />
                          {boost.cost} coins
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
              {boosts.length > 5 && (
                <div className="bg-gray-50 px-6 py-3 border-t border-gray-100">
                  <Link href="/dashboard/orders" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                    View all {boosts.length} boosts
                  </Link>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </AppLayout>
  );
} 