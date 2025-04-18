"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/Button";
import { motion } from "framer-motion";
import { FaComments, FaCoins } from "react-icons/fa";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function BoostCommentsPage() {
  const { userData, user } = useAuth();
  const [postUrl, setPostUrl] = useState("");
  const [amount, setAmount] = useState<number>(100);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  // Cost per comment
  const COST_PER_COMMENT = 2;
  const totalCost = amount * COST_PER_COMMENT;

  const handleBoost = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error("You must be logged in to boost comments");
      return;
    }

    if (!postUrl || !postUrl.includes('instagram.com')) {
      toast.error("Please enter a valid Instagram post URL");
      return;
    }

    if (amount < 10 || amount > 1000) {
      toast.error("Amount must be between 10 and 1000");
      return;
    }

    if ((userData?.coins || 0) < totalCost) {
      toast.error("Insufficient coins. Please purchase more coins.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Send the userId in the request for server-side processing
      const response = await fetch('/api/boost/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ postUrl, amount, userId: user.uid }),
      });

      const data = await response.json();

      if (!data.success) {
        toast.error(data.message);
        return;
      }

      toast.success("Comments boost initiated successfully!");
      router.push("/dashboard");
    } catch (error) {
      console.error("Error boosting comments:", error);
      toast.error("Failed to boost comments. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto">
        <div className="md:flex md:items-center md:justify-between mb-8">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate flex items-center">
              <FaComments className="text-green-500 mr-3" /> Boost Instagram Comments
            </h2>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-lg shadow-md overflow-hidden"
        >
          <div className="p-6">
            <form onSubmit={handleBoost} className="space-y-6">
              <div>
                <label htmlFor="postUrl" className="block text-sm font-medium text-gray-700">
                  Instagram Post URL
                </label>
                <div className="mt-1">
                  <input
                    id="postUrl"
                    name="postUrl"
                    type="text"
                    required
                    placeholder="https://www.instagram.com/p/..."
                    value={postUrl}
                    onChange={(e) => setPostUrl(e.target.value)}
                    className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm text-gray-900 bg-white"
                  />
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  Enter the full URL of the Instagram post you want to add comments to
                </p>
              </div>

              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                  Number of Comments
                </label>
                <div className="mt-1">
                  <input
                    id="amount"
                    name="amount"
                    type="number"
                    min="10"
                    max="1000"
                    required
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm text-gray-900 bg-white"
                  />
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  Choose between 10 and 1,000 comments
                </p>
              </div>

              <div className="bg-green-50 p-4 rounded-md">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500">Cost per comment:</span>
                  <span className="text-sm font-medium text-gray-900 flex items-center">
                    <FaCoins className="text-yellow-500 mr-1" /> {COST_PER_COMMENT}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm font-medium text-gray-500">Total cost:</span>
                  <span className="text-lg font-bold text-gray-900 flex items-center">
                    <FaCoins className="text-yellow-500 mr-1" /> {totalCost}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm font-medium text-gray-500">Your balance:</span>
                  <span className="text-sm font-medium text-gray-900 flex items-center">
                    <FaCoins className="text-yellow-500 mr-1" /> {userData?.coins || 0}
                  </span>
                </div>
              </div>

              <div>
                <Button
                  type="submit"
                  className="w-full"
                  isLoading={isSubmitting}
                  disabled={isSubmitting || (userData?.coins || 0) < totalCost}
                >
                  Boost Comments
                </Button>
                {(userData?.coins || 0) < totalCost && (
                  <p className="mt-2 text-sm text-red-600">
                    Insufficient coins. Please purchase more coins.
                  </p>
                )}
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </AppLayout>
  );
} 