import axios from "axios";

let authToken = "";

export const setToken = (token) => {
  authToken = token;
};

export const Log = async (
  stack,
  level,
  packageName,
  message
) => {
  try {
    await axios.post(
      "http://20.244.186.213/evaluation-service/logs",
      {
        stack,
        level,
        package: packageName,
        message
      },
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json"
        }
      }
    );
  } catch (error) {
    // Logging failures should never break the application
  }
};