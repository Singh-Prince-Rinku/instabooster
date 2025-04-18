'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/Button';
import { motion } from 'framer-motion';
import { FaSpinner, FaInfoCircle } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { getUserBoosts } from '@/lib/firestore';
import { BoostData } from '@/lib/api';
import { Timestamp } from 'firebase/firestore';

export default function OrdersPage() {
  const { user } = useAuth();
  
  const [isLoading, setIsLoading] = useState(true);
  const [boosts, setBoosts] = useState<BoostData[]>([]);

  // Fetch boosts when component mounts
  useEffect(() => {
    const fetchBoosts = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        const boostsData = await getUserBoosts(user.uid);
        setBoosts(boostsData);
      } catch (error) {
        console.error('Error fetching boosts:', error);
        toast.error('Failed to load orders. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchBoosts();
  }, [user]);

  // Format date for display
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  // Helper function to handle different date formats
  const formatBoostDate = (dateValue: Date | Timestamp) => {
    if (!dateValue) return 'N/A';
    
    // Check if it's a Firestore Timestamp
    if (dateValue instanceof Timestamp || (dateValue as any)?.toDate) {
      return formatDate((dateValue as any).toDate());
    }
    
    // Regular Date object
    return formatDate(dateValue as Date);
  };
  
  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in progress':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'partial':
        return 'bg-orange-100 text-orange-800';
      case 'canceled':
        return 'bg-red-100 text-red-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Your Orders</h1>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-12">
            <FaSpinner className="animate-spin text-blue-500 h-12 w-12" />
          </div>
        ) : boosts.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <FaInfoCircle className="mx-auto mb-4 text-blue-500 h-12 w-12" />
            <h2 className="text-xl font-semibold mb-2">No orders found</h2>
            <p className="text-gray-500 mb-6">You haven't placed any orders yet.</p>
            <Button onClick={() => window.location.href = '/boost/likes'}>
              Boost Your Instagram Now
            </Button>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="bg-white rounded-lg shadow-md overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Target
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cost
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {boosts.map((boost) => (
                    <tr key={boost.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900 capitalize">
                          {boost.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 truncate max-w-xs">
                          {boost.target}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {boost.amount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {boost.cost}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(boost.status)}`}>
                          {boost.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatBoostDate(boost.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="mt-6 bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold mb-4">Order Status Information</h2>
              <div className="space-y-2">
                <div className="flex items-center">
                  <span className={`h-3 w-3 rounded-full ${getStatusColor('pending')} mr-2`}></span>
                  <span className="text-sm"><strong>Pending</strong>: Your order has been received and is waiting to be processed.</span>
                </div>
                <div className="flex items-center">
                  <span className={`h-3 w-3 rounded-full ${getStatusColor('in progress')} mr-2`}></span>
                  <span className="text-sm"><strong>In Progress</strong>: Your order is currently being processed.</span>
                </div>
                <div className="flex items-center">
                  <span className={`h-3 w-3 rounded-full ${getStatusColor('completed')} mr-2`}></span>
                  <span className="text-sm"><strong>Completed</strong>: Your order has been successfully completed.</span>
                </div>
                <div className="flex items-center">
                  <span className={`h-3 w-3 rounded-full ${getStatusColor('partial')} mr-2`}></span>
                  <span className="text-sm"><strong>Partial</strong>: Your order was partially completed due to limitations.</span>
                </div>
                <div className="flex items-center">
                  <span className={`h-3 w-3 rounded-full ${getStatusColor('canceled')} mr-2`}></span>
                  <span className="text-sm"><strong>Canceled</strong>: Your order has been canceled.</span>
                </div>
              </div>
              <div className="mt-4 p-4 bg-blue-50 rounded-md">
                <p className="text-sm text-blue-800">
                  <FaInfoCircle className="inline mr-2" />
                  We're currently updating our service infrastructure. Advanced order management features will be available soon.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </AppLayout>
  );
} 