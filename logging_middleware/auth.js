import axios from "axios";
import { setToken } from "./logger.js";

export const initializeLogger = async () => {
  try {
    const response = await axios.post(
      "http://20.244.186.213/evaluation-service/auth",
      {
        email: process.env.EMAIL,
        name: process.env.NAME,
        rollNo: process.env.ROLLNO,
        accessCode: process.env.ACCESS_CODE,
        clientID: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET
      },
      {
        headers: {
          "Content-Type": "application/json"
        }
      }
    );

    setToken(response.data.access_token);
  } catch (error) {
    throw new Error("Failed to initialize logging middleware");
  }
};

// auth .js