import CircleStackIcon from "@heroicons/react/24/solid/CircleStackIcon";
import RectangleGroupIcon from "@heroicons/react/24/solid/RectangleGroupIcon";
import GlobeAltIcon from "@heroicons/react/24/solid/GlobeAltIcon";
import ClockIcon from "@heroicons/react/24/solid/ClockIcon";
import QuestionMarkCircleIcon from "@heroicons/react/24/solid/QuestionMarkCircleIcon";
import TrophyIcon from "@heroicons/react/24/solid/TrophyIcon";
import UserIcon from "@heroicons/react/24/solid/UserIcon";
import ChatBubbleOvalLeftEllipsisIcon from "@heroicons/react/24/solid/ChatBubbleOvalLeftEllipsisIcon";
import QueueListIcon from "@heroicons/react/24/solid/QueueListIcon";
import ComputerDesktop from "@heroicons/react/24/solid/ComputerDesktopIcon";
import { SvgIcon } from "@mui/material";
import { Role } from "../constant/role";
import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber";
export const items = [
  // {
  //   title: "Trang chủ",
  //   permission: ["*"],
  //   path: "/",
  //   icon: (
  //     <SvgIcon fontSize="small">
  //       <GlobeAltIcon />
  //     </SvgIcon>
  //   ),
  // },

  // {
  //   title: "Trò chuyện",
  //   permission: ["*"],
  //   path: "/messages",
  //   icon: (
  //     <SvgIcon fontSize="small">
  //       <ChatBubbleOvalLeftEllipsisIcon />
  //     </SvgIcon>
  //   ),
  // },

  // {
  //   permission: ["*"],
  //   title: "Bảng xếp hạng ",
  //   path: "/ranking",
  //   icon: (
  //     <SvgIcon fontSize="small">
  //       <TrophyIcon />
  //     </SvgIcon>
  //   ),
  // },
  // {
  //   title: "Danh sách lớp",
  //   permission: ["*"],
  //   path: "/class",
  //   icon: (
  //     <SvgIcon fontSize="small">
  //       <QueueListIcon />
  //     </SvgIcon>
  //   ),
  // },
  // {
  //   permission: ["*"],
  //   title: "Lịch sử luyện tập",
  //   path: "/history",
  //   icon: (
  //     <SvgIcon fontSize="small">
  //       <ClockIcon />
  //     </SvgIcon>
  //   ),
  // },
  // {
  //   permission: ["*"],
  //   title: "Lịch sử thi đấu",
  //   path: "/history-plays",
  //   icon: (
  //     <SvgIcon fontSize="small">
  //       <ClockIcon />
  //     </SvgIcon>
  //   ),
  // },
  {
    title: "Quản lý phòng thi đấu",
    path: "/admin/roomManagement",
    permission: [Role.ADMIN],
    icon: (
      <SvgIcon fontSize="small">
        <ComputerDesktop />
      </SvgIcon>
    ),
  },
  {
    title: "Quản lý danh mục",
    path: "/admin/collectionManagement",
    permission: [Role.ADMIN],
    icon: (
      <SvgIcon fontSize="small">
        <CircleStackIcon />
      </SvgIcon>
    ),
  },
  {
    title: "Quản lý bài tập",
    path: "/admin/groupManagement",
    permission: [Role.ADMIN],
    icon: (
      <SvgIcon fontSize="small">
        <RectangleGroupIcon />
      </SvgIcon>
    ),
  },
  {
    title: "Quản lý câu hỏi",
    path: "/admin/blockManagement",
    permission: [Role.ADMIN],
    icon: (
      <SvgIcon fontSize="small">
        <QuestionMarkCircleIcon />
      </SvgIcon>
    ),
  },
  {
    title: "Quản lý người dùng",
    path: "/admin/userManagement",
    permission: [Role.ADMIN],
    icon: (
      <SvgIcon fontSize="small">
        <UserIcon />
      </SvgIcon>
    ),
  },
  {
    title: "Quản lý phiếu hỗ trợ",
    path: "/admin/ticket",
    permission: [Role.ADMIN],
    icon: (
      <SvgIcon fontSize="small">
        <ConfirmationNumberIcon />
      </SvgIcon>
    ),
  },
];
