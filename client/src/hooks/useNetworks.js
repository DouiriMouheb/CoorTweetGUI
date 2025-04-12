import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import axios from "axios";
import { useToast } from "../components/Toast.jsx";

export const useNetworks = (userId) => {
  const [networks, setNetworks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [error, setError] = useState(null);
  const [lastFetched, setLastFetched] = useState(null);
  const { showToast } = useToast();
  const CACHE_TIMEOUT = 15 * 60 * 1000;
  const isMounted = useRef(true);
  const fetchInProgress = useRef(false);

  // Set isMounted flag on mount/unmount
  useEffect(() => {
    isMounted.current = true;

    return () => {
      isMounted.current = false;
    };
  }, []);

  const api = useMemo(() => {
    const instance = axios.create({
      baseURL: "http://localhost:5000/api",
      timeout: 30000,
      headers: { "Content-Type": "application/json" },
    });

    instance.interceptors.response.use(
      (response) => response,
      (error) => {
        if (!error.response) {
          showToast("error", "Network connection error.");
        } else if (error.response?.status >= 500) {
          showToast("error", "Server error occurred.");
        } else {
          showToast(
            "error",
            error.response?.data?.message || "Unexpected error."
          );
        }
        return Promise.reject(error);
      }
    );

    return instance;
  }, [showToast]);

  const fetchNetworks = useCallback(
    async (force = false) => {
      // Check if fetch is already in progress to prevent multiple simultaneous calls
      if (fetchInProgress.current) {
        return networks;
      }

      // Use cached data if appropriate
      if (
        !force &&
        lastFetched &&
        Date.now() - lastFetched < CACHE_TIMEOUT &&
        networks.length > 0
      ) {
        return networks;
      }

      // Handle missing userId
      if (!userId) {
        if (isMounted.current) {
          setInitialLoading(false);
          setLoading(false);
          setNetworks([]);
          setError(null);
        }
        return [];
      }

      // Set fetch in progress flag
      fetchInProgress.current = true;

      // Set loading state
      if (isMounted.current) {
        if (initialLoading) {
          // Keep initialLoading true
        } else {
          setLoading(true);
        }
      }

      try {
        const response = await axios.post(
          "http://localhost:5000/api/network/get-networks-names",
          {
            userId,
          }
        );

        const fetched = Array.isArray(response.data) ? response.data : [];

        // Check if component is still mounted
        if (!isMounted.current) {
          fetchInProgress.current = false;
          return fetched;
        }

        // Update states

        setNetworks(fetched);
        setLastFetched(Date.now());
        setError(null);
        setLoading(false);
        setInitialLoading(false);

        fetchInProgress.current = false;
        return fetched;
      } catch (err) {
        console.error("Error fetching networks:", err.message);

        if (isMounted.current) {
          setError("Failed to load networks.");
          setLoading(false);
          setInitialLoading(false);
        }

        // Clear fetch in progress flag
        fetchInProgress.current = false;
        return [];
      }
    },
    [userId, lastFetched, networks]
  );

  const deleteNetwork = useCallback(
    async (networkID) => {
      if (!networkID) {
        showToast("error", "Invalid network ID");
        return false;
      }

      setLoadingDelete(true);
      const prevNetworks = [...networks];

      try {
        setNetworks((prev) => prev.filter((n) => n.id !== networkID));
        await api.post("/network/delete-network", { networkID });
        showToast("success", "Project deleted successfully!");
        return true;
      } catch (err) {
        setNetworks(prevNetworks);
        showToast("error", "Failed to delete project.");
        return false;
      } finally {
        if (isMounted.current) setLoadingDelete(false);
      }
    },
    [api, networks, showToast]
  );

  // Effect to fetch networks on initial mount - ONCE ONLY
  useEffect(() => {
    if (!userId || !isMounted.current) return;

    // Only fetch if we don't already have networks
    if (networks.length === 0) {
      fetchNetworks(true).catch((err) => {
        console.error("Error in initial fetch:", err.message);
      });
    }

    // Empty dependency array means this effect runs once on mount
  }, [userId]); // Only depend on userId, not fetchNetworks

  return {
    networks,
    loading,
    initialLoading,
    error,
    fetchNetworks,
    deleteNetwork,
    loadingDelete,
    hasNetworks: networks.length > 0,
  };
};
