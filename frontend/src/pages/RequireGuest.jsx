import React from "react";
import { Navigate } from "react-router-dom";

const RequireGuest = ({ currentUser, children }) => {
  
  if (currentUser) {
    return <Navigate to="/externalUser" replace />;
  }
  return children;
};

export default RequireGuest;
