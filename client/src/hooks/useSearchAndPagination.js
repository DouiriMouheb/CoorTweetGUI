import { useState, useEffect, useMemo, useCallback } from "react";

export const useSearchAndPagination = (items, itemsPerPage = 5) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);

  // Reset to page 1 when items array changes
  useEffect(() => {
    setCurrentPage(1);
  }, [items]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const filteredItems = useMemo(() => {
    if (!items || !items.length) {
      return [];
    }

    const filtered = items.filter((item) => {
      if (!item) {
        return false;
      }

      if (item.name) {
        const matches = item.name
          .toLowerCase()
          .includes(debouncedSearchTerm.toLowerCase());
        return matches;
      } else if (typeof item === "string") {
        const matches = item
          .toLowerCase()
          .includes(debouncedSearchTerm.toLowerCase());
        return matches;
      }
      return false;
    });

    return filtered;
  }, [items, debouncedSearchTerm]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredItems.length / itemsPerPage)
  );

  const currentItems = useMemo(() => {
    if (filteredItems.length === 0) {
      return [];
    }

    // Ensure current page is within bounds
    const validPage = Math.min(currentPage, totalPages);
    if (validPage !== currentPage) {
      setCurrentPage(validPage);
    }

    const start = (validPage - 1) * itemsPerPage;
    const paginatedItems = filteredItems.slice(start, start + itemsPerPage);
    return paginatedItems;
  }, [filteredItems, currentPage, totalPages, itemsPerPage]);

  const nextPage = useCallback(() => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  }, [currentPage, totalPages]);

  const prevPage = useCallback(() => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  }, [currentPage]);

  const resetPagination = useCallback(() => setCurrentPage(1), []);

  return {
    searchTerm,
    setSearchTerm,
    currentPage,
    setCurrentPage,
    currentItems,
    totalPages,
    nextPage,
    prevPage,
    resetPagination,
    filteredItems,
  };
};
