import { useNavigate } from "react-router-dom";
import { apiPost } from "../../utils/dataProvider";
import { Typography } from "@mui/material";
import { useState } from "react";
const Register = () => {
  const navigate = useNavigate();
  const [error, setError] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    var username = document.getElementById("username").value;
    var password = document.getElementById("password").value;
    var name = document.getElementById("name").value;

    if (username.length < 6 || username.length > 20) {
      setError("Tài khoản phải từ 6 đến 20 kí tự");
      return;
    }
    if (password.length < 6 || password.length > 20) {
      setError("Mật khẩu phải từ 6 đến 20 kí tự");
      return;
    }

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/auth/register`,
        {
          method: "POST",
          body: JSON.stringify({
            username,
            password,
            name,
          }),
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        navigate(`/login`);
      } else if (response.status === 409) {
        setError("Tài khoản này đã tồn tại");
      } else {
        setError("Tạo tài khoản thất bại");
      }
    } catch (error) {
      console.error("Login error:", error);
    }
  };
  return (
    <section
      class="dark:bg-gray-900 relative"
      style={{
        backgroundImage: `url(/backgroundAuth.jpeg)`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div class="flex flex-col items-center justify-center px-6 py-8 mx-auto h-[100vh] lg:py-0">
        <div class="w-full bg-white rounded-lg shadow-2xl dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
          <div class="p-6 space-y-4 md:space-y-6 sm:p-8">
            <h1 class="text-xl text-center font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
              Tạo tài khoản
            </h1>
            <form class="space-y-4 md:space-y-6">
              <div>
                <label
                  for="name"
                  class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Họ và tên
                </label>
                <input
                  type="name"
                  name="name"
                  placeholder="Trần Văn A"
                  id="name"
                  class="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-sky-600 focus:border-sky-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  required
                  autocomplete
                />
              </div>
              <div>
                <label
                  for="username"
                  class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Tài khoản
                </label>
                <input
                  name="username"
                  id="username"
                  class="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-sky-600 focus:border-sky-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  placeholder="Tài khoản"
                  required
                />
              </div>
              <div>
                <label
                  for="password"
                  class="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Mật khẩu
                </label>
                <input
                  type="password"
                  name="password"
                  id="password"
                  placeholder="Mật khẩu"
                  class="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-sky-600 focus:border-sky-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  required
                  autocomplete
                />
              </div>
              <Typography color="error">{error}</Typography>

              <button
                onClick={handleRegister}
                class="w-full text-white bg-sky-600 hover:bg-sky-700 focus:ring-4 focus:outline-none focus:ring-sky-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-sky-600 dark:hover:bg-sky-700 dark:focus:ring-sky-800"
              >
                Đăng ký
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};
export default Register;
