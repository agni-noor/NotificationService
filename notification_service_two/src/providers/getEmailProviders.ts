export type EmailProvider = {
    id: number;
    provider_type: string;
    provider_name: string;
    provider_key:string;
    priority: number;
  };
  
  export async function getEmailProviderPriorities(): Promise<EmailProvider[]> {
    return [
      {
        id: 1,
        provider_type: "email",
        provider_name: "provider1",
        provider_key:"provider1",
        priority: 2,
      },
      {
        id: 2,
        provider_type: "email",
        provider_name: "provider2",
        provider_key:"provider2",
        priority: 1,
      },
      {
        id: 3,
        provider_type: "email",
        provider_name: "provider3",
        provider_key:"provider3",
        priority: 3,
      },
    ];
  }
  