import React, { createContext, useState, useEffect } from "react";
import AuthContext from "./AuthContext";
import { createData } from "../../../utils/dataProvider";

const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Function to handle user login
  const login = async (credentials) => {
    try {
      const response = await createData("auth/login", {
        username: credentials.username,
        password: credentials.password,
      });

      if (response) {
        setIsAuthenticated(true);
        localStorage.setItem(
          "authToken",
          JSON.stringify({
            token: response.token,
            refreshToken: response.refreshToken,
          })
        );
        return response;
      }
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("authToken");
  };

  useEffect(() => {
    const authToken = JSON.parse(localStorage.getItem("authToken"));
    if (authToken) {
      setIsAuthenticated(true);
    } else {
      console.log("fasle");

      setIsAuthenticated(false);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        // currentUser: JSON.parse(localStorage.getItem("authToken")),
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
