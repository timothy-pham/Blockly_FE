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

  console.log("lines===", output);

  return output;
};

export function truncateText(text, maxLength = 200) {
  if (text.length > maxLength) {
    return text.slice(0, maxLength) + "...";
  }
  return text;
}

export const formatDateTime = (value, formatString = "DD/MM/YYYY HH:mm:ss") => {
  if (!value) return "";
  return moment(value).format(formatString);
};

export const milisecondToSecondMinute = (milisecond) => {
  const seconds = Math.floor(milisecond / 1000);
  const minutes = Math.floor(seconds / 60);
  return `${minutes} phút ${seconds % 60} giây`;
}
