import { createContext } from "react";
const AuthContext = createContext({
  isAuthenticated: false,
  login: () => { },
  loginWithGoogle: () => { },
  logout: () => { },
});

export default AuthContext;
