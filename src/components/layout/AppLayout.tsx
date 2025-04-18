import { useAuth } from "@/context/AuthContext";
import { redirect } from "next/navigation";
import Navbar from "./Navbar";
import { motion } from "framer-motion";

export default function AppLayout({
  children,
  requireAuth = true,
  adminOnly = false,
}: {
  children: React.ReactNode;
  requireAuth?: boolean;
  adminOnly?: boolean;
}) {
  const { user, userData, loading } = useAuth();

  // Handle authentication requirements
  if (!loading) {
    if (requireAuth && !user) {
      redirect("/login");
    }

    if (adminOnly && (!user || !userData?.isAdmin)) {
      redirect("/dashboard");
    }
  }

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-12 w-12 border-4 border-blue-500 rounded-full border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="py-6"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </motion.main>
    </div>
  );
} 