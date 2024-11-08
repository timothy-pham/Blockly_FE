import { useState, StrictMode, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "./AuthContext/AuthContext";
import { Button, Typography } from "@mui/material";
// import backgroundAuth from '/backgroundAuth.webp'
import { GoogleLogin, useGoogleOneTapLogin } from "@react-oauth/google";
import { googleLogout } from "@react-oauth/google";
import { apiPost } from "../../utils/dataProvider";
const Login = () => {
  const navigate = useNavigate();
  const { isAuthenticated, login, loginWithGoogle } = useContext(AuthContext);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    var username = document.getElementById("username").value;
    var password = document.getElementById("password").value;

    if (username !== "admin") {
      if (username.length < 6 || username.length > 20) {
        setError("Tài khoản phải từ 6 đến 20 kí tự");
        return;
      }
    }
    if (password.length < 6 || password.length > 20) {
      setError("Mật khẩu phải từ 6 đến 20 kí tự");
      return;
    }
    const res = await login({ username, password });
    if (typeof res === "string") {
      setError(res);
    } else {
      setError("");
    }
  };

  const handleLoginGoogle = async (credentialResponse) => {
    const res = await loginWithGoogle(credentialResponse);
    if (typeof res === "string") {
      setError(res);
    } else {
      setError("");
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      console.log("is");
      navigate(`/`);
    }
  }, [isAuthenticated]);

  return (
    <section
      className="dark:bg-gray-900 relative"
      style={{
        backgroundImage: `url(/backgroundAuth.jpeg)`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="flex flex-col items-center justify-center px-6 py-8 h-[100vh] mx-auto lg:py-0">
        <div className="w-full bg-white rounded-lg shadow-2xl dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
          <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
            <h1 className="text-xl text-center font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
              Đăng nhập
            </h1>
            <form className="space-y-4 md:space-y-6">
              <div>
                <label
                  htmlFor="username"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Tài khoản
                </label>
                <input
                  name="username"
                  id="username"
                  className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-sky-600 focus:border-sky-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  placeholder="Tài khoản"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="password"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Mật khẩu
                </label>
                <input
                  type="password"
                  name="password"
                  id="password"
                  placeholder="Mật khẩu"
                  className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-sky-600 focus:border-sky-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  required
                  autoComplete="on"
                />
              </div>
              <Typography color="error">{error}</Typography>

              <Button
                onClick={handleLogin}
                variant="contained"
                className="w-full text-white bg-sky-600 hover:bg-sky-700 focus:ring-4 focus:outline-none focus:ring-sky-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-sky-600 dark:hover:bg-sky-700 dark:focus:ring-sky-800"
              >
                Đăng nhập
              </Button>
            </form>
            <div className="flex items-center justify-center space-x-2">
              <GoogleLogin
                onSuccess={(credentialResponse) => {
                  handleLoginGoogle(credentialResponse);
                }}
                onError={(error) => {
                  setError(error);
                }}
              />
            </div>
            <p className="text-sm font-light text-gray-500 dark:text-gray-400">
              Tạo tài khoản?{" "}
              <a
                onClick={() => navigate("/register")}
                className="font-bold text-sky-600 hover:underline dark:text-sky-500"
              >
                Tại đây
              </a>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
export default Login;
