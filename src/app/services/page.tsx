"use client";

import { useAuth } from "@/context/AuthContext";
import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/Button";
import { motion } from "framer-motion";
import { FaCoins, FaHeart, FaUser, FaPlay, FaComments } from "react-icons/fa";
import Link from "next/link";

export default function ServicesPage() {
  const { userData } = useAuth();

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Instagram Engagement Services
            </h1>
            <p className="mt-1 text-gray-600">
              Boost your Instagram presence with our premium services
            </p>
          </div>
          
          <div className="mt-4 md:mt-0 flex items-center">
            <div className="flex items-center bg-yellow-100 rounded-full px-3 py-1">
              <FaCoins className="text-yellow-500 mr-1" />
              <span className="font-semibold text-yellow-800">
                {userData?.coins || 0} coins
              </span>
            </div>
          </div>
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-lg shadow-md p-6"
        >
          <div className="text-center py-8">
            <h2 className="text-xl font-bold mb-4">Services Currently Unavailable</h2>
            <p className="text-gray-600 mb-6">
              We're currently updating our service offerings to provide you with better performance and reliability.
              Please check back soon for our improved Instagram engagement services.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
              <div className="bg-gray-50 p-4 rounded-lg flex flex-col items-center">
                <FaHeart className="text-red-500 text-3xl mb-2" />
                <h3 className="font-medium">Likes</h3>
                <p className="text-gray-500 text-sm">Coming soon</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg flex flex-col items-center">
                <FaUser className="text-blue-500 text-3xl mb-2" />
                <h3 className="font-medium">Followers</h3>
                <p className="text-gray-500 text-sm">Coming soon</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg flex flex-col items-center">
                <FaPlay className="text-purple-500 text-3xl mb-2" />
                <h3 className="font-medium">Views</h3>
                <p className="text-gray-500 text-sm">Coming soon</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg flex flex-col items-center">
                <FaComments className="text-green-500 text-3xl mb-2" />
                <h3 className="font-medium">Comments</h3>
                <p className="text-gray-500 text-sm">Coming soon</p>
              </div>
            </div>
            <div className="mt-8">
              <Link href="/dashboard">
                <Button>
                  Return to Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </AppLayout>
  );
} 