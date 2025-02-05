import axios from "axios";

// Define the provider functions
const provider1 = async (payload) => {
  try {
    console.log(payload);
    const response = await axios.post("http://localhost:8071/api/sms/provider1", payload);
    console.log("SMS sent successfully via PROVIDER 1");
  } catch (error) {
    console.error("Failed to send SMS via PROVIDER 1", error.message);
  }
};

const provider2 = async (payload) => {
  try {
    console.log(payload);
    const response = await axios.post("http://localhost:8072/api/sms/provider2", payload);
    console.log("SMS sent successfully via PROVIDER 2");
  } catch (error) {
    console.error("Failed to send SMS via PROVIDER 2", error.message);
  }
};

const provider3 = async (payload) => {
  try {
    console.log(payload);
    const response = await axios.post("http://localhost:8073/api/sms/provider3", payload);
    console.log("SMS sent successfully via PROVIDER 3");
  } catch (error) {
    console.error("Failed to send SMS via PROVIDER 3", error.message);
  }
};

// Create an array of provider functions
export const smsProviders = [provider1, provider2, provider3];