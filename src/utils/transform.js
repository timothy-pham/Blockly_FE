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


export function getReview(percentage) {
  const review = {
    0: "Rất tiếc, bạn chưa làm đúng câu nào. Đừng nản lòng, hãy thử lại nhé!",
    "1-10": "Có công mài sắt có ngày nên kim. Hãy cố gắng hơn nữa nhé!",
    "11-20": "Bạn đang trên đường đi đúng hướng. Cố lên nào!",
    "21-30": "Khá hơn rồi! Tiếp tục cố gắng bạn nhé!",
    "31-40": "Bạn đã có tiến bộ, nhưng vẫn còn có thể làm tốt hơn!",
    "41-50": "Bạn đang ở mức trung bình. Hãy cố gắng hơn để đạt kết quả tốt hơn!",
    "51-60": "Bạn đã làm khá tốt! Tiếp tục phát huy nhé!",
    "61-70": "Kết quả tốt! Chỉ cần một chút nữa là bạn sẽ đạt kết quả xuất sắc!",
    "71-80": "Rất tốt! Bạn đã nắm được phần lớn kiến thức!",
    "81-90": "Xuất sắc! Bạn chỉ còn một chút nữa là hoàn toàn chính xác!",
    "91-99": "Gần như hoàn hảo! Bạn đã nắm vững kiến thức!",
    100: "Tuyệt vời! Bạn đã làm đúng toàn bộ! Tiếp tục phát huy nhé!"
  };

  // Làm tròn số percentage thành số nguyên
  const roundedPercentage = Math.round(percentage);

  if (roundedPercentage === 0) {
    return review[0];
  } else if (roundedPercentage === 100) {
    return review[100];
  } else {
    for (let range in review) {
      if (range.includes('-')) {
        const [min, max] = range.split('-').map(Number);
        if (roundedPercentage >= min && roundedPercentage <= max) {
          return review[range];
        }
      }
    }
  }
  return "Không tìm thấy lời đánh giá phù hợp."; // Trường hợp không nằm trong khoảng nào
}