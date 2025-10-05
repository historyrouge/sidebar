
"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User } from "firebase/auth";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  updateUserProfileInAuth: (displayName: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // Since auth is disabled, we always return a non-loading, no-user state.
  const value = {
    user: null,
    loading: false,
    updateUserProfileInAuth: async (displayName: string) => {
        console.log("User profiles are disabled. Update attempted for:", displayName);
    }
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
