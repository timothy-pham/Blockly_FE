import moment from "moment";

export const transformCodeBlockly = (input) => {
  const lines = input?.split("\n");

  // Các toán tử so sánh
  const operators = ["=", ">", "<", ">=", "<=", "!="];

  // Kiểm tra xem dòng có chứa bất kỳ toán tử so sánh nào không
  const containsOperator = (line) => {
    return operators.some((operator) => line.includes(operator));
  };

  // Lọc các dòng chứa toán tử so sánh và bỏ các dòng trống
  const output = lines
    ?.filter((line) => containsOperator(line))
    .map((line) => line.trim().replace(";", ""));

  return output;
};

export function truncateText(text, maxLength = 200) {
  if (text?.length > maxLength) {
    return text.slice(0, maxLength) + "...";
  }
  return text;
}

export const formatDateTime = (value, formatString = "DD/MM/YYYY HH:mm:ss") => {
  if (!value) return "";
  return moment(value).format(formatString);
};

export const formatTimeMessage = (value) => {
  const now = Date.now();
  const timeObj = new Date(value);
  const delta = (now - timeObj.getTime()) / 1000;

  if (delta < 60) {
    return "Vừa xong";
  } else if (delta < 3600) {
    const minutes = Math.floor(delta / 60);
    return `${minutes} phút trước`;
  } else if (delta < 86400) {
    const hours = Math.floor(delta / 3600);
    return `${hours} giờ trước`;
  } else if (delta < 604800) {
    const days = Math.floor(delta / 86400);
    return `${days} ngày trước`;
  } else {
    // Định dạng cho các khoảng thời gian dài hơn (tùy chọn)
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return timeObj.toLocaleDateString('vi-VN', options);
  }
}

export const milisecondToSecondMinute = (milisecond) => {
  const seconds = Math.floor(milisecond / 1000);
  const minutes = Math.floor(seconds / 60);
  return minutes > 0
    ? `${minutes} phút ${seconds % 60} giây`
    : ` ${seconds % 60} giây`;
};

export const formatTime = (seconds, isString) => {
  const minutes = Math.floor(seconds / 60);
  // chỉ lấy để lấy 2 chữ số cuối phần lẻ của giây
  const secs = Math.floor(seconds % 60);
  if (isString) {

    return `${minutes} phút ${secs} giây`;
  } else {

    return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
  }
};

export const formatNumber = (number) => {
  return number?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};
