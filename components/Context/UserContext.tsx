"use client";

import React, { createContext, useContext } from "react";

// Context minimal pour l'authentification
type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  isAuthenticated: boolean;
};

type UserContextType = {
  user: User | null;
  isAuthenticated: boolean;
  isClient: boolean;
  isSalon: boolean;
  isAdmin: boolean;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({
  children,
  user,
}: {
  children: React.ReactNode;
  user: User;
}) => {
  const isAuthenticated = user.isAuthenticated;
  const isClient = user.role === "client";
  const isSalon = user.role === "salon";
  const isAdmin = user.role === "admin";

  const value = {
    user: isAuthenticated ? user : null,
    isAuthenticated,
    isClient,
    isSalon,
    isAdmin,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
