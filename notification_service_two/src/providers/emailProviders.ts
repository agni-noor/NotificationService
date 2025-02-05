import axios from 'axios';

type EmailPayload = {
  subject: string;
  body: string;
  recipients: string[];
};

export const emailProviders = [
  {
    provider_key: "provider1",
    provider_address: 'http://localhost:8091/api/email/provider1',
    sendEmail: async function (payload: EmailPayload): Promise<void> {
      await axios.post(this.provider_address, payload);

    }
  },
  {
    provider_key: "provider2",
    provider_address: 'http://localhost:8092/api/email/provider2',
    sendEmail: async function (payload: EmailPayload): Promise<void> {
      await axios.post(this.provider_address, payload);
    }
  },
  {
    provider_key: "provider3",
    provider_address: 'http://localhost:8093/api/email/provider3',
    sendEmail: async function (payload: EmailPayload): Promise<void> {
      await axios.post(this.provider_address, payload);

    }
  }
];
