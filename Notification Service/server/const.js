import axios from "axios";

  export const sendSMSToProvider1 = async(payload) =>{
    try {
      console.log(payload);
      const response = await axios.post("http://localhost:8071/api/sms/provider1", payload);
      console.log(`SMS sent successfully via PROVIDER 1`);

    } catch (error) {
      console.error(`Failed to send SMS via PROVIDER 1`, error.message);
    }
  }
  export const sendSMSToProvider2 = async(payload) =>{
    try {
      console.log(payload);
      const response = await axios.post("http://localhost:8072/api/sms/provider2", payload);
      console.log(`SMS sent successfully via PROVIDER 2`);

    } catch (error) {
      console.error(`Failed to send SMS via PROVIDER 2`, error.message);
    }
  }  
  export const sendSMSToProvider3 = async(payload) =>{
    try {
      console.log(payload);
      const response = await axios.post("http://localhost:8073/api/sms/provider3", payload);
      console.log(`SMS sent successfully via PROVIDER 3`);

    } catch (error) {
      console.error(`Failed to send SMS via PROVIDER 3`, error.message);
    }
  }  
  export const sendEmailToProvider1 = async(payload) =>{
    try {
      console.log(payload);
      const response = await axios.post("http://localhost:8091/api/email/provider1", payload);
      console.log(`Email sent successfully via PROVIDER 1`);

    } catch (error) {
      console.error(`Failed to send email via PROVIDER 1`, error.message);
    }
  }  
  export const sendEmailToProvider2 = async(payload) =>{
    try {
      console.log(payload);
      const response = await axios.post("http://localhost:8092/api/email/provider2", payload);
      console.log(`Email sent successfully via PROVIDER 2`);

    } catch (error) {
      console.error(`Failed to send email via PROVIDER 2`, error.message);
    }
  }  
  export const sendEmailToProvider3 = async(payload) =>{
    try {
      console.log(payload);
      const response = await axios.post("http://localhost:8073/api/sms/provider3", payload);
      console.log(`Email sent successfully via PROVIDER 3`);

    } catch (error) {
      console.error(`Failed to send email via PROVIDER 3`, error.message);
    }
  }
