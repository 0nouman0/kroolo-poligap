/**
 * Formats a date string or Date object to a readable format
 * @param date - Date string or Date object
 * @param options - Formatting options
 * @returns Formatted date string
 */
export const formatDate = (
  date: string | Date | null | undefined,
  options: {
    showTime?: boolean;
    timeFormat?: "12h" | "24h";
    dateFormat?: "MMM DD, YYYY" | "DD MMM YYYY" | "YYYY-MM-DD";
  } = {}
): string => {
  if (!date) return "-";

  const {
    showTime = false,
    timeFormat = "12h",
    dateFormat = "MMM DD, YYYY",
  } = options;

  const dateObj = typeof date === "string" ? new Date(date) : date;

  // Check if date is valid
  if (isNaN(dateObj.getTime())) return "-";

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const shortMonthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const day = dateObj.getDate();
  const month = dateObj.getMonth();
  const year = dateObj.getFullYear();
  const hours = dateObj.getHours();
  const minutes = dateObj.getMinutes();

  // Format date part
  let dateStr = "";
  switch (dateFormat) {
    case "MMM DD, YYYY":
      dateStr = `${monthNames[month]} ${day}, ${year}`;
      break;
    case "DD MMM YYYY":
      dateStr = `${day} ${shortMonthNames[month]} ${year}`;
      break;
    case "YYYY-MM-DD":
      dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(
        day
      ).padStart(2, "0")}`;
      break;
    default:
      dateStr = `${monthNames[month]} ${day}, ${year}`;
  }

  // Format time part if requested
  if (showTime) {
    let timeStr = "";

    if (timeFormat === "12h") {
      const ampm = hours >= 12 ? "PM" : "AM";
      const displayHours = hours % 12 || 12;
      timeStr = ` ${displayHours}:${String(minutes).padStart(2, "0")} ${ampm}`;
    } else {
      timeStr = ` ${String(hours).padStart(2, "0")}:${String(minutes).padStart(
        2,
        "0"
      )}`;
    }

    return dateStr + timeStr;
  }

  return dateStr;
};

/**
 * Formats a date to show only the time in 12-hour format with AM/PM
 * @param date - Date string or Date object
 * @returns Formatted time string
 */
export const formatTime = (date: string | Date | null | undefined): string => {
  if (!date) return "-";

  const dateObj = typeof date === "string" ? new Date(date) : date;

  if (isNaN(dateObj.getTime())) return "-";

  const hours = dateObj.getHours();
  const minutes = dateObj.getMinutes();
  const ampm = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 || 12;

  return `${displayHours}:${String(minutes).padStart(2, "0")} ${ampm}`;
};

/**
 * Formats a date to show relative time (e.g., "2 hours ago", "3 days ago")
 * @param date - Date string or Date object
 * @returns Relative time string
 */
export const formatRelativeTime = (
  date: string | Date | null | undefined
): string => {
  if (!date) return "-";

  const dateObj = typeof date === "string" ? new Date(date) : date;

  if (isNaN(dateObj.getTime())) return "-";

  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return "Just now";
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes === 1 ? "" : "s"} ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours === 1 ? "" : "s"} ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays} day${diffInDays === 1 ? "" : "s"} ago`;
  }

  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    return `${diffInWeeks} week${diffInWeeks === 1 ? "" : "s"} ago`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths} month${diffInMonths === 1 ? "" : "s"} ago`;
  }

  const diffInYears = Math.floor(diffInDays / 365);
  return `${diffInYears} year${diffInYears === 1 ? "" : "s"} ago`;
};
