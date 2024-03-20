import React from "react";
import { Route, Navigate } from "react-router-dom";
import auth from "../firebase";
import { useAuthState } from "react-firebase-hooks/auth";

const PrivateRoute = ({ children }) => {
  const [user, loading, error] = useAuthState(auth);

  if (loading) {
    return <div>Loading...</div>; // Or any loading spinner
  }

  if (!user) {
    return <Navigate to="/login" />; // Redirect to login if there's no user
  }

  return children; // User is authenticated, render the child component
};

export default PrivateRoute;
