import { createContext } from "react";
const AuthContext = createContext({
  isAuthenticated: false,
  isGuestView: false,
  startGuestView: (res) => { },
  cancelGuestView: () => { },
  login: () => { },
  loginWithGoogle: () => { },
  logout: () => { },
});

export default AuthContext;
