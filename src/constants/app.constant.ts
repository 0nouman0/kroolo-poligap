export const CAPTCHA_ENABLE_URI = [
  "https://ustage01-app-api.kroolo.com/api/v1",
  "https://api.kroolo.com/api/v1",
];
export const NAV_HEIGHT = "40px";
export const SIDE_DRAWER_WIDTH = "220px";
export const SIDE_DRAWER_MINWIDTH = "70px";

export const AVATAR_BG = "#F2F4F7";
export const BOARD_VIEW_CARD_WIDTH = 270;
export const VIEWS_WITH_GROUPBY = ["list", "kanban", "table"];
export const VIEWS_WITH_SUBTASKS = ["calendar", "workload"];
export const ADD_LABEL_OPTIONS = [
  "label",
  "dropdown",
  "single-select",
  "multi-select",
];
export const ADD_CURRENCY_OPTIONS = ["currency"];
export const BOARD_FILTER_VIEW = [
  "list",
  "kanban",
  "calendar",
  "timeline",
  "docs",
  "files",
  "embeds",
  "chat",
];
export const BOARD_HIDE_FILTER_VIEW = ["docs", "chat", "embeds"];
export const TASK_FILTER_VIEW = [
  "list",
  "kanban",
  "board",
  "calendar",
  "timeline",
  "workload",
  "table",
];
export const TASK_SPRINT_VIEW = ["list", "kanban", "board"];
export const ESTIMATION_COLUMNS = ["EstimatedSP", "ActualSP"];
// Project Status Reference
export const BACKLOG_STATUS_REFERENCE = "Backlog";
export const OPEN_STATUS_REFERENCE = "Open";
export const REOPEN_STATUS_REFERENCE = "Open";
export const DONE_STATUS_REFERENCE = "Done";
export const CLOSED_STATUS_REFERENCE = "Closed";
// global priority reference
export const DEFAULT_PRIORITY_REFERENCE = "Medium";
// Activity Type Reference
export const PERSONAL_ACTIVITY_TYPE = "Personal";
// Dependency constants
export const BLOCKING_DEPENDENCY = "Blocking";
export const WAITING_DEPENDENCY = "Waiting On";
// default status color
export const DEFAULT_GROUP_COLOR = "#7F56D9";
export const DEFAULT_ACTIVITY_TYPE_COLOR = "#66C61C";
export const DEFAULT_ACTIVITY_STATUS_COLOR = "#D0D5DD";
export const ARCHIVE_COLOR = "#F04438";
export const ARCHIVE_LABEL = "Archived";

export const BTN_COLOR_BASE = "#7073FC";
export const BTN_COLOR_HOVER = "#625DF5";
export const DROPPABLE_ACTIVE = "#BDB4FE40";
export const LINK_COLOR_BASE = "#1570EF";
export const LINK_COLOR_HOVER = "#1364D6";
export const LINK_VIDEO_COLOR = "#3397FF";

export const MYTASK_DEFAULT_GROUP = "Assigned";
export const B2B_CLIENT_USER_DATA = {
  workSpaceData: {
    workSpaceName: "Kroolo WorkSpace",
  },
  projectData: {
    projectName: "Demo Project",
  },
};
export const MESSAGE_LIMIT_COUNT = 10;
export const DEFAULT_STARTER_USER_QUANTITY = 25;
export const SLASH_MENU_DATA = {
  hint: {
    insertFile: "Insert a File",
    embedGoogleDrive: "Add a file from Google Drive",
    embedGoogleSheet: "Add a Google Sheet",
    embedGoogleSlide: "Add a Google Slide",
    embedGoogleDocs: "Add a Google Doc",
    embedGoogleForm: "Embed a Google Form",
    embedKrooloForm: "Embed a Kroolo Form",
    embedTypeForm: "Embed a Type Form",
    embedVideo: "Embed a YouTube video",
    embedVimeo: "Embed a Vimeo video",
    embedWhimscal: "Embed a Whimscal Chart",
    embedLoom: "Embed a Loom video",
    embedMiro: "Embed a Miro Chart",
    embedFigma: "Add a Figma File",
    pageBlock: "Embed a Sub-Doc inside this document",
    addSubBlock: "Embed a Sub-Doc inside this document",
  },
};

