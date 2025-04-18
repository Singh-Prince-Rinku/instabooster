"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { motion } from "framer-motion";
import { FaHeart, FaUsers, FaPlay, FaRocket } from "react-icons/fa";
import { useAuth } from "@/context/AuthContext";

export default function LandingPage() {
  const { user } = useAuth();

  const features = [
    {
      title: "Boost Instagram Likes",
      description: "Increase engagement on your posts with real Instagram likes",
      icon: <FaHeart className="h-6 w-6 text-red-500" />,
      color: "bg-red-50",
      href: "/boost/likes",
    },
    {
      title: "Gain More Followers",
      description: "Grow your audience with genuine Instagram followers",
      icon: <FaUsers className="h-6 w-6 text-blue-500" />,
      color: "bg-blue-50",
      href: "/boost/followers",
    },
    {
      title: "Increase Reel Views",
      description: "Get more views on your reels to reach a wider audience",
      icon: <FaPlay className="h-6 w-6 text-purple-500" />,
      color: "bg-purple-50",
      href: "/boost/reels",
    },
  ];

  return (
    <div className="bg-white">
      {/* Hero section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gray-100" />
        <div className="max-w-7xl mx-auto">
          <div className="relative shadow-xl sm:overflow-hidden sm:rounded-2xl">
            <div className="absolute inset-0">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-700 mix-blend-multiply" />
            </div>
            <div className="relative px-4 py-16 sm:px-6 sm:py-24 lg:py-32 lg:px-8">
              <motion.h1
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl"
              >
                <span className="block text-white">Boost Your Instagram</span>
                <span className="block text-blue-200">Presence Today</span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="mt-6 max-w-lg mx-auto text-center text-xl text-blue-100 sm:max-w-3xl"
              >
                Increase your Instagram likes, followers, and reel views with our
                secure platform. Get real engagement to grow your social presence.
              </motion.p>
              <div className="mt-10 max-w-sm mx-auto sm:max-w-none sm:flex sm:justify-center">
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="space-y-4 sm:space-y-0 sm:mx-auto sm:inline-grid sm:grid-cols-2 sm:gap-5"
                >
                  {user ? (
                    <Link href="/dashboard">
                      <Button variant="primary" size="lg">
                        Go to Dashboard
                      </Button>
                    </Link>
                  ) : (
                    <Link href="/login">
                      <Button variant="primary" size="lg">
                        Get Started
                      </Button>
                    </Link>
                  )}
                  <Link href="#features">
                    <Button variant="outline" size="lg" className="bg-white">
                      Learn More
                    </Button>
                  </Link>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features section */}
      <div className="py-16 bg-gray-50 overflow-hidden lg:py-24" id="features">
        <div className="relative max-w-xl mx-auto px-4 sm:px-6 lg:px-8 lg:max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="relative"
          >
            <h2 className="text-center text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Boost Your Instagram Engagement
            </h2>
            <p className="mt-4 max-w-3xl mx-auto text-center text-xl text-gray-500">
              Increase your social presence with our powerful Instagram
              engagement tools
            </p>
          </motion.div>

          <div className="relative mt-12 lg:mt-20 lg:grid lg:grid-cols-3 lg:gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="mt-10 lg:mt-0"
              >
                <Link href={feature.href}>
                  <div className={`${feature.color} p-6 rounded-lg cursor-pointer shadow hover:shadow-md transition-shadow`}>
                    <div className="flex items-center justify-center h-12 w-12 rounded-md bg-white">
                      {feature.icon}
                    </div>
                    <div className="mt-5">
                      <h3 className="text-lg font-medium text-gray-900">{feature.title}</h3>
                      <p className="mt-2 text-base text-gray-500">{feature.description}</p>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA section */}
      <div className="bg-blue-600">
        <div className="max-w-2xl mx-auto text-center py-16 px-4 sm:py-20 sm:px-6 lg:px-8">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-3xl font-extrabold text-white sm:text-4xl"
          >
            <span className="block">Ready to boost your Instagram?</span>
            <span className="block">Start using InstaBooster today.</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
            className="mt-4 text-lg leading-6 text-blue-100"
          >
            Join thousands of users who are already growing their Instagram presence
            with our platform.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
            className="mt-8"
          >
            {user ? (
              <Link href="/dashboard">
                <Button
                  variant="secondary"
                  size="lg"
                  className="w-full sm:w-auto"
                >
                  Go to Dashboard
                </Button>
              </Link>
            ) : (
              <Link href="/login">
                <Button
                  variant="secondary"
                  size="lg"
                  className="w-full sm:w-auto"
                >
                  Sign Up Now
                </Button>
              </Link>
            )}
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white">
        <div className="max-w-7xl mx-auto py-12 px-4 overflow-hidden sm:px-6 lg:px-8">
          <p className="mt-8 text-center text-base text-gray-400">
            &copy; {new Date().getFullYear()} InstaBooster. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
