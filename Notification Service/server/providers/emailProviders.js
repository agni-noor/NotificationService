import axios from "axios";

// Define the provider functions
const provider1 = async (payload) => {
  try {
    console.log(payload);
    const response = await axios.post("http://localhost:8091/api/email/provider1", payload);
    console.log("Email sent successfully via PROVIDER 1");
  } catch (error) {
    console.error("Failed to send email via PROVIDER 1", error.message);
  }
};


//Don't catch error here
const provider2 = async (payload) => {
  try {
    console.log(payload);
    const response = await axios.post("http://localhost:8092/api/email/provider2", payload);
    console.log("Email sent successfully via PROVIDER 2");
  } catch (error) {
    console.error("Failed to send email via PROVIDER 2", error.message);
  }
};

const provider3 = async (payload) => {
  try {
    console.log(payload);
    const response = await axios.post("http://localhost:8093/api/email/provider3", payload);
    console.log("Email sent successfully via PROVIDER 3");
  } catch (error) {
    console.error("Failed to send email via PROVIDER 3", error.message);
  }
};

export const emailProviders = [provider1, provider2, provider3];