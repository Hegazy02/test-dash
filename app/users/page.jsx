"use client";
import React, { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Download,
  Plus,
  Edit2,
  Trash2,
  Eye,
  ChevronDown,
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Shield,
  MoreVertical,
  Loader2,
  X,
  Settings,
  UserCheck,
  Crown,
} from "lucide-react";
import useAuthStore from "@/lib/store/authStore";

const UsersPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [sortField, setSortField] = useState("firstName");
  const [sortDirection, setSortDirection] = useState("asc");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState({});
  const [roleFilter, setRoleFilter] = useState("");
  const [showRoleFilter, setShowRoleFilter] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUserForEdit, setSelectedUserForEdit] = useState(null);
  const [updatingRole, setUpdatingRole] = useState(false);
  const [showNewUserModal, setShowNewUserModal] = useState(false);
  const [creatingUser, setCreatingUser] = useState(false);
  const [showBulkRoleModal, setShowBulkRoleModal] = useState(false);
  const { role, userData } = useAuthStore();

  // Available roles with descriptions
  const availableRoles = [
    {
      value: "User",
      label: "User",
      description: "Basic user access",
      color: "blue",
      icon: User,
    },
    {
      value: "Admin",
      label: "Admin",
      description: "Full system access",
      color: "red",
      icon: Crown,
    },
    {
      value: "Editor",
      label: "Editor",
      description: "Content management access",
      color: "green",
      icon: Edit2,
    },
    {
      value: "Developer",
      label: "Developer",
      description: "Technical development access",
      color: "orange",
      icon: Settings,
    },
    {
      value: "Designer",
      label: "Designer",
      description: "Design and creative access",
      color: "pink",
      icon: Eye,
    },
    {
      value: "Marketer",
      label: "Marketer",
      description: "Marketing and promotion access",
      color: "cyan",
      icon: UserCheck,
    },
    {
      value: "Accountant",
      label: "Accountant",
      description: "Financial management access",
      color: "yellow",
      icon: Shield,
    },
    {
      value: "Content Writer",
      label: "Content Writer",
      description: "Content creation access",
      color: "indigo",
      icon: Edit2,
    },
  ];

  // Get current user from localStorage or token
  useEffect(() => {
    if (userData) {
      setCurrentUser(userData);
      console.log("userData", userData);
      console.log("currentUser", userData);
    }
  }, [userData]);

  // Fetch users from API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/user/getUsers");

        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }

        const data = await response.json();
        setUsers(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching users:", err);
        setError(err.message || "Error occurred while fetching data");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Format user data for display
  const formatUserData = (user) => {
    return {
      id: user._id || user.id,
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
      phone: user.PhoneNumber || "Not specified",
      role: user.role || (user.IsAdmin ? "Admin" : "User"),
      status: "Active",
      joinDate: new Date(user.createdAt).toLocaleString("en-GB", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }),
      location: "Not specified",
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(user.firstName + " " + user.lastName)}&background=0D8ABC&color=fff&size=150`,
      username: user.username,
      originalUser: user,
    };
  };
  const canDeleteUser = (user) => {
    // فقط الـ Admin يمكنه حذف المستخدمين
    // ولا يمكن للـ Admin حذف نفسه
    return role === "Admin" && user.email !== currentUser?.email;
  };
  // Create new user
  const handleCreateUser = async (userData) => {
    try {
      setCreatingUser(true);
      const response = await fetch("/api/user/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (response.ok) {
        const usersResponse = await fetch("/api/user/getUsers");
        if (usersResponse.ok) {
          const updatedUsers = await usersResponse.json();
          setUsers(updatedUsers);
        }
        setShowNewUserModal(false);
        alert("User created successfully");
        return true;
      } else {
        alert(data.error || "Error occurred while creating user");
        return false;
      }
    } catch (error) {
      console.error("Error creating user:", error);
      alert("Error occurred while creating user");
      return false;
    } finally {
      setCreatingUser(false);
    }
  };

  // Update user role (enhanced with better feedback)
  const handleUpdateUserRole = async (
    userEmail,
    newRole,
    userName = "User",
  ) => {
    try {
      setUpdatingRole(true);
      const response = await fetch("/api/user/setData", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: userEmail,
          updateFields: {
            role: newRole,
            IsAdmin: newRole === "Admin",
          },
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Update local state
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user.email === userEmail
              ? { ...user, role: newRole, IsAdmin: newRole === "Admin" }
              : user,
          ),
        );

        setShowUserModal(false);

        const successMessage = `${userName}'s role has been updated to ${newRole}`;
        showNotification(successMessage, "success");
      } else {
        showNotification(
          data.error || "Error occurred while updating user role",
          "error",
        );
      }
    } catch (error) {
      console.error("Error updating user role:", error);
      showNotification("Error occurred while updating user role", "error");
    } finally {
      setUpdatingRole(false);
    }
  };

  // Simple notification system
  const showNotification = (message, type = "info") => {
    // For now, using alert - you can replace with a proper toast notification
    alert(message);
  };

  // Quick role change from table row
  const handleQuickRoleChange = async (user, newRole) => {
    if (confirm(`Change ${user.name}'s role to ${newRole}?`)) {
      await handleUpdateUserRole(user.email, newRole, user.name);
    }
  };

  // Delete user
  const handleDeleteUser = async (userId) => {
    // العثور على المستخدم
    const userToDelete = users.find((user) => (user._id || user.id) === userId);

    // التحقق من الصلاحية
    if (!canDeleteUser(formatUserData(userToDelete))) {
      showNotification(
        "You do not have permission to delete this user",
        "error",
      );
      return;
    }

    if (!confirm("Are you sure you want to delete this user?")) {
      return;
    }

    try {
      setDeleteLoading((prev) => ({ ...prev, [userId]: true }));

      const response = await fetch("/api/user/deleteUser", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: userId }),
      });

      const data = await response.json();

      if (response.ok) {
        setUsers((prevUsers) =>
          prevUsers.filter((user) => (user._id || user.id) !== userId),
        );
        showNotification("User deleted successfully", "success");
      } else {
        showNotification(
          data.error || "Error occurred while deleting user",
          "error",
        );
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      showNotification("Error occurred while deleting user", "error");
    } finally {
      setDeleteLoading((prev) => ({ ...prev, [userId]: false }));
    }
  };

  // Check if current user can edit roles
  const canEditRoles = () => {
    console.log("role", role);
    return role === "Admin";
  };

  // Check if user can be edited by current user
  const canEditUser = (user) => {
    if (!canEditRoles()) return false;
    return user.email !== currentUser.email; // Can't edit own role
  };

  // Open user details modal
  const handleUserClick = (user) => {
    if (canEditUser(user)) {
      setSelectedUserForEdit(user);
      setShowUserModal(true);
    }
  };

  const getRoleColor = (role) => {
    const roleConfig = availableRoles.find((r) => r.value === role);
    if (!roleConfig)
      return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600";

    const colors = {
      red: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700",
      blue: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700",
      green:
        "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700",
      orange:
        "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-700",
      pink: "bg-pink-100 text-pink-800 border-pink-200 dark:bg-pink-900/30 dark:text-pink-300 dark:border-pink-700",
      cyan: "bg-cyan-100 text-cyan-800 border-cyan-200 dark:bg-cyan-900/30 dark:text-cyan-300 dark:border-cyan-700",
      yellow:
        "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-700",
      indigo:
        "bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-700",
    };

    return colors[roleConfig.color] || colors.blue;
  };

  const getStatusColor = (status) => {
    const colors = {
      Active:
        "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700",
      Inactive:
        "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700",
      Pending:
        "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-700",
    };
    return (
      colors[status] ||
      "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600"
    );
  };

  // Format and sort users - Admins first
  const formattedUsers = users.map(formatUserData).sort((a, b) => {
    if (a.role === "Admin" && b.role !== "Admin") return -1;
    if (b.role === "Admin" && a.role !== "Admin") return 1;
    return 0;
  });

  // Get unique roles
  const uniqueRoles = [...new Set(formattedUsers.map((user) => user.role))];

  // Filter users
  const filteredUsers = formattedUsers.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = !roleFilter || user.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  // Calculate pagination
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentUsers = filteredUsers.slice(startIndex, endIndex);

  // Reset current page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, roleFilter]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Enhanced User Modal Component with better role editing
  const UserModal = ({ user, onClose, onUpdateRole }) => {
    const [newRole, setNewRole] = useState(user?.role || "User");
    const [showRoleDescription, setShowRoleDescription] = useState(false);

    if (!user) return null;

    const selectedRoleConfig = availableRoles.find((r) => r.value === newRole);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Edit User Role
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <div className="space-y-6">
              {/* User Info */}
              <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {user.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    @{user.username}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {user.email}
                  </p>
                </div>
              </div>

              {/* Current Role */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Current Role
                </label>
                <div
                  className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border ${getRoleColor(user.role)}`}
                >
                  <Shield className="h-4 w-4" />
                  {user.role}
                </div>
              </div>

              {/* New Role Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  New Role
                </label>
                <div className="space-y-2">
                  {availableRoles.map((role) => {
                    const IconComponent = role.icon;
                    return (
                      <label
                        key={role.value}
                        className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-700 ${
                          newRole === role.value
                            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                            : "border-gray-200 dark:border-gray-600"
                        }`}
                      >
                        <input
                          type="radio"
                          name="role"
                          value={role.value}
                          checked={newRole === role.value}
                          onChange={(e) => setNewRole(e.target.value)}
                          className="text-blue-600 focus:ring-blue-500"
                        />
                        <div
                          className={`p-2 rounded-lg ${getRoleColor(role.value).split(" ").slice(0, 3).join(" ")}`}
                        >
                          <IconComponent className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900 dark:text-white">
                            {role.label}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {role.description}
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Warning for Admin Role */}
              {newRole === "Admin" && user.role !== "Admin" && (
                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Crown className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-yellow-800 dark:text-yellow-300">
                        Admin Access Warning
                      </h4>
                      <p className="text-sm text-yellow-700 dark:text-yellow-400 mt-1">
                        This user will have full administrative access to the
                        system, including the ability to manage other users and
                        system settings.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              {newRole !== user.role && (
                <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => onUpdateRole(user.email, newRole, user.name)}
                    disabled={updatingRole}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {updatingRole ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <UserCheck className="h-4 w-4" />
                        Update Role to {newRole}
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setNewRole(user.role);
                      onClose();
                    }}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // New User Modal Component (kept the same as original)
  // New User Modal Component
  const NewUserModal = ({ onClose, onCreateUser }) => {
    const [formData, setFormData] = useState({
      email: "",
      password: "",
      Username: "",
      firstName: "",
      lastName: "",
      PhoneNumber: "",
      role: "User",
    });

    const [errors, setErrors] = useState({});
    const [isValidating, setIsValidating] = useState(false);
    const { role: currentUserRole } = useAuthStore();

    const validateEmail = (email) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    };

    const validatePassword = (password) => {
      const errors = [];

      if (password.length < 8) {
        errors.push("at least 8 characters");
      }
      if (!/[A-Z]/.test(password)) {
        errors.push("uppercase letter");
      }
      if (!/[a-z]/.test(password)) {
        errors.push("lowercase letter");
      }
      if (!/\d/.test(password)) {
        errors.push("number");
      }
      if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        errors.push("special character");
      }

      return errors;
    };

    const validateUsername = (username) => {
      const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
      return usernameRegex.test(username);
    };

    const validatePhoneNumber = (phone) => {
      if (!phone) return true;
      const phoneRegex = /^\+?[1-9]\d{1,14}$/;
      return phoneRegex.test(phone);
    };

    const validateName = (name) => {
      const nameRegex = /^[a-zA-Z\s]{2,30}$/;
      return nameRegex.test(name.trim());
    };

    const validateField = (name, value) => {
      const newErrors = { ...errors };

      switch (name) {
        case "email":
          if (value && !validateEmail(value)) {
            newErrors.email = "Please enter a valid email address";
          } else {
            delete newErrors.email;
          }
          break;

        case "password":
          const passwordErrors = validatePassword(value);
          if (passwordErrors.length > 0) {
            newErrors.password = `Password must contain: ${passwordErrors.join(", ")}`;
          } else {
            delete newErrors.password;
          }
          break;

        case "Username":
          if (value && !validateUsername(value)) {
            newErrors.Username =
              "Username must be 3-20 characters, letters, numbers, underscore only";
          } else {
            delete newErrors.Username;
          }
          break;

        case "firstName":
          if (value && !validateName(value)) {
            newErrors.firstName =
              "First name must be 2-30 characters, letters only";
          } else {
            delete newErrors.firstName;
          }
          break;

        case "lastName":
          if (value && !validateName(value)) {
            newErrors.lastName =
              "Last name must be 2-30 characters, letters only";
          } else {
            delete newErrors.lastName;
          }
          break;

        case "PhoneNumber":
          if (value && !validatePhoneNumber(value)) {
            newErrors.PhoneNumber = "Please enter a valid phone number";
          } else {
            delete newErrors.PhoneNumber;
          }
          break;
      }

      setErrors(newErrors);
    };

    const handleInputChange = (e) => {
      const { name, value } = e.target;
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));

      validateField(name, value);
    };

    const validateForm = () => {
      const newErrors = {};

      if (!formData.firstName.trim()) {
        newErrors.firstName = "First name is required";
      } else if (!validateName(formData.firstName)) {
        newErrors.firstName =
          "First name must be 2-30 characters, letters only";
      }

      if (!formData.lastName.trim()) {
        newErrors.lastName = "Last name is required";
      } else if (!validateName(formData.lastName)) {
        newErrors.lastName = "Last name must be 2-30 characters, letters only";
      }

      if (!formData.Username.trim()) {
        newErrors.Username = "Username is required";
      } else if (!validateUsername(formData.Username)) {
        newErrors.Username =
          "Username must be 3-20 characters, letters, numbers, underscore only";
      }

      if (!formData.email.trim()) {
        newErrors.email = "Email is required";
      } else if (!validateEmail(formData.email)) {
        newErrors.email = "Please enter a valid email address";
      }

      if (!formData.password) {
        newErrors.password = "Password is required";
      } else {
        const passwordErrors = validatePassword(formData.password);
        if (passwordErrors.length > 0) {
          newErrors.password = `Password must contain: ${passwordErrors.join(", ")}`;
        }
      }

      if (formData.PhoneNumber && !validatePhoneNumber(formData.PhoneNumber)) {
        newErrors.PhoneNumber = "Please enter a valid phone number";
      }

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      setIsValidating(true);

      if (!validateForm()) {
        setIsValidating(false);
        return;
      }

      const userData = {
        ...formData,
        IsAdmin: formData.role === "Admin",
      };

      setIsValidating(false);

      const success = await onCreateUser(userData);

      if (success) {
        setFormData({
          email: "",
          password: "",
          Username: "",
          firstName: "",
          lastName: "",
          PhoneNumber: "",
          role: "User",
        });
        setErrors({});
      }
    };

    const getInputClassName = (fieldName) => {
      const baseClass =
        "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors";

      if (errors[fieldName]) {
        return `${baseClass} border-red-500 dark:border-red-400`;
      }

      return `${baseClass} border-gray-300 dark:border-gray-600`;
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Create New User
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    First Name *
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className={getInputClassName("firstName")}
                  />
                  {errors.firstName && (
                    <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                      {errors.firstName}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className={getInputClassName("lastName")}
                  />
                  {errors.lastName && (
                    <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                      {errors.lastName}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Username *
                </label>
                <input
                  type="text"
                  name="Username"
                  value={formData.Username}
                  onChange={handleInputChange}
                  className={getInputClassName("Username")}
                  placeholder="3-20 characters, letters, numbers, underscore only"
                />
                {errors.Username && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                    {errors.Username}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={getInputClassName("email")}
                  placeholder="example@email.com"
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                    {errors.email}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Password *
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={getInputClassName("password")}
                  placeholder="8+ chars, uppercase, lowercase, numbers, symbols"
                />
                {errors.password && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                    {errors.password}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="PhoneNumber"
                  value={formData.PhoneNumber}
                  onChange={handleInputChange}
                  className={getInputClassName("PhoneNumber")}
                  placeholder="+1234567890"
                />
                {errors.PhoneNumber && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                    {errors.PhoneNumber}
                  </p>
                )}
              </div>

              {currentUserRole === "Admin" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Role
                  </label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    {availableRoles.map((role) => (
                      <option key={role.value} value={role.value}>
                        {role.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={
                    creatingUser ||
                    isValidating ||
                    Object.keys(errors).length > 0
                  }
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {creatingUser ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : isValidating ? (
                    "Validating..."
                  ) : (
                    "Create User"
                  )}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  };

  // Skeleton Loading Components
  const SkeletonRow = () => (
    <tr className="animate-pulse">
      <td className="p-4">
        <div className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </td>
      <td className="p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
          <div className="space-y-2">
            <div className="w-32 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="w-48 h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="w-28 h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </td>
      <td className="p-4">
        <div className="w-16 h-6 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
      </td>
      <td className="p-4">
        <div className="w-12 h-6 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
      </td>
      <td className="p-4">
        <div className="w-32 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </td>
      <td className="p-4">
        <div className="flex items-center justify-center gap-2">
          <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
        </div>
      </td>
    </tr>
  );

  const SkeletonCard = () => (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 transition-colors duration-300 animate-pulse">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
          <div className="space-y-2">
            <div className="w-32 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="w-16 h-6 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
          </div>
        </div>
        <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
      </div>
      <div className="space-y-3">
        <div className="w-48 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
        <div className="w-28 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
        <div className="w-36 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
        <div className="w-32 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
        <div className="w-12 h-6 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
        <div className="flex gap-2">
          <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
        </div>
      </div>
    </div>
  );

  // Error state
  if (error) {
    return (
      <div className="min-h-screen transition-colors duration-300 p-4 lg:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300 px-6 py-4 rounded-lg">
                <p className="font-semibold mb-2">Error Loading Data</p>
                <p className="text-sm">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen transition-colors duration-300 p-4 lg:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-2 transition-colors">
            User Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 transition-colors">
            {loading
              ? "Loading data..."
              : `Manage and view all registered users in the system (${users.length} users)`}
            {canEditRoles() && (
              <span className="ml-2 inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-xs font-medium">
                <Crown className="h-3 w-3" />
                Admin Access
              </span>
            )}
          </p>
        </div>

        {/* Controls Bar */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 mb-6 transition-colors duration-300">
          <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
            {/* Search & Filters */}
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  disabled={loading}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors disabled:opacity-50"
                />
              </div>

              <div className="relative">
                <button
                  disabled={loading}
                  onClick={() => setShowRoleFilter(!showRoleFilter)}
                  className="flex items-center gap-2 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300 disabled:opacity-50"
                >
                  <Filter className="h-5 w-5" />
                  <span>{roleFilter || "Filter by Role"}</span>
                  <ChevronDown className="h-4 w-4" />
                </button>

                {/* Role Filter Dropdown */}
                {showRoleFilter && (
                  <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10">
                    <div className="p-2">
                      <button
                        onClick={() => {
                          setRoleFilter("");
                          setShowRoleFilter(false);
                        }}
                        className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                      >
                        All Roles
                      </button>
                      {uniqueRoles.map((role) => (
                        <button
                          key={role}
                          onClick={() => {
                            setRoleFilter(role);
                            setShowRoleFilter(false);
                          }}
                          className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                        >
                          {role}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              {canEditRoles() && (
                <button
                  disabled={loading}
                  onClick={() => setShowNewUserModal(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  <Plus className="h-5 w-5" />
                  <span>New User</span>
                </button>
              )}
            </div>
          </div>

          {/* Active Filters */}
          {roleFilter && (
            <div className="mt-4 flex gap-2">
              {roleFilter && (
                <div className="flex items-center gap-2 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-sm">
                  <span>Role: {roleFilter}</span>
                  <button
                    onClick={() => setRoleFilter("")}
                    className="hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full p-1"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Selected Items Actions */}
          {selectedUsers.length > 0 && !loading && canEditRoles() && (
            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-blue-800 dark:text-blue-300 font-medium transition-colors">
                  {selectedUsers.length} user
                  {selectedUsers.length > 1 ? "s" : ""} selected
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowBulkRoleModal(true)}
                    className="px-3 py-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors flex items-center gap-1"
                  >
                    <UserCheck className="h-4 w-4" />
                    Update Roles
                  </button>
                  <button className="px-3 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                    Delete Selected
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Desktop Table */}
        <div className="hidden lg:block bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden transition-colors duration-300">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 transition-colors">
                <tr>
                  <th className="text-left p-4 font-semibold text-gray-900 dark:text-gray-100 transition-colors">
                    User
                  </th>
                  <th className="text-left p-4 font-semibold text-gray-900 dark:text-gray-100 transition-colors">
                    Role
                  </th>
                  {/* <th className="text-left p-4 font-semibold text-gray-900 dark:text-gray-100 transition-colors">Status</th> */}
                  <th className="text-left p-4 font-semibold text-gray-900 dark:text-gray-100 transition-colors">
                    Join Date
                  </th>
                  <th className="text-center p-4 font-semibold text-gray-900 dark:text-gray-100 transition-colors">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700 transition-colors">
                {loading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <SkeletonRow key={index} />
                  ))
                ) : currentUsers.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="p-12 text-center">
                      <div className="text-gray-500 dark:text-gray-400">
                        <p className="text-lg font-medium mb-2">
                          {searchTerm || roleFilter
                            ? "No search results found"
                            : "No users found"}
                        </p>
                        {!searchTerm && !roleFilter && (
                          <p className="text-sm">
                            No users found in the system
                          </p>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  currentUsers.map((user) => (
                    <tr
                      key={user.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <td className="p-4">
                        <div
                          className={`flex items-center gap-3 ${
                            canEditUser(user)
                              ? "cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg p-2 -m-2"
                              : ""
                          }`}
                          onClick={() => handleUserClick(user)}
                        >
                          <img
                            src={user.avatar}
                            alt={user.name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                          <div>
                            <div className="font-semibold text-gray-900 dark:text-gray-100 transition-colors flex items-center gap-2">
                              {user.name}
                              {user.email === currentUser?.email && (
                                <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-2 py-1 rounded-full">
                                  You
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1 transition-colors">
                              <Mail className="h-3 w-3" />
                              {user.email}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1 transition-colors">
                              <User className="h-3 w-3" />
                              {user.username}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="relative group">
                          <span
                            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border transition-colors ${getRoleColor(user.role)} ${
                              canEditUser(user)
                                ? "cursor-pointer hover:opacity-80"
                                : ""
                            }`}
                            onClick={() =>
                              canEditUser(user) && handleUserClick(user)
                            }
                          >
                            <Shield className="h-3 w-3" />
                            {user.role}
                          </span>

                          {/* Quick role change menu for admins */}
                          {canEditUser(user) && (
                            <div className="absolute left-0 top-full mt-1 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200 z-10">
                              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-2 min-w-[120px]">
                                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1 px-2">
                                  Quick Change:
                                </div>
                                {availableRoles.slice(0, 4).map(
                                  (role) =>
                                    role.value !== user.role && (
                                      <button
                                        key={role.value}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleQuickRoleChange(
                                            user,
                                            role.value,
                                          );
                                        }}
                                        className="w-full text-left px-2 py-1 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                                      >
                                        {role.label}
                                      </button>
                                    ),
                                )}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleUserClick(user);
                                  }}
                                  className="w-full text-left px-2 py-1 text-xs text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors border-t border-gray-200 dark:border-gray-700 mt-1 pt-1"
                                >
                                  More Options...
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                      {/* <td className="p-4">
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border transition-colors ${getStatusColor(user.status)}`}>
        {user.status}
      </span>
    </td> */}
                      <td className="p-4 text-gray-600 dark:text-gray-300 flex items-center gap-1 transition-colors">
                        <Calendar className="h-4 w-4" />
                        {user.joinDate}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-2">
                          {/* إضافة زر التعديل */}
                          {canEditUser(user) && (
                            <button
                              onClick={() => handleUserClick(user)}
                              className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            disabled={
                              deleteLoading[user.id] || !canDeleteUser(user)
                            }
                            className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
                          >
                            {deleteLoading[user.id] ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile Cards */}
        <div className="lg:hidden space-y-4">
          {loading ? (
            Array.from({ length: 3 }).map((_, index) => (
              <SkeletonCard key={index} />
            ))
          ) : currentUsers.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-gray-500 dark:text-gray-400">
                <p className="text-lg font-medium mb-2">
                  {searchTerm || roleFilter
                    ? "No search results found"
                    : "No users found"}
                </p>
                {!searchTerm && !roleFilter && (
                  <p className="text-sm">No users found in the system</p>
                )}
              </div>
            </div>
          ) : (
            currentUsers.map((user) => (
              <div
                key={user.id}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 transition-colors duration-300"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex items-center gap-3 ${
                        canEditUser(user)
                          ? "cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg p-2 -m-2"
                          : ""
                      }`}
                      onClick={() => handleUserClick(user)}
                    >
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100 transition-colors flex items-center gap-2">
                          {user.name}
                          {user.email === currentUser?.email && (
                            <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-2 py-1 rounded-full">
                              You
                            </span>
                          )}
                        </h3>
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border transition-colors ${getRoleColor(user.role)} ${
                            canEditUser(user)
                              ? "cursor-pointer hover:opacity-80"
                              : ""
                          }`}
                          onClick={() =>
                            canEditUser(user) && handleUserClick(user)
                          }
                        >
                          <Shield className="h-3 w-3" />
                          {user.role}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button className="p-2 text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
                    <MoreVertical className="h-5 w-5" />
                  </button>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 transition-colors">
                    <Mail className="h-4 w-4" />
                    <span>{user.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 transition-colors">
                    <User className="h-4 w-4" />
                    <span>{user.username}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 transition-colors">
                    <Phone className="h-4 w-4" />
                    <span>{user.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 transition-colors">
                    <Calendar className="h-4 w-4" />
                    <span>{user.joinDate}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 transition-colors">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border transition-colors ${getStatusColor(user.status)}`}
                  >
                    {user.status}
                  </span>
                  <div className="flex gap-2">
                    {canEditUser(user) && (
                      <button
                        onClick={() => handleUserClick(user)}
                        className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      disabled={deleteLoading[user.id] || !canDeleteUser(user)}
                      className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {deleteLoading[user.id] ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 transition-colors duration-300">
          <div className="text-sm text-gray-600 dark:text-gray-300 transition-colors">
            {loading ? (
              <div className="w-32 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            ) : (
              `Showing ${startIndex + 1}-${Math.min(endIndex, filteredUsers.length)} of ${filteredUsers.length} users`
            )}
          </div>
          <div className="flex gap-2">
            {loading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <div
                  key={index}
                  className="w-10 h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"
                ></div>
              ))
            ) : totalPages > 1 ? (
              <>
                <button
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 text-gray-700 dark:text-gray-300"
                >
                  Previous
                </button>

                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-4 py-2 rounded-lg transition-colors ${
                        currentPage === pageNum
                          ? "bg-blue-600 text-white"
                          : "border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 text-gray-700 dark:text-gray-300"
                >
                  Next
                </button>
              </>
            ) : null}
          </div>
        </div>
      </div>

      {/* User Modal */}
      {showUserModal && selectedUserForEdit && (
        <UserModal
          user={selectedUserForEdit}
          onClose={() => {
            setShowUserModal(false);
            setSelectedUserForEdit(null);
          }}
          onUpdateRole={handleUpdateUserRole}
        />
      )}

      {/* New User Modal */}
      {showNewUserModal && (
        <NewUserModal
          onClose={() => setShowNewUserModal(false)}
          onCreateUser={handleCreateUser}
        />
      )}

      {/* Bulk Role Update Modal */}
      {showBulkRoleModal && (
        <BulkRoleModal
          onClose={() => {
            setShowBulkRoleModal(false);
          }}
          onUpdateRoles={handleBulkRoleUpdate}
          selectedCount={selectedUsers.length}
        />
      )}
    </div>
  );
};

export default UsersPage;
