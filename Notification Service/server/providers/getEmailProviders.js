export async function getEmailProviderPriorities() {

  return [
    {
      id: 1,
      provider_type: "email",
      provider_name: "provider1",
      provider_address: "http://localhost:8091/api/email/provider1",
      priority: 2,
    },
    {
      id: 2,
      provider_type: "email",
      provider_name: "provider2",

      provider_address: "http://localhost:8092/api/email/provider2",
      priority: 1,
    },
    {
      id: 3,
      provider_type: "email",
      provider_name: "provider3",
      provider_address: "http://localhost:8093/api/email/provider3",
      priority: 3,
    },
  ];
}