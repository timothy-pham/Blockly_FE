import React, { useEffect, useState } from "react";
import {
  Avatar,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  TextField,
  Paper,
  Grid,
  IconButton,
  CardMedia,
  Box,
} from "@mui/material";
import LockIcon from "@mui/icons-material/Lock";
import {
  apiPost,
  fetchDataDetail,
  updateData,
} from "../../utils/dataProvider";
import { formatDateTime, formatNumber } from "../../utils/transform";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import { toast } from "react-toastify";
import { toastOptions } from "../../constant/toast";
import { uploadImage } from "../../utils/firebase";
import { useLoader } from "../../components/progress/LoaderContext";
import { set } from "lodash";

export const Profile = () => {
  const info = localStorage.getItem("authToken");
  const { user } = JSON.parse(info);
  const [openChangePassword, setOpenChangePassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [userDetail, setUserDetail] = useState();
  const [name, setName] = useState();
  const [showIcon, setShowIcon] = useState(false);
  const [refresh, setRefresh] = React.useState(false);
  const { setLoading } = useLoader();
  const fetchUserDetail = async () => {
    try {
      const res = await fetchDataDetail("users", user.user_id);
      if (res) {
        setUserDetail(res);
        setName(res.name);
      }
    } catch (e) {
      console.log("can not fetch users");
    }
  };

  useEffect(() => {
    fetchUserDetail();
  }, [refresh]);

  const handleSave = async () => {
    try {
      setLoading(true);
      if (!newPassword || !confirmPassword) {
        toast.error(
          `Vui lòng nhập mật khẩu mới và xác nhận mật khẩu.`,
          toastOptions
        );
        return;
      }
      if (newPassword !== confirmPassword) {
        toast.error(
          `Mật khẩu mới và xác nhận mật khẩu không khớp.`,
          toastOptions
        );
        return;
      }
      const res = await apiPost("auth/reset-password", {
        username: user.username,
        password: newPassword,
      });
      if (res) {
        toast.success(`Thay đổi mật khẩu thành công.`, toastOptions);
        handleCloseChangePassword();
      }
    } catch (e) {
      console.log("can not change password", e);
    } finally {
      setLoading(false);
      setNewPassword(null);
      setConfirmPassword(null);
    }
  };

  const handleOpenChangePassword = () => {
    setOpenChangePassword(true);
  };

  const handleCloseChangePassword = () => {
    setNewPassword(null);
    setConfirmPassword(null);
    setOpenChangePassword(false);
  };

  const handleAvatarChange = async (event) => {
    const file = event?.target?.files?.[0];
    if (file) {
      try {
        setLoading(true);
        let imageUrl = await uploadImage(file, "users");

        const res = await updateData(`users`, user.user_id, {
          meta_data: { avatar: imageUrl },
        });

        if (res) {
          // Update localStorage with the new avatar URL
          let currentUser = JSON.parse(localStorage.getItem("authToken"));
          if (currentUser) {
            console.log("before ===>", currentUser);
            if (!currentUser.user.meta_data) {
              currentUser.user.meta_data = {};
            }
            currentUser.user.meta_data.avatar = imageUrl;
            console.log("after ===>", currentUser);
            localStorage.setItem("authToken", JSON.stringify(currentUser));
          }

          toast.success(`Thay đổi ảnh đại diện thành công.`, toastOptions);
        }
      } catch (err) {
        console.log("Error when updating avatar", err);
        toast.error(
          `Có lỗi trong lúc thay đổi quyền. Vui lòng kiểm tra lại.`,
          toastOptions
        );
      } finally {
        setLoading(false);
        setRefresh(!refresh);
        event.target.value = "";
      }
    }
  };

  const userRole = {
    teacher: "Giáo viên",
    parent: "Phụ huynh",
    student: "Học sinh",
    admin: "Admin",
  };

  return (
    <>
      <Grid container spacing={3}>
        {/* Avatar and User Info Card */}
        <Grid item xs={12} md={4}>
          <Card style={{ height: "100%" }}>
            <>
              <input
                accept="image/*"
                id="avatar-upload"
                type="file"
                onChange={handleAvatarChange}
                style={{ display: "none" }}
              />
              <label htmlFor="avatar-upload">
                <Box
                  sx={{
                    position: "relative",
                    cursor: "pointer",
                    "&:hover img": {
                      opacity: 0.5,
                    },
                  }}
                  onMouseEnter={() => setShowIcon(true)} // Hiển thị icon khi rê chuột vào
                  onMouseLeave={() => setShowIcon(false)} // Ẩn icon khi rê chuột ra
                >
                  <CardMedia
                    component="img"
                    alt="User Avatar"
                    image={
                      userDetail?.meta_data?.avatar || "/default_avatar.png"
                    }
                  />
                  {showIcon && ( // Hiển thị icon khi showIcon là true
                    <Box
                      sx={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                      }}
                    >
                      <IconButton onClick={handleAvatarChange} color="inherit">
                        <CameraAltIcon fontSize={"large"} />
                      </IconButton>
                    </Box>
                  )}
                </Box>
              </label>
            </>

            <CardHeader
              // title={
              //   <Typography variant="h5" component="div">
              //     {user.name}
              //   </Typography>
              // }

              action={
                <IconButton onClick={handleOpenChangePassword}
                  style={{
                    marginRight: "10px",
                    backgroundColor: "#f0f0f0",
                    borderRadius: "5px",

                  }}
                >
                  <Typography variant="subtitle1" color="textSecondary" sx={
                    { mr: 1 }
                  }>
                    Đặt lại mật khẩu
                  </Typography>
                  <LockIcon />
                </IconButton>
              }
            />
          </Card>
        </Grid>

        {/* User Details */}
        <Grid item xs={12} md={8}>
          <Card style={{ height: "100%" }}>
            <CardContent>
              <TextField
                InputLabelProps={{ shrink: true }}
                margin="dense"
                label="Tên"
                fullWidth
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <TextField
                InputLabelProps={{ shrink: true }}
                margin="dense"
                label="Quyền"
                fullWidth
                value={userRole[userDetail?.role]}
                disabled
              />
              <TextField
                InputLabelProps={{ shrink: true }}
                margin="dense"
                label="Tên đăng nhập"
                fullWidth
                value={userDetail?.username}
                disabled
              />
              <TextField
                InputLabelProps={{ shrink: true }}
                margin="dense"
                label="Điểm tích lũy"
                fullWidth
                value={formatNumber(userDetail?.meta_data.points)}
                disabled
              />
              <TextField
                InputLabelProps={{ shrink: true }}
                margin="dense"
                label="Số trận tham gia thi đấu"
                fullWidth
                value={formatNumber(userDetail?.meta_data.matches)}
                disabled
              />
              <TextField
                InputLabelProps={{ shrink: true }}
                margin="dense"
                label="Ngày tạo tài khoản"
                fullWidth
                value={formatDateTime(userDetail?.created_at)}
                disabled
              />
              {/* submit */}
              <Button
                variant="contained"
                color="primary"
                size="large"
                sx={{ mt: 2 }}
                onClick={async () => {
                  try {
                    setLoading(true);
                    const res = await updateData(`users`, user.user_id, {
                      name,
                    });
                    if (res) {
                      toast.success(`Cập nhật thông tin thành công.`, toastOptions);
                    }
                  } catch (e) {
                    console.log("can not update user", e);
                    toast.error(
                      `Có lỗi trong lúc cập nhật thông tin. Vui lòng kiểm tra lại.`,
                      toastOptions
                    );
                  } finally {
                    setLoading(false);
                    setRefresh(!refresh);
                  }
                }}
              >
                Lưu
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Change Password Dialog */}
      <Dialog open={openChangePassword} onClose={handleCloseChangePassword}>
        <DialogTitle>Thay đổi mật khẩu</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Mật khẩu mới"
            type="password"
            fullWidth
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <TextField
            margin="dense"
            label="Xác nhận mật khẩu mới"
            type="password"
            fullWidth
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseChangePassword} color="primary">
            Hủy
          </Button>
          <Button onClick={handleSave} color="primary">
            Lưu
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
