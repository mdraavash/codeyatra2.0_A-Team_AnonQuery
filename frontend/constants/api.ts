import { Platform } from "react-native";

// Your machine's local network IP — update if it changes
const LAN_IP = "10.5.5.206";

const getBaseUrl = () => {
  // Web can use localhost; physical devices need the LAN IP
  if (Platform.OS === "web") {
    return "http://localhost:8000";
  }
  return `http://${LAN_IP}:8000`;
};

export const API_BASE_URL = getBaseUrl();

export const API = {
  LOGIN: `${API_BASE_URL}/auth/login`,
  REGISTER: `${API_BASE_URL}/auth/register`,
  ME: `${API_BASE_URL}/auth/me`,
};
