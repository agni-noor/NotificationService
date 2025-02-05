export async function getSMSProviderPriorities() {
    // return await ProviderPriority.getAll()
  return [
    {
      id: 1,
      provider_type: "sms",
      provider_name: "provider1",
      provider_address: "http://localhost:8071/api/sms/provider1",
      priority: 2,
    },
    {
      id: 2,
      provider_type: "sms",
      provider_name: "provider2",

      provider_address: "http://localhost:8072/api/sms/provider2",
      priority: 1,
    },
    {
      id: 3,
      provider_type: "sms",
      provider_name: "provider3",
      provider_address: "http://localhost:8073/api/sms/provider3",
      priority: 3,
    },
  ];
}