import React, {
  useCallback,
  useEffect,
  useState,
  useContext,
  useRef,
} from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  Avatar,
  IconButton,
  Toolbar,
  Badge,
  Menu,
  MenuItem,
  Box,
  Button,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import AuthContext from "../pages/auth/AuthContext/AuthContext";
import MuiAppBar from "@mui/material/AppBar";
import { SideNav } from "./SideNav";
import { get, set } from "lodash";
import { ContactButton } from "../components/ContactButton/ContactButton";
import { socket } from "../socket";
import EmailIcon from "@mui/icons-material/Email";
import { styled } from "@mui/material/styles";
import CheckIcon from "@mui/icons-material/Check";
import ClearIcon from "@mui/icons-material/Clear";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import "./layout.css";

const appBarHeight = 0;

const LayoutContainer = styled("div")(({ theme }) => ({
  display: "flex",
  flex: "1 1 auto",
  flexDirection: "column",
  width: "100%",
  overflow: "hidden",
}));

export const Layout = () => {
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [inviteData, setInviteData] = useState([]);
  const { pathname } = useLocation();

  const dropdownRef = useRef(null); // Create a ref for the dropdown

  const [avatar, setAvatar] = useState(""); // State for the avatar

  const info = localStorage.getItem("authToken");
  const user = get(JSON.parse(info), "user", {});

  // Set initial avatar from localStorage
  useEffect(() => {
    setAvatar(user?.meta_data?.avatar || "");
  }, [user]);

  // scroll to top when changing route
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  // Listen for localStorage changes
  useEffect(() => {
    socket.emit("user_connected", user);
    const handleStorageChange = () => {
      const updatedUser = get(
        JSON.parse(localStorage.getItem("authToken")),
        "user",
        {}
      );
      setAvatar(updatedUser?.meta_data?.avatar || "");
    };

    const oldInviteData = localStorage.getItem("inviteData");
    if (oldInviteData) {
      setInviteData(JSON.parse(oldInviteData));
    }

    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  useEffect(() => {
    socket.on("invite_user", (data) => {
      setInviteData((prev) => {
        let isExist = false;
        for (let i = 0; i < prev.length; i++) {
          if (prev[i].room.room_id === data.room.room_id) {
            isExist = true;
            break;
          }
        }
        if (isExist) {
          return prev;
        }

        const updatedInviteData = [...prev, data];
        localStorage.setItem("inviteData", JSON.stringify(updatedInviteData));
        return updatedInviteData;
      });
    });

    return () => {
      socket.off("invite_user");
    };
  }, [socket]);

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

  const handleLogout = () => {
    logout();
    navigate(`/login`);
  };

  const handleScroll = (e) => {
    e.preventDefault();
    document
      .querySelector("#content-section")
      .scrollIntoView({ behavior: "smooth" });
  };
  const isDashboard = pathname === "/";

  return (
    <>
      <Header
        inviteData={inviteData}
        setInviteData={setInviteData}
        avatar={avatar}
        toggleUserDropdown={toggleUserDropdown}
        isUserDropdownOpen={isUserDropdownOpen}
        handleLogout={handleLogout}
        closeUserDropdown={closeUserDropdown}
        isDashboard={isDashboard}
      />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
        }}
      >
        {isDashboard && (
          <div className="layout-image">
            <div className="layout-content">
              {/* <div className="layout-buttonContainer">
                <a
                  href="https://twitter.com/fredsrocha"
                  className="js-nav"
                  data-element="logo"
                  target="_blank"
                />

                <a
                  className="Button StreamsSignUp js-signup"
                  href="https://twitter.com/signup"
                  data-component="hero"
                  data-element="buttons"
                >
                  Inscreva-se
                </a>
                <a className="Button StreamsLogin js-login" href="/login">
                  Entrar
                </a>
              </div> */}
            </div>

            <div className="title-wrapper" onClick={handleScroll}>
              <div className="title">
                <div className="datons">DATONS</div>
                <div className="datons-sub">Chăm chỉ luyện tập</div>
                <div className="datons-sub">Tự tin thi đấu!</div>
                <ScrollToContent />
              </div>
            </div>
          </div>
        )}

        <div id="content-section" className="layout-container">
          <LayoutContainer>
            <Outlet />
          </LayoutContainer>
        </div>

        <div className="footer">
          <p>&copy; 2024 DATONS. All rights reserved.</p>
          <a href="#">Privacy Policy</a> | <a href="#">Terms of Service</a>
        </div>
      </div>
    </>
  );
};

const ScrollToContent = () => {
  const handleScroll = (e) => {
    e.preventDefault();
    document
      .querySelector("#content-section")
      .scrollIntoView({ behavior: "smooth" });
  };

  return (
    <a
      className="Button scroll-button"
      href="#content-section"
      onClick={handleScroll}
    >
      <ExpandMoreIcon style={{ fontSize: "48px", color: "white" }} />
    </a>
  );
};

const AppBar = styled(MuiAppBar)(({ theme, scrolly, isdashboard }) => ({
  top: 0,
  width: "100%",
  position: isdashboard === "true" ? "none" : "sticky",
  backgroundColor:
    isdashboard === "true"
      ? scrolly > appBarHeight
        ? "var(--black)"
        : "transparent"
      : "var(--black)",
  transition: "background-color 0.3s ease",
  zIndex: 50,
}));

export const Header = ({
  inviteData,
  avatar,
  isUserDropdownOpen,
  toggleUserDropdown,
  closeUserDropdown,
  handleLogout,
  isDashboard,
  setInviteData,
}) => {
  const navigate = useNavigate();
  const [scrollY, setScrollY] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const dropdownRef = useRef(null);
  const info = localStorage.getItem("authToken");
  const user = get(JSON.parse(info), "user", {});
  const { role } = user;

  const isAdmin = role === "admin";
  const handleScroll = () => {
    setScrollY(window.scrollY);
  };

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const getName = (name) => {
    if (!name) return "";
    const names = name.split(" ");
    const initials = names.map((n) => n.charAt(0).toUpperCase());
    return initials.join("");
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

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
  return (
    <AppBar
      position="fixed"
      scrolly={scrollY}
      isdashboard={isDashboard.toString()}
    >
      <Toolbar
        sx={{
          display: "flex",
          justifyContent: "end",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center" }}>
          {menuHeader.map(
            (item) =>
              (item.role === "admin" && !isAdmin) || (
                <Button
                  key={item.title}
                  component={Link}
                  to={item.path}
                  sx={{
                    mx: 1,
                    color: "white",
                    fontWeight: "bold",
                    color: "#fff",
                    fontSize: "1rem",
                    "&:hover": {
                      backgroundColor: "hsl(12, 90%, 63%)",
                      color: "#fff",
                    },
                  }} // margin giữa các nút
                  startIcon={item.icon}
                >
                  {item.title}
                </Button>
              )
          )}
        </Box>
        {inviteData.length > 0 && (
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleClose}
          >
            {inviteData.map((row, index) => {
              const room = row.room;
              const user_from = row.user_from;
              return (
                <MenuItem key={index}>
                  <div className="flex items-center">
                    <img
                      src={
                        user_from?.meta_data?.avatar || "/default_avatar.png"
                      }
                      className="w-8 h-8 rounded-full object-cover mr-2"
                      referrerPolicy="no-referrer"
                    />
                    <div className="font-bold">{user_from.name}</div>
                    <div className="ms-1">mời bạn tham gia phòng</div>
                    <div className="ms-1 font-bold">{room.name}</div>
                  </div>
                  <div className="flex ml-2">
                    <IconButton
                      color="success"
                      onClick={() => {
                        navigate(`/rooms/${room.room_id}`);
                        setInviteData((prev) => {
                          const newData = prev.filter(
                            (item) => item.room.room_id !== room.room_id
                          );
                          localStorage.setItem(
                            "inviteData",
                            JSON.stringify(newData)
                          );
                          return newData;
                        });
                        handleClose();
                      }}
                    >
                      <CheckIcon />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => {
                        setInviteData((prev) => {
                          const newData = prev.filter(
                            (item) => item.room.room_id !== room.room_id
                          );
                          localStorage.setItem(
                            "inviteData",
                            JSON.stringify(newData)
                          );
                          return newData;
                        });
                        handleClose();
                      }}
                    >
                      <ClearIcon />
                    </IconButton>
                  </div>
                </MenuItem>
              );
            })}
          </Menu>
        )}
        <div className="flex">
          <Badge
            badgeContent={inviteData.length}
            color="error"
            sx={{
              fontSize: 12,
              fontWeight: "bold",
              marginRight: 1,
              "& .MuiBadge-badge": {
                right: 5,
                top: 8,
              },
            }}
          >
            <IconButton
              style={{
                color: "#fff",
              }}
              aria-label="Mời"
              onClick={handleClick}
            >
              <EmailIcon />
            </IconButton>
          </Badge>
          {avatar ? (
            <img
              className="cursor-pointer w-8 h-8 rounded-full"
              src={avatar}
              aria-expanded={isUserDropdownOpen}
              onClick={() => toggleUserDropdown(!isUserDropdownOpen)}
            />
          ) : (
            <div
              aria-expanded={isUserDropdownOpen}
              onClick={() => toggleUserDropdown(!isUserDropdownOpen)}
              style={{ backgroundColor: "#1976d2" }}
              className="w-8 h-8 rounded-full mr-2 flex items-center justify-center text-white font-bold select-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-sky-600"
            >
              {getName(user?.name)}
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
                {user?.name}
              </span>
              <span className="block text-sm text-gray-500 truncate dark:text-gray-400">
                {user?.username}
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
                  onClick={() => navigate("/class")}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white"
                >
                  Danh sách lớp
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
  );
};

const menuHeader = [
  {
    title: "Trang chủ",
    path: "/",
  },
  {
    title: "Bảng xếp hạng ",
    path: "/ranking",
  },
  {
    title: "Lịch sử luyện tập",
    path: "/history",
  },
  {
    title: "Lịch sử thi đấu",
    path: "/history-plays",
  },
  {
    title: "Trò chuyện",
    path: "/messages",
  },
  {
    title: "Admin",
    path: "/admin/collectionManagement",
    role: "admin",
  },
];
