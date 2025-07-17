// src/stores/authStore.js
import { create } from "zustand";

const useAuthStore = create((set) => ({
  UserIslogged: false,
  role: "",
  isLoading: true,
  error: null,
  errorLogin: null,
  userData: null,

  fetchUserData: async () => {
    set({ isLoading: true, error: null });
    try {
      const userInfoResponse = await fetch("/api/user/getUserInfo");

      if (userInfoResponse.status === 401) {
        set({
          UserIslogged: false,
          role: "",
          userData: null,
          isLoading: false,
        });
        return;
      }

      if (!userInfoResponse.ok) throw new Error("Failed to fetch user info");

      const userData = await userInfoResponse.json();
      set({
        UserIslogged: true,
        role: userData.role,
        userData: {
          id: userData.id,
          email: userData.email,
          username: userData.username,
          role: userData.role,
        },
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error.message || "Error fetching user data",
        UserIslogged: false,
        role: "",
        userData: null,
        isLoading: false,
      });
    }
  },

  login: async (email, password) => {
    set({ isLoading: true, errorLogin: null });
    try {
      const response = await fetch("/api/user/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();

        set({
          UserIslogged: true,
          role: data.user.role,
          userData: data.user,
          isLoading: false,
        });

        return { success: true };
      } else {
        const errorData = await response.json();
        set({
          errorLogin: errorData.error || "Login failed",
          isLoading: false,
          UserIslogged: false,
        });
        return { success: false, error: errorData.error };
      }
    } catch (error) {
      set({
        errorLogin: "Server connection error",
        isLoading: false,
        UserIslogged: false,
      });
      return { success: false, error: "Server connection error" };
    }
  },

  setUserData: (userData) => {
    set({
      UserIslogged: true,
      role: userData.role,
      userData: userData,
      isLoading: false,
    });
  },

  logout: () => {
    set({
      UserIslogged: false,
      role: null,
      userData: null,
      isLoading: false,
    });
  },
}));

export default useAuthStore;
