import React, { createContext, useState, useEffect, useRef } from "react";
import AuthContext from "./AuthContext";
import { apiPost, apiGetDetail } from "../../../utils/dataProvider";

const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isGuestView, setIsGuestView] = useState(false);

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
      return error?.message;
    }
  };

  const loginWithGoogle = async (credentialResponse) => {
    try {
      const res = await apiPost("auth/login-google", credentialResponse);
      if (res) {
        localStorage.setItem(
          "authToken",
          JSON.stringify({
            token: res.token,
            refreshToken: res.refreshToken,
            user: res.user,
          })
        );
        setIsAuthenticated(true);
        return res;
      }
    } catch (error) {
      return error?.message;
    }
  };

  const logout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("adminToken");
    setIsAuthenticated(false);
  };

  const startGuestView = async (res) => {
    try {
      const oldToken = localStorage.getItem("authToken");
      localStorage.setItem('adminToken', oldToken);
      localStorage.setItem(
        "authToken",
        JSON.stringify({
          token: res.token,
          refreshToken: res.refreshToken,
          user: res.user,
        })
      );
      setIsGuestView(true);
    } catch (error) {
      console.log(error);
    }
  }

  const cancelGuestView = () => {
    const oldToken = localStorage.getItem("adminToken");
    localStorage.removeItem("adminToken");
    localStorage.setItem(
      "authToken",
      oldToken
    );
    setIsGuestView(false);
  }
  const hasFetched = useRef(false);

  useEffect(() => {
    if (!hasFetched.current) {
      console.log("Khởi tạo")
      const authToken = JSON.parse(localStorage.getItem("authToken"));
      if (authToken) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
      hasFetched.current = true; // Ensure it only runs once
    }
  }, []);


  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isGuestView,
        startGuestView,
        cancelGuestView,
        login,
        logout,
        loginWithGoogle,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
