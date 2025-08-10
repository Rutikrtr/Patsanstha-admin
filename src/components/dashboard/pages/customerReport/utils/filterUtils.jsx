export const filterCollectionsByCustomer = (patsansthaData, searchTerm) => {
  if (!patsansthaData?.agents) return [];

  const collections = [];
  patsansthaData.agents.forEach(agent => {
    agent.dailyCollections?.forEach(collection => {
      // Filter transactions based on search term
      let filteredTransactions = collection.transactions || [];
      
      if (searchTerm.trim()) {
        filteredTransactions = collection.transactions?.filter(transaction =>
          transaction.name?.toLowerCase().includes(searchTerm.toLowerCase())
        ) || [];
      }

      // Only include collection if it has matching transactions or no search term
      if (!searchTerm.trim() || filteredTransactions.length > 0) {
        collections.push({
          ...collection,
          agentName: agent.agentname,
          agentNo: agent.agentno,
          transactions: filteredTransactions
        });
      }
    });
  });

  // Sort by date (newest first)
  return collections.sort((a, b) => new Date(b.date) - new Date(a.date));
};