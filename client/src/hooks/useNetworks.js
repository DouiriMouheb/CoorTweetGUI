import { useState, useEffect, useCallback } from "react";
import api from "../services/api";
import { useToast } from "../components/Toast";

/**
 * Hook for managing network data operations
 */
export const useNetworks = (userId) => {
  const [networks, setNetworks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const { showToast } = useToast();

  // Fetch networks when userId changes or on manual refresh
  const fetchNetworks = useCallback(
    async (showLoadingState = false) => {
      if (!userId) return;

      try {
        if (showLoadingState) setLoading(true);

        const response = await api.post("/api/network/get-networks-names", {
          userId,
        });
        setNetworks(response.data || []);
        setError(null);
      } catch (err) {
        console.error("Error fetching networks:", err);
        setError("Failed to load networks");
        showToast("error", "Failed to load networks");
      } finally {
        setLoading(false);
        setInitialLoading(false);
      }
    },
    [userId, showToast]
  );

  // Initial fetch on mount
  useEffect(() => {
    if (userId) {
      fetchNetworks();
    }
  }, [userId, fetchNetworks]);

  // Delete network function
  const deleteNetwork = async (networkId) => {
    if (!networkId) {
      showToast("error", "No network selected for deletion");
      return false;
    }

    try {
      setLoadingDelete(true);

      // Use correct parameter name - make sure this matches what your API expects
      await api.post("/api/network/delete-network", { networkId });

      // After successful deletion, refresh the networks list
      await fetchNetworks();
      return true;
    } catch (err) {
      console.error("Error deleting network:", err);
      showToast("error", err.response?.data?.error || "Error deleting network");
      return false;
    } finally {
      setLoadingDelete(false);
    }
  };

  // Check if user has any networks
  const hasNetworks = networks.length > 0;

  return {
    networks,
    loading,
    initialLoading,
    error,
    fetchNetworks,
    deleteNetwork,
    loadingDelete,
    hasNetworks,
  };
};
