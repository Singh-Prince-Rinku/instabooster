"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/Button";
import { motion } from "framer-motion";
import { FaPlay, FaCoins } from "react-icons/fa";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function BoostReelsPage() {
  const { userData, user } = useAuth();
  const [reelUrl, setReelUrl] = useState("");
  const [amount, setAmount] = useState<number>(1000);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  // Cost per view
  const COST_PER_VIEW = 0.5;
  const totalCost = Math.ceil(amount * COST_PER_VIEW);

  const handleBoost = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error("You must be logged in to boost reels views");
      return;
    }

    if (!reelUrl || !reelUrl.includes('instagram.com')) {
      toast.error("Please enter a valid Instagram reel URL");
      return;
    }

    if (amount < 50 || amount > 10000) {
      toast.error("Amount must be between 50 and 10,000");
      return;
    }

    if ((userData?.coins || 0) < totalCost) {
      toast.error("Insufficient coins. Please purchase more coins.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/boost/reels', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reelUrl, amount, userId: user.uid }),
      });

      const data = await response.json();

      if (!data.success) {
        toast.error(data.message);
        return;
      }

      toast.success("Reels views boost initiated successfully!");
      router.push("/dashboard");
    } catch (error) {
      console.error("Error boosting reels views:", error);
      toast.error("Failed to boost reels views. Please try again later.");
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
              <FaPlay className="text-purple-500 mr-3" /> Boost Instagram Reels
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
                <label htmlFor="reelUrl" className="block text-sm font-medium text-gray-700">
                  Instagram Reel URL
                </label>
                <div className="mt-1">
                  <input
                    id="reelUrl"
                    name="reelUrl"
                    type="url"
                    required
                    placeholder="https://www.instagram.com/reel/..."
                    value={reelUrl}
                    onChange={(e) => setReelUrl(e.target.value)}
                    className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm text-gray-900 bg-white"
                  />
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  Enter the URL of the Instagram reel you want to boost
                </p>
              </div>

              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                  Number of Views
                </label>
                <div className="mt-1">
                  <input
                    id="amount"
                    name="amount"
                    type="number"
                    min="50"
                    max="10000"
                    step="50"
                    required
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm text-gray-900 bg-white"
                  />
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  Choose between 50 and 10,000 views
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-md">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500">Cost per view:</span>
                  <span className="text-sm font-medium text-gray-900 flex items-center">
                    <FaCoins className="text-yellow-500 mr-1" /> {COST_PER_VIEW}
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
                  Boost Reels Views
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