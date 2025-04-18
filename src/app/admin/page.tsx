"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { FaSearch, FaCoins, FaUser, FaHistory, FaHeart, FaPlay, FaPlus, FaLink, FaComments, FaUserPlus, FaSearch as FaSearchIcon } from "react-icons/fa";
import { searchUsers, updateUserCoins, getAllBoosts, getUserBoosts, createBoost } from "@/lib/firestore";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { BoostData, BoostType } from "@/lib/api";

type UserType = {
  id: string;
  email: string;
  coins: number;
  isAdmin: boolean;
  createdAt: any;
};

export default function AdminPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<UserType[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [coinAmount, setCoinAmount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [userBoosts, setUserBoosts] = useState<BoostData[]>([]);
  const [allBoosts, setAllBoosts] = useState<BoostData[]>([]);
  const [viewMode, setViewMode] = useState<"users" | "boosts" | "addBoost">("users");
  const [manualBoostData, setManualBoostData] = useState({
    targetUserId: "",
    boostType: "likes" as BoostType,
    targetUrl: "",
    amount: 100,
    cost: 100
  });
  const [searchType, setSearchType] = useState<"email" | "uid">("email");
  const [reduceAmount, setReduceAmount] = useState<number>(0);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchQuery) {
      toast.error("Please enter a search query");
      return;
    }
    
    setIsLoading(true);
    
    try {
      const users = await searchUsers(searchQuery, searchType);
      setSearchResults(users as UserType[]);
      
      if (users.length === 0) {
        toast.error("No users found matching your search");
      }
    } catch (error) {
      console.error("Error searching users:", error);
      
      // More specific error messages based on the error
      if (error instanceof Error) {
        if (error.message === 'Authentication required') {
          toast.error("You need to be logged in to perform this action");
        } else if (error.message === 'Admin privileges required') {
          toast.error("You don't have admin privileges to search users");
        } else if (error.message.includes('Missing or insufficient permissions')) {
          toast.error("Permission denied. Please check your Firebase security rules.");
        } else {
          toast.error(`Failed to search users: ${error.message}`);
        }
      } else {
        toast.error("Failed to search users");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectUser = async (user: UserType) => {
    setSelectedUser(user);
    setCoinAmount(0);
    
    // Fetch user's boosts when selected
    try {
      setIsLoading(true);
      const boosts = await getUserBoosts(user.id);
      setUserBoosts(boosts);
    } catch (error) {
      console.error("Error fetching user boosts:", error);
      toast.error("Failed to load user's boost history");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCoins = async () => {
    if (!selectedUser) return;
    
    setIsLoading(true);
    
    try {
      await updateUserCoins(selectedUser.id, coinAmount);
      toast.success(`Added ${coinAmount} coins to ${selectedUser.email}`);
      
      // Update the selected user and search results
      const updatedUser = { 
        ...selectedUser, 
        coins: selectedUser.coins + coinAmount 
      };
      
      setSelectedUser(updatedUser);
      
      setSearchResults(prev => 
        prev.map(user => 
          user.id === selectedUser.id 
            ? updatedUser 
            : user
        )
      );
      
      setCoinAmount(0);
    } catch (error) {
      console.error("Error adding coins:", error);
      toast.error("Failed to add coins");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReduceCoins = async () => {
    if (!selectedUser) return;
    
    setIsLoading(true);
    
    try {
      await updateUserCoins(selectedUser.id, -reduceAmount);
      toast.success(`Reduced ${reduceAmount} coins from ${selectedUser.email}`);
      
      // Update the selected user and search results
      const updatedUser = { 
        ...selectedUser, 
        coins: selectedUser.coins - reduceAmount 
      };
      
      setSelectedUser(updatedUser);
      
      setSearchResults(prev => 
        prev.map(user => 
          user.id === selectedUser.id 
            ? updatedUser 
            : user
        )
      );
      
      setReduceAmount(0);
    } catch (error) {
      console.error("Error reducing coins:", error);
      toast.error("Failed to reduce coins");
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewAllBoosts = async () => {
    setIsLoading(true);
    try {
      const boosts = await getAllBoosts();
      setAllBoosts(boosts);
      setViewMode("boosts");
    } catch (error) {
      console.error("Error fetching boosts:", error);
      
      // More specific error messages based on the error
      if (error instanceof Error) {
        if (error.message === 'Authentication required') {
          toast.error("You need to be logged in to view boosts");
        } else if (error.message === 'Admin privileges required') {
          toast.error("You don't have admin privileges to view all boosts");
        } else if (error.message.includes('Missing or insufficient permissions')) {
          toast.error("Permission denied. Please check your Firebase security rules.");
        } else {
          toast.error(`Failed to load boosts: ${error.message}`);
        }
      } else {
        toast.error("Failed to load boosts");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddManualBoost = async () => {
    if (!manualBoostData.targetUserId) {
      toast.error("Please select a user");
      return;
    }
    
    if (!manualBoostData.targetUrl) {
      toast.error("Please enter a target URL");
      return;
    }
    
    setIsLoading(true);
    
    try {
      await createBoost(
        manualBoostData.targetUserId,
        manualBoostData.boostType,
        manualBoostData.targetUrl,
        manualBoostData.amount,
        manualBoostData.cost
      );
      
      toast.success("Manual boost created successfully");
      
      // Reset form
      setManualBoostData({
        targetUserId: "",
        boostType: "likes",
        targetUrl: "",
        amount: 100,
        cost: 100
      });
      
      // If a user was selected, refresh their boosts
      if (selectedUser && selectedUser.id === manualBoostData.targetUserId) {
        const boosts = await getUserBoosts(selectedUser.id);
        setUserBoosts(boosts);
      }
    } catch (error) {
      console.error("Error creating manual boost:", error);
      toast.error("Failed to create manual boost");
    } finally {
      setIsLoading(false);
    }
  };

  const getBoostTypeIcon = (type: string) => {
    switch (type) {
      case "likes":
        return <FaHeart className="text-red-500" />;
      case "followers":
        return <FaUser className="text-blue-500" />;
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

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <AppLayout adminOnly>
      <div className="max-w-7xl mx-auto">
        <div className="md:flex md:items-center md:justify-between mb-8">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              Admin Panel
            </h2>
          </div>
          
          <div className="mt-4 flex md:mt-0 md:ml-4 space-x-3">
            <Button 
              variant={viewMode === "users" ? "primary" : "outline"} 
              onClick={() => setViewMode("users")}
            >
              <FaUserPlus className="mr-2" /> Manage Users
            </Button>
            
            <Button 
              variant={viewMode === "boosts" ? "primary" : "outline"} 
              onClick={handleViewAllBoosts}
              isLoading={viewMode !== "boosts" && isLoading}
            >
              <FaHistory className="mr-2" /> All Boosts
            </Button>
            
            <Button 
              variant={viewMode === "addBoost" ? "primary" : "outline"} 
              onClick={() => setViewMode("addBoost")}
            >
              <FaPlus className="mr-2" /> Add Boost
            </Button>
          </div>
        </div>
        
        {/* Users View */}
        {viewMode === "users" && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Search Users</h3>
              <form onSubmit={handleSearch} className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
                <div className="flex-1">
                  <Input
                    type="text"
                    placeholder="Search by email or user ID"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    leftIcon={<FaSearch />}
                  />
                </div>
                
                <div>
                  <select 
                    className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                    value={searchType}
                    onChange={(e) => setSearchType(e.target.value as "email" | "uid")}
                  >
                    <option value="email">Email</option>
                    <option value="uid">User ID</option>
                  </select>
                </div>
                
                <div>
                  <Button 
                    type="submit" 
                    className="w-full md:w-auto"
                    isLoading={isLoading}
                  >
                    Search
                  </Button>
                </div>
              </form>
            </div>
            
            {searchResults.length > 0 && (
              <div className="bg-white rounded-lg shadow-md overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User ID
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Coins
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {searchResults.map((user) => (
                      <tr key={user.id} className={selectedUser?.id === user.id ? "bg-blue-50" : ""}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {user.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span className="truncate max-w-xs inline-block" title={user.id}>
                            {user.id}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center">
                            <FaCoins className="text-yellow-500 mr-1" />
                            {user.coins}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${user.isAdmin ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-800"}`}>
                            {user.isAdmin ? "Admin" : "User"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleSelectUser(user)}
                          >
                            Select
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
            {selectedUser && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-lg shadow-md p-6"
              >
                <h3 className="text-lg font-medium text-gray-900 mb-4">User Details: {selectedUser.email}</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-800 mb-4">User Info</h4>
                    <div className="bg-gray-50 p-6 rounded-md border border-gray-200 shadow-sm">
                      <div className="grid grid-cols-1 gap-y-4">
                        <div className="flex flex-col">
                          <span className="text-sm text-gray-500">User ID:</span>
                          <span className="text-sm font-medium break-all">{selectedUser.id}</span>
                        </div>
                        
                        <div className="flex flex-col">
                          <span className="text-sm text-gray-500">Email:</span>
                          <span className="text-sm font-medium">{selectedUser.email}</span>
                        </div>
                        
                        <div className="flex flex-col">
                          <span className="text-sm text-gray-500">Current Coins:</span>
                          <span className="text-lg font-bold flex items-center text-yellow-600">
                            <FaCoins className="text-yellow-500 mr-2" />
                            {selectedUser.coins}
                          </span>
                        </div>
                        
                        <div className="flex flex-col">
                          <span className="text-sm text-gray-500">Role:</span>
                          <span className={`mt-1 px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${selectedUser.isAdmin ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-800"} w-fit`}>
                            {selectedUser.isAdmin ? "Admin" : "Regular User"}
                          </span>
                        </div>
                        
                        <div className="flex flex-col">
                          <span className="text-sm text-gray-500">Created At:</span>
                          <span className="text-sm font-medium">
                            {new Date(selectedUser.createdAt.seconds * 1000).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-medium text-gray-800 mb-4">Add Coins</h4>
                      <div className="flex items-end space-x-4">
                        <div>
                          <Input
                            type="number"
                            label="Amount"
                            value={coinAmount.toString()}
                            onChange={(e) => setCoinAmount(parseInt(e.target.value) || 0)}
                            leftIcon={<FaCoins />}
                          />
                        </div>
                        <Button
                          onClick={handleAddCoins}
                          isLoading={isLoading && coinAmount > 0}
                          disabled={coinAmount <= 0}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          Add Coins
                        </Button>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-800 mb-4">Reduce Coins</h4>
                      <div className="flex items-end space-x-4">
                        <div>
                          <Input
                            type="number"
                            label="Amount"
                            value={reduceAmount.toString()}
                            onChange={(e) => setReduceAmount(parseInt(e.target.value) || 0)}
                            leftIcon={<FaCoins />}
                          />
                        </div>
                        <Button
                          onClick={handleReduceCoins}
                          isLoading={isLoading && reduceAmount > 0}
                          disabled={reduceAmount <= 0 || reduceAmount > selectedUser.coins}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Reduce Coins
                        </Button>
                      </div>
                      {reduceAmount > selectedUser.coins && (
                        <p className="text-red-500 text-sm mt-1">Cannot reduce more coins than user currently has.</p>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="mt-6">
                  <h4 className="font-medium text-gray-800 mb-4">User Boost History</h4>
                  
                  {userBoosts.length === 0 ? (
                    <div className="bg-gray-50 p-4 rounded-md text-center">
                      <p className="text-gray-500">No boost history found for this user</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Type
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Target
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Amount
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Cost
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Created
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {userBoosts.map((boost) => (
                            <tr key={boost.id}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  {getBoostTypeIcon(boost.type)}
                                  <span className="ml-2 text-sm font-medium text-gray-900 capitalize">
                                    {boost.type}
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-blue-600 truncate max-w-xs">
                                  <a href={boost.target} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                    {boost.target.substring(0, 30)}...
                                  </a>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {boost.amount}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                <div className="flex items-center">
                                  <FaCoins className="text-yellow-500 mr-1" />
                                  {boost.cost}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(boost.status)}`}>
                                  {boost.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {formatDate(boost.createdAt)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        )}
        
        {/* All Boosts View */}
        {viewMode === "boosts" && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-4 bg-blue-50 border-b border-blue-100 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">All Boosts</h3>
              
              <span className="text-sm text-gray-600">
                Total: {allBoosts.length} boosts
              </span>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User ID
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Target
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cost
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {allBoosts.map((boost) => (
                    <tr key={boost.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className="truncate max-w-[100px] inline-block" title={boost.userId}>
                          {boost.userId.substring(0, 8)}...
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getBoostTypeIcon(boost.type)}
                          <span className="ml-2 text-sm font-medium text-gray-900 capitalize">
                            {boost.type}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-blue-600 truncate max-w-xs">
                          <a href={boost.target} target="_blank" rel="noopener noreferrer" className="hover:underline">
                            {boost.target.substring(0, 20)}...
                          </a>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {boost.amount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <FaCoins className="text-yellow-500 mr-1" />
                          {boost.cost}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(boost.status)}`}>
                          {boost.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(boost.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {/* Add Boost Manually View */}
        {viewMode === "addBoost" && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Add Manual Boost</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="space-y-4">
                  <div>
                    <Input
                      label="User ID"
                      placeholder="Enter user ID"
                      value={manualBoostData.targetUserId}
                      onChange={(e) => setManualBoostData({...manualBoostData, targetUserId: e.target.value})}
                      leftIcon={<FaUser />}
                    />
                    <p className="text-xs text-gray-500 mt-1">The user who will receive this boost</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Boost Type
                    </label>
                    <select
                      className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                      value={manualBoostData.boostType}
                      onChange={(e) => setManualBoostData({...manualBoostData, boostType: e.target.value as BoostType})}
                    >
                      <option value="likes">Likes</option>
                      <option value="followers">Followers</option>
                      <option value="reels">Reels Views</option>
                      <option value="comments">Comments</option>
                    </select>
                  </div>
                  
                  <div>
                    <Input
                      label="Target URL"
                      placeholder="https://www.instagram.com/..."
                      value={manualBoostData.targetUrl}
                      onChange={(e) => setManualBoostData({...manualBoostData, targetUrl: e.target.value})}
                      leftIcon={<FaLink />}
                    />
                    <p className="text-xs text-gray-500 mt-1">Instagram post or profile URL</p>
                  </div>
                  
                  <div>
                    <Input
                      label="Amount"
                      type="number"
                      value={manualBoostData.amount.toString()}
                      onChange={(e) => setManualBoostData({...manualBoostData, amount: parseInt(e.target.value) || 0})}
                    />
                  </div>
                  
                  <div>
                    <Input
                      label="Cost (Coins)"
                      type="number"
                      value={manualBoostData.cost.toString()}
                      onChange={(e) => setManualBoostData({...manualBoostData, cost: parseInt(e.target.value) || 0})}
                      leftIcon={<FaCoins />}
                    />
                  </div>
                </div>
                
                <div className="mt-6">
                  <Button
                    className="w-full"
                    onClick={handleAddManualBoost}
                    isLoading={isLoading}
                    disabled={!manualBoostData.targetUserId || !manualBoostData.targetUrl || manualBoostData.amount <= 0 || manualBoostData.cost <= 0}
                  >
                    Create Manual Boost
                  </Button>
                </div>
              </div>
              
              <div className="bg-gray-50 p-6 rounded-lg">
                <h4 className="font-medium text-gray-800 mb-4">Instructions</h4>
                <div className="prose prose-sm">
                  <p>
                    This form allows you to manually create a boost record for any user. 
                    This is useful for testing or for managing special cases.
                  </p>
                  
                  <ul>
                    <li><strong>User ID:</strong> The Firebase UID of the user</li>
                    <li><strong>Boost Type:</strong> The type of boost to create</li>
                    <li><strong>Target URL:</strong> The Instagram post or profile URL</li>
                    <li><strong>Amount:</strong> The number of likes/followers/etc.</li>
                    <li><strong>Cost:</strong> The coin cost (for record keeping)</li>
                  </ul>
                  
                  <div className="bg-blue-50 p-4 rounded-md mt-4">
                    <p className="text-sm text-blue-800">
                      <strong>Note:</strong> Manual boosts are created with a "pending" status by default.
                      You'll need to update the status in Firestore directly to mark them as completed.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
} 