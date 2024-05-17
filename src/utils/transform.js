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
    .map((line) => line.trim().replace(";", ""))

  return output;
};