export const ANNUAL_PLAN_PERCENT_OFF = 30;
export const TRIAL_PLAN_PERIOD = "14 days";
export const trackTimeList = [
  { label: "12:00 AM", value: 0 },
  { label: "12:15 AM", value: 0.25 },
  { label: "12:30 AM", value: 0.5 },
  { label: "12:45 AM", value: 0.75 },
  { label: "1:00 AM", value: 1 },
  { label: "1:15 AM", value: 1.25 },
  { label: "1:30 AM", value: 1.5 },
  { label: "1:45 AM", value: 1.75 },
  { label: "2:00 AM", value: 2 },
  { label: "2:15 AM", value: 2.25 },
  { label: "2:30 AM", value: 2.5 },
  { label: "2:45 AM", value: 2.75 },
  { label: "3:00 AM", value: 3 },
  { label: "3:15 AM", value: 3.25 },
  { label: "3:30 AM", value: 3.5 },
  { label: "3:45 AM", value: 3.75 },
  { label: "4:00 AM", value: 4 },
  { label: "4:15 AM", value: 4.25 },
  { label: "4:30 AM", value: 4.5 },
  { label: "4:45 AM", value: 4.75 },
  { label: "5:00 AM", value: 5 },
  { label: "5:15 AM", value: 5.25 },
  { label: "5:30 AM", value: 5.5 },
  { label: "5:45 AM", value: 5.75 },
  { label: "6:00 AM", value: 6 },
  { label: "6:15 AM", value: 6.25 },
  { label: "6:30 AM", value: 6.5 },
  { label: "6:45 AM", value: 6.75 },
  { label: "7:00 AM", value: 7 },
  { label: "7:15 AM", value: 7.25 },
  { label: "7:30 AM", value: 7.5 },
  { label: "7:45 AM", value: 7.75 },
  { label: "8:00 AM", value: 8 },
  { label: "8:15 AM", value: 8.25 },
  { label: "8:30 AM", value: 8.5 },
  { label: "8:45 AM", value: 8.75 },
  { label: "9:00 AM", value: 9 },
  { label: "9:15 AM", value: 9.25 },
  { label: "9:30 AM", value: 9.5 },
  { label: "9:45 AM", value: 9.75 },
  { label: "10:00 AM", value: 10 },
  { label: "10:15 AM", value: 10.25 },
  { label: "10:30 AM", value: 10.5 },
  { label: "10:45 AM", value: 10.75 },
  { label: "11:00 AM", value: 11 },
  { label: "11:15 AM", value: 11.25 },
  { label: "11:30 AM", value: 11.5 },
  { label: "11:45 AM", value: 11.75 },
  { label: "12:00 PM", value: 12 },
  { label: "12:15 PM", value: 12.25 },
  { label: "12:30 PM", value: 12.5 },
  { label: "12:45 PM", value: 12.75 },
  { label: "1:00 PM", value: 13 },
  { label: "1:15 PM", value: 13.25 },
  { label: "1:30 PM", value: 13.5 },
  { label: "1:45 PM", value: 13.75 },
  { label: "2:00 PM", value: 14 },
  { label: "2:15 PM", value: 14.25 },
  { label: "2:30 PM", value: 14.5 },
  { label: "2:45 PM", value: 14.75 },
  { label: "3:00 PM", value: 15 },
  { label: "3:15 PM", value: 15.25 },
  { label: "3:30 PM", value: 15.5 },
  { label: "3:45 PM", value: 15.75 },
  { label: "4:00 PM", value: 16 },
  { label: "4:15 PM", value: 16.25 },
  { label: "4:30 PM", value: 16.5 },
  { label: "4:45 PM", value: 16.75 },
  { label: "5:00 PM", value: 17 },
  { label: "5:15 PM", value: 17.25 },
  { label: "5:30 PM", value: 17.5 },
  { label: "5:45 PM", value: 17.75 },
  { label: "6:00 PM", value: 18 },
  { label: "6:15 PM", value: 18.25 },
  { label: "6:30 PM", value: 18.5 },
  { label: "6:45 PM", value: 18.75 },
  { label: "7:00 PM", value: 19 },
  { label: "7:15 PM", value: 19.25 },
  { label: "7:30 PM", value: 19.5 },
  { label: "7:45 PM", value: 19.75 },
  { label: "8:00 PM", value: 20 },
  { label: "8:15 PM", value: 20.25 },
  { label: "8:30 PM", value: 20.5 },
  { label: "8:45 PM", value: 20.75 },
  { label: "9:00 PM", value: 21 },
  { label: "9:15 PM", value: 21.25 },
  { label: "9:30 PM", value: 21.5 },
  { label: "9:45 PM", value: 21.75 },
  { label: "10:00 PM", value: 22 },
  { label: "10:15 PM", value: 22.25 },
  { label: "10:30 PM", value: 22.5 },
  { label: "10:45 PM", value: 22.75 },
  { label: "11:00 PM", value: 23 },
  { label: "11:15 PM", value: 23.25 },
  { label: "11:30 PM", value: 23.5 },
  { label: "11:45 PM", value: 23.75 },
];

