import React, { createContext, useState, useEffect } from "react";
import AuthContext from "./AuthContext";
import { apiPost } from "../../../utils/dataProvider";

const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const login = async (credentials) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/auth/login`,
        {
          method: "POST",
          body: JSON.stringify({
            username: credentials.username,
            password: credentials.password,
          }),
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const res = await response.json();

      if (response.ok) {
        setIsAuthenticated(true);
        localStorage.setItem(
          "authToken",
          JSON.stringify({
            token: res.token,
            refreshToken: res.refreshToken,
            user: res.user,
          })
        );
        return res;
      } else if (response.status >= 400) {
        return res?.message;
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
