"use client";
import React, { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const PAGE_SIZE = 10;
const ALL_STATUS_OPTIONS = ["all", "active", "locked", "disabled", "admin", "pending"];
const STATUS_OPTIONS = ["active", "locked", "disabled"];

interface User {
  user_id: string;
  email: string;
  username: string;
  status: "active" | "locked" | "disabled" | "admin" | "pending";
  created_at: string;
  updated_at: string;
  avatar?: string;
}

const ManageUserPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [usernameFilter, setUsernameFilter] = useState("");
  const [emailFilter, setEmailFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [createdStartDate, setCreatedStartDate] = useState("");
  const [createdEndDate, setCreatedEndDate] = useState("");
  const [updatedStartDate, setUpdatedStartDate] = useState("");
  const [updatedEndDate, setUpdatedEndDate] = useState("");
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingChange, setPendingChange] = useState<{
    userId: string;
    oldStatus: string;
    newStatus: string;
    username: string;
    email: string;
  } | null>(null);
  const [goToPage, setGoToPage] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/admin/users`, {
          method: 'GET',
        });

        if (!response.ok) {
          throw new Error("Failed to fetch users");
        }

        const data = await response.json();
        setUsers(data.data);
        setFilteredUsers(data.data);
        setTotalPages(Math.ceil(data.data.length / PAGE_SIZE));
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    let result = users;
    
    if (usernameFilter) {
      const term = usernameFilter.toLowerCase();
      result = result.filter(user => user.username.toLowerCase().includes(term));
    }
    
    if (emailFilter) {
      const term = emailFilter.toLowerCase();
      result = result.filter(user => user.email.toLowerCase().includes(term));
    }
    
    if (statusFilter !== "all") {
      result = result.filter(user => user.status === statusFilter);
    }
    
    if (createdStartDate || createdEndDate) {
      result = result.filter(user => {
        const createdAt = new Date(user.created_at);
        const startDate = createdStartDate ? new Date(createdStartDate) : null;
        const endDate = createdEndDate ? new Date(createdEndDate) : null;
        
        const afterStart = !startDate || createdAt >= startDate;
        const beforeEnd = !endDate || createdAt <= new Date(endDate.setHours(23, 59, 59, 999));
        
        return afterStart && beforeEnd;
      });
    }
    
    if (updatedStartDate || updatedEndDate) {
      result = result.filter(user => {
        const updatedAt = new Date(user.updated_at);
        const startDate = updatedStartDate ? new Date(updatedStartDate) : null;
        const endDate = updatedEndDate ? new Date(updatedEndDate) : null;
        
        const afterStart = !startDate || updatedAt >= startDate;
        const beforeEnd = !endDate || updatedAt <= new Date(endDate.setHours(23, 59, 59, 999));
        
        return afterStart && beforeEnd;
      });
    }
    
    setFilteredUsers(result);
    setTotalPages(Math.ceil(result.length / PAGE_SIZE));
    setCurrentPage(1);
  }, [users, usernameFilter, emailFilter, statusFilter, createdStartDate, createdEndDate, updatedStartDate, updatedEndDate]);

  const parseDate = (dateString: string) => {
    return new Date(dateString);
  };

  const handleStatusSelect = (userId: string, newStatus: User["status"], user: User) => {
    if (user.status === newStatus) return;
    
    setPendingChange({
      userId,
      oldStatus: user.status,
      newStatus,
      username: user.username,
      email: user.email
    });
    setShowConfirmDialog(true);
  };

  const confirmStatusChange = async () => {
    if (!pendingChange) return;
    
    try {
      const response = await fetch(`/api/admin/users/edit-user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: pendingChange.userId,
          status: pendingChange.newStatus
        })
      });
  
      if (!response.ok) {
        throw new Error("Failed to update user status");
      }
  
      const result = await response.json();
      
      const refreshResponse = await fetch(`/api/admin/users`, {
        method: 'GET',
      });

      if (refreshResponse.ok) {
        const refreshData = await refreshResponse.json();
        setUsers(refreshData.data);
        setFilteredUsers(refreshData.data);
        setTotalPages(Math.ceil(refreshData.data.length / PAGE_SIZE));
      }
    } catch (error) {
      console.error("Error updating user status:", error);
    } finally {
      setShowConfirmDialog(false);
      setPendingChange(null);
    }
  };

  const cancelStatusChange = () => {
    setShowConfirmDialog(false);
    setPendingChange(null);
  };

  const getStatusClass = (status: User["status"]) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800";
      case "locked": return "bg-yellow-100 text-yellow-800";
      case "disabled": return "bg-red-100 text-red-800";
      case "admin": return "bg-purple-100 text-purple-800";
      case "pending": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getCurrentPageUsers = () => {
    const start = (currentPage - 1) * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    return filteredUsers.slice(start, end);
  };

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const handleGoToPage = () => {
    const pageNumber = parseInt(goToPage);
    if (!isNaN(pageNumber)) {
      const validPage = Math.max(1, Math.min(pageNumber, totalPages));
      setCurrentPage(validPage);
      setGoToPage("");
    }
  };

  const clearFilters = () => {
    setUsernameFilter("");
    setEmailFilter("");
    setStatusFilter("all");
    setCreatedStartDate("");
    setCreatedEndDate("");
    setUpdatedStartDate("");
    setUpdatedEndDate("");
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}/${mm}/${dd}`;
  };

  if (loading) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-white z-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <p className="mt-4 text-xl font-semibold bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent animate-pulse">
          Loading...
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-h-[95vh] flex-col py-8 px-6 bg-gray-50">
      <div className="flex flex-1 justify-center">
        <div className="flex-1 p-6 md:p-8 min-w-[80vw] bg-white rounded-xl shadow-sm">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
            <p className="text-gray-500 mt-2">Manage all registered users and their status</p>
          </div>

          {/* Filter Section - Exact Requested Layout */}
          <div className="mb-8 p-4 border rounded-lg bg-gray-50">
            <div className="grid grid-cols-4 gap-4">
              {/* Column 1: Username and Email */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Search by Username</label>
                  <Input
                    type="text"
                    placeholder="Username search box"
                    value={usernameFilter}
                    onChange={(e) => setUsernameFilter(e.target.value)}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Search by Email</label>
                  <Input
                    type="text"
                    placeholder="Email search box"
                    value={emailFilter}
                    onChange={(e) => setEmailFilter(e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Column 2: Creation Time */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Search by Creation Time</label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="date"
                      value={createdStartDate}
                      onChange={(e) => setCreatedStartDate(e.target.value)}
                      className="w-full"
                      placeholder="Start date"
                    />
                    <Input
                      type="date"
                      value={createdEndDate}
                      onChange={(e) => setCreatedEndDate(e.target.value)}
                      className="w-full"
                      placeholder="End date"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Search by Last Update</label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="date"
                      value={updatedStartDate}
                      onChange={(e) => setUpdatedStartDate(e.target.value)}
                      className="w-full"
                      placeholder="Start date"
                    />
                    <Input
                      type="date"
                      value={updatedEndDate}
                      onChange={(e) => setUpdatedEndDate(e.target.value)}
                      className="w-full"
                      placeholder="End date"
                    />
                  </div>
                </div>
              </div>

              {/* Column 3: Status */}
              <div className="flex flex-col">
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Status dropdown" />
                  </SelectTrigger>
                  <SelectContent>
                    {ALL_STATUS_OPTIONS.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status === "all" ? "All Statuses" : status.charAt(0).toUpperCase() + status.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Column 4: Apply Button */}
              <div className="flex items-end">
                <Button 
                  onClick={() => {}} // Filtering happens automatically via useEffect
                  className="w-full h-[42px]"
                >
                  Apply Filters
                </Button>
              </div>
            </div>
          </div>

          {/* User card list */}
          <div className="space-y-3">
            {/* Table Header */}
            <div className="border rounded-lg p-4 bg-gray-50 flex items-center">
              <div className="w-[20%] min-w-[150px] pr-4">
                <p className="font-medium text-gray-900">Username</p>
              </div>
              <div className="w-[25%] min-w-[200px] pr-4">
                <p className="font-medium text-gray-900">Email</p>
              </div>
              <div className="w-[20%] min-w-[150px] pr-4">
                <p className="font-medium text-gray-900">Created At</p>
              </div>
              <div className="w-[20%] min-w-[150px] pr-4">
                <p className="font-medium text-gray-900">Updated At</p>
              </div>
              <div className="w-[15%] min-w-[120px]">
                <p className="font-medium text-gray-900">Status</p>
              </div>
            </div>

            {getCurrentPageUsers().length === 0 ? (
              <div className="text-center py-16 border rounded-lg">
                <svg
                  className="mx-auto h-16 w-16 text-gray-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
                <h3 className="mt-4 text-lg font-medium text-gray-700">No users found</h3>
                <p className="mt-2 text-sm text-gray-500">There are currently no users matching your criteria.</p>
              </div>
            ) : (
              getCurrentPageUsers().map((user) => (
                <div
                  key={user.user_id}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors flex items-center"
                >
                  {/* Username */}
                  <div className="w-[20%] min-w-[150px] pr-4">
                    <p className="font-medium text-gray-900 truncate">{user.username}</p>
                  </div>
                  
                  {/* Email */}
                  <div className="w-[25%] min-w-[200px] pr-4">
                    <p className="text-sm text-gray-600 truncate">{user.email}</p>
                  </div>
                  
                  {/* Created At */}
                  <div className="w-[20%] min-w-[150px] pr-4">
                    <p className="text-sm text-gray-600">{formatDateTime(user.created_at)}</p>
                  </div>
                  
                  {/* Updated At */}
                  <div className="w-[20%] min-w-[150px] pr-4">
                    <p className="text-sm text-gray-600">{formatDateTime(user.updated_at)}</p>
                  </div>
                  
                  {/* Status Selector */}
                  <div className="w-[15%] min-w-[120px]">
                    {user.status === "admin" || user.status === "pending" ? (
                      <div className={`px-3 py-1.5 rounded-md text-xs font-medium leading-none ${getStatusClass(user.status)} text-left inline-block min-w-[80px]`}>
                        {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                      </div>
                    ) : (
                      <Select
                        value={user.status}
                        onValueChange={(value: User["status"]) => 
                          handleStatusSelect(user.user_id, value, user)
                        }
                      >
                        <SelectTrigger className="p-0 bg-transparent border-0 hover:bg-transparent focus:ring-0 w-full text-left">
                          <div className={`px-3 py-1.5 rounded-md text-xs font-medium leading-none ${getStatusClass(user.status)} cursor-pointer inline-block min-w-[80px]`}>
                            {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                          </div>
                        </SelectTrigger>
                        <SelectContent className="p-1 min-w-[120px] w-full" align="start">
                          <div className="space-y-1 w-full">
                            {STATUS_OPTIONS.map((status) => (
                              <SelectItem 
                                key={status} 
                                value={status}
                                className="p-0 focus:bg-transparent w-full"
                              >
                                <div className={`px-3 py-1.5 rounded-md text-xs font-medium leading-none ${getStatusClass(status as User["status"])} cursor-pointer w-full text-left inline-block min-w-[80px]`}>
                                  {status.charAt(0).toUpperCase() + status.slice(1)}
                                </div>
                              </SelectItem>
                            ))}
                          </div>
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pagination with Go To Page */}
          {filteredUsers.length > 0 && (
            <div className="flex justify-center mt-8">
              <div className="flex items-center gap-2 bg-white rounded-lg px-6 py-3 border border-gray-200">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 transition-colors"
                >
                  Previous
                </button>
                <span className="mx-4 text-sm text-gray-700">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 transition-colors"
                >
                  Next
                </button>
                <div className="flex items-center gap-2 ml-4">
                  <span className="text-sm text-gray-700">Go to:</span>
                  <Input
                    type="number"
                    min="1"
                    max={totalPages}
                    value={goToPage}
                    onChange={(e) => setGoToPage(e.target.value)}
                    className="w-20 h-9 text-center"
                    onKeyDown={(e) => e.key === "Enter" && handleGoToPage()}
                  />
                  <Button 
                    onClick={handleGoToPage}
                    className="h-9 px-4"
                    disabled={!goToPage || parseInt(goToPage) < 1 || parseInt(goToPage) > totalPages}
                  >
                    Go
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="sm:max-w-md rounded-lg">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-gray-900">Confirm Status Change</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {pendingChange && (
              <p className="text-gray-700">
                Are you sure you want to change <span className="font-medium">{pendingChange.username}</span> ({pendingChange.email})'s status from{" "}
                <span className={`${getStatusClass(pendingChange.oldStatus as User["status"])} px-3 py-1.5 rounded-md text-xs font-medium leading-none inline-block min-w-[80px] text-left`}>
                  {pendingChange.oldStatus}
                </span>{" "}
                to{" "}
                <span className={`${getStatusClass(pendingChange.newStatus as User["status"])} px-3 py-1.5 rounded-md text-xs font-medium leading-none inline-block min-w-[80px] text-left`}>
                  {pendingChange.newStatus}
                </span>?
              </p>
            )}
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={cancelStatusChange} className="border-gray-300 hover:bg-gray-50 h-9 px-4">
              Cancel
            </Button>
            <Button onClick={confirmStatusChange} className="bg-blue-600 hover:bg-blue-700 h-9 px-4">
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ManageUserPage;