export const boardManageOptions = [
  { label: "List Items", value: "LIST ITEMS" },
  { label: "Contacts", value: "CONTACTS" },
  { label: "Budget", value: "BUDGET" },
  { label: "Sales Pipeline", value: "SALES PIPELINE" },
  { label: "Employees", value: "EMPLOYEES" },
  { label: "Creatives", value: "CREATIVES" },
  { label: "Campaigns", value: "CAMPAIGNS" },
  { label: "Clients", value: "CLIENTS" },
  { label: "Leads", value: "LEADS" },
];
export const PDF_EXTENSION = ["pdf"];
export const GIF_EXTENSION = ["gif"];
export const SVG_EXTENSION = ["svg", "svgz"];
export const OTHER_IMG_EXTENSION = [
  "webp",
  "ico",
  "tif",
  "tiff",
  "psd",
  "raw",
  "bmp",
];
export const PNG_EXTENSION = ["png", "apng"];
export const JPEG_EXTENSION = ["jpg", "jpeg", "jpe", "jif", "jfif", "jfi"];
export const VIDEO_EXTENSION = [
  "mov",
  "mp4",
  "m4v",
  "3gp",
  "3g2",
  "mj2",
  "mkv",
  "webm",
  "wmv",
  "avi",
  "avchd",
  "flv",
  "f4v",
  "f4p",
  "f4a",
  "f4b",
];
export const AUDIO_EXTENSION = [
  "mp3",
  "wav",
  "ogg",
  "flac",
  "aac",
  "wma",
  "m4a",
  "aiff",
  "alac",
  "amr",
  "mid",
  "midi",
];
export const TXT_EXTENSION = ["txt", "rtf"];
export const MS_WORD_EXTENSION = [
  "doc",
  "dot",
  "wbk",
  "docx",
  "docm",
  "dotx",
  "dotm",
  "docb",
  "odt",
];
export const PPT_EXTENSION = [
  "ppt",
  "pot",
  "pps",
  "pptx",
  "pptm",
  "potx",
  "potm",
  "ppam",
  "ppsx",
  "ppsm",
  "sldx",
  "sldm",
  "ods",
];
export const EXCEL_EXTENSION = [
  "xls",
  "xlt",
  "xlm",
  "xlsx",
  "xlsm",
  "xltx",
  "xltm",
  "xlsb",
  "xla",
  "xlam",
  "xll",
  "xlw",
  "ods",
  "csv",
];
export const ARCHIVE_EXTENSION = [
  "zip",
  "rar",
  "tar",
  "gzip",
  "gz",
  "7z",
  "xz",
  "bz2",
  "bzip2",
  "iso",
  "dmg",
  "pkg",
  "deb",
  "rpm",
  "z",
  "taz",
  "cpio",
  "lzma",
  "lz",
  "rz",
  "sfark",
  "xz",
  "z",
  "s7z",
];

export const CONVERTED_TO_PDF_EXTENSION = [
  "pdf",
  "doc",
  "docx",
  "ppt",
  "pptx",
  "xls",
  "xlsx",
  "csv",
  "txt",
  "rtf",
  "html",
  "htm",
  "odt",
  "ods",
  "odp",
  "md",
];
export const IMAGE_EXTENSION = [
  GIF_EXTENSION,
  OTHER_IMG_EXTENSION,
  SVG_EXTENSION,
  PNG_EXTENSION,
  JPEG_EXTENSION,
].flat();

export const FILE_PROOFING_EXTENSIONS = [IMAGE_EXTENSION, PDF_EXTENSION].flat();
export const NEW_TAB_EXTENSIONS = [
  IMAGE_EXTENSION,
  AUDIO_EXTENSION,
  VIDEO_EXTENSION,
  PDF_EXTENSION,
].flat();
