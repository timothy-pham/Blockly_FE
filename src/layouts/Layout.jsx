import React, {
  useCallback,
  useEffect,
  useState,
  useContext,
  useRef,
} from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Avatar, IconButton, Toolbar, styled } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import AuthContext from "../pages/auth/AuthContext/AuthContext";
import MuiAppBar from "@mui/material/AppBar";
import { SideNav } from "./SideNav";
import { get } from "lodash";

const drawerWidth = 280;
const appBarHeight = 64;

const LayoutContainer = styled("div")(({ theme, open }) => ({
  display: "flex",
  flex: "1 1 auto",
  flexDirection: "column",
  width: "100%",
  backgroundColor: "#f0f0f0",
  minHeight: "100vh",
  padding: theme.spacing(3),
}));

const Main = styled("main", { shouldForwardProp: (prop) => prop !== "open" })(
  ({ theme, open }) => ({
    flexGrow: 1,
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginLeft: open ? drawerWidth : 0,
    width: `calc(100% - ${open ? drawerWidth : 0}px)`,
    position: "relative",
    marginTop: appBarHeight,
  })
);

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  position: "fixed",
  top: 0,
  zIndex: 50,
  width: "100%",
  backgroundColor: theme.palette.mode === "dark" ? "#2d3748" : "#ffffff",
  borderBottom: `1px solid ${
    theme.palette.mode === "dark" ? "#4a5568" : "#e2e8f0"
  }`,
  transition: theme.transitions.create(["margin", "width"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: drawerWidth,
    height: appBarHeight,
    transition: theme.transitions.create(["margin", "width"], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

export const Layout = () => {
  const { pathname } = useLocation();
  const [openNav, setOpenNav] = useState(true);
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  const dropdownRef = useRef(null); // Create a ref for the dropdown

  const [avatar, setAvatar] = useState(""); // State for the avatar

  const info = localStorage.getItem("authToken");
  const user = get(JSON.parse(info), "user", {});

  // Set initial avatar from localStorage
  useEffect(() => {
    setAvatar(user?.meta_data?.avatar || "");
  }, [user]);

  // Listen for localStorage changes
  useEffect(() => {
    const handleStorageChange = () => {
      const updatedUser = get(
        JSON.parse(localStorage.getItem("authToken")),
        "user",
        {}
      );
      setAvatar(updatedUser?.meta_data?.avatar || "");
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const toggleUserDropdown = () => {
    setIsUserDropdownOpen(!isUserDropdownOpen);
  };

  const closeUserDropdown = useCallback(() => {
    setIsUserDropdownOpen(false);
  }, []);

  // Close the dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        closeUserDropdown();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [closeUserDropdown]);

  useEffect(() => {
    if (pathname.includes("/play")) {
      setOpenNav(false);
    }
  }, [pathname]);

  const handleLogout = () => {
    logout();
    navigate(`/login`);
  };

  const getName = (name) => {
    if (!name) return "";
    const names = name.split(" ");
    const initials = names.map((n) => n.charAt(0).toUpperCase());
    return initials.join("");
  };

  return (
    <>
      <AppBar position="fixed" open={openNav}>
        <Toolbar
          sx={{
            display: "flex",
            justifyContent: !openNav ? "space-between" : "flex-end",
          }}
        >
          <IconButton
            aria-label="open drawer"
            onClick={() => setOpenNav(!openNav)}
            edge="start"
            sx={{ mr: 2, ...(openNav && { display: "none" }) }}
          >
            <MenuIcon color="primary" />
          </IconButton>
          <div>
            {avatar ? (
              <Avatar
                src={avatar}
                aria-expanded={isUserDropdownOpen}
                onClick={toggleUserDropdown}
              />
            ) : (
              <div
                aria-expanded={isUserDropdownOpen}
                onClick={toggleUserDropdown}
                style={{ backgroundColor: "#1976d2" }}
                className="w-8 h-8 rounded-full mr-2 flex items-center justify-center text-white font-bold select-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-sky-600"
              >
                {getName(user.name)}
              </div>
            )}

            <div
              ref={dropdownRef} // Attach ref to the dropdown
              className={`z-50 ${
                isUserDropdownOpen ? "" : "hidden"
              } my-4 text-base list-none bg-white divide-y divide-gray-100 rounded-lg shadow dark:bg-gray-700 dark:divide-gray-600 fixed top-[30px] right-[23px]`}
              id="user-dropdown"
            >
              <div className="px-4 py-3">
                <span className="block text-sm text-gray-900 dark:text-white">
                  {user.name}
                </span>
                <span className="block text-sm text-gray-500 truncate dark:text-gray-400">
                  {user.username}
                </span>
              </div>
              <ul className="py-2" aria-labelledby="user-menu-button">
                <li>
                  <a
                    onClick={() => navigate("/profile")}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white"
                  >
                    Trang cá nhân
                  </a>
                </li>
              </ul>
              <ul className="py-2" aria-labelledby="user-menu-button">
                <li>
                  <a
                    onClick={handleLogout}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white"
                  >
                    Đăng xuất
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </Toolbar>
      </AppBar>
      <SideNav setOpenNav={setOpenNav} open={openNav} />
      <Main open={openNav}>
        <LayoutContainer>
          <Outlet />
        </LayoutContainer>
      </Main>
    </>
  );
};
