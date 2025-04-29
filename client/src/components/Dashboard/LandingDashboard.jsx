import { useState, useCallback, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/authContext";
import { useLogout } from "../../hooks/useLogout";
import { useToast } from "../Toast.jsx";
import MultiStepForm from "../MultiStepForm";
import ConfirmationModal from "../ConfirmationModal.jsx";
import Header from "./Header";
import StatsCards from "./StatsCards";
import NetworksTable from "./NetworksTable";
import { useNetworks } from "../../hooks/useNetworks";
import { useSearchAndPagination } from "../../hooks/useSearchAndPagination.js";
import DuplicateModal from "../DuplicateModal.jsx";

const LandingDashboard = () => {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { logout } = useLogout();

  const [isExpanded, setIsExpanded] = useState(true);
  const [showDashboard, setShowDashboard] = useState(true);
  const [activeComponent, setActiveComponent] = useState(null);

  const {
    networks,
    loading,
    initialLoading,
    error,
    fetchNetworks,
    deleteNetwork,
    loadingDelete,
    hasNetworks,
  } = useNetworks(user?.userId);

  const {
    searchTerm,
    setSearchTerm,
    currentPage,
    setCurrentPage,
    currentItems,
    totalPages,
    nextPage,
    prevPage,
    filteredItems,
  } = useSearchAndPagination(networks, 4);

  // Effect to log when networks change
  useEffect(() => {}, [networks]);

  const [deleteConfirmation, setDeleteConfirmation] = useState({
    isOpen: false,
    projectId: null,
    projectName: "",
  });

  const [duplicateConfirmation, setDuplicateConfirmation] = useState({
    isOpen: false,
    projectId: null,
    projectName: "",
    projectData: null,
    dataSetName: null,
  });

  const toggleExpand = () => setIsExpanded(!isExpanded);

  const handleCreateProject = () => {
    setShowDashboard(false);
    setActiveComponent(
      <MultiStepForm
        onClose={() => {
          setShowDashboard(true);
          fetchNetworks(true);
        }}
      />
    );
  };

  const openDeleteDialog = (id, name) => {
    setDeleteConfirmation({
      isOpen: true,
      projectId: id,
      projectName: name,
    });
  };

  const closeDeleteDialog = () => {
    setDeleteConfirmation({
      isOpen: false,
      projectId: null,
      projectName: "",
    });
  };

  const openDuplicateDialog = (id, name, dataSetName) => {
    // Create the project data with default parameters
    const projectData = {
      projectName: name || "New Analysis",
      minParticipation: 2,
      timeWindow: 60,
      edgeWeight: 0.5,
    };

    // Open the duplicate confirmation dialog with the project data and dataset name
    setDuplicateConfirmation({
      isOpen: true,
      projectId: id,
      projectName: name,
      projectData: projectData,
      dataSetName: dataSetName,
    });
  };

  const closeDuplicateDialog = () => {
    setDuplicateConfirmation({
      isOpen: false,
      projectId: null,
      projectName: "",
      projectData: null,
      dataSetName: null,
    });
  };

  const handleDeleteNetwork = async () => {
    const { projectId } = deleteConfirmation;

    if (!projectId) {
      showToast("error", "Invalid project selected");
      closeDeleteDialog();
      return;
    }

    try {
      const result = await deleteNetwork(projectId);
      if (result) showToast("success", "Project deleted successfully!");
    } catch {
      showToast("error", "Failed to delete project. Please try again.");
    } finally {
      closeDeleteDialog();
    }
  };

  const handleDuplicateNetwork = async (formData) => {
    const { projectId } = duplicateConfirmation;

    if (!projectId && !formData.dataSetName) {
      showToast("error", "Invalid project or dataset selected");
      closeDuplicateDialog();
      return;
    }

    // Here you would typically start the duplication process
    // For now we're just closing the dialog as the actual processing happens in DuplicateModal
    closeDuplicateDialog();

    // You might want to show a toast or redirect the user
    showToast("success", "Analysis started successfully!");
  };

  const handleViewNetwork = useCallback(
    (networkId, networkName) => {
      if (!networkId) {
        showToast("error", "Invalid network selected");
        return;
      }

      navigate(`/network/${networkId}`, {
        state: { networkName },
      });
    },
    [navigate, showToast]
  );

  return (
    <div className="w-full h-[100vh] mx-auto p-4 flex flex-col bg-gray-100 overflow-auto space-y-6">
      <Header
        user={user}
        isExpanded={isExpanded}
        toggleExpand={toggleExpand}
        logout={logout}
        setShowDashboard={setShowDashboard}
        setActiveComponent={setActiveComponent}
      />

      {showDashboard ? (
        <div className="max-w-7xl mx-auto w-full space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatsCards
              userId={user.userId}
              networks={networks}
              loading={loading}
              initialLoading={initialLoading}
              onCreateProject={handleCreateProject}
              onDuplicate={openDuplicateDialog}
            />

            <NetworksTable
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              fetchNetworks={fetchNetworks}
              loading={loading}
              initialLoading={initialLoading}
              error={error}
              currentItems={currentItems}
              filteredItems={filteredItems}
              currentPage={currentPage}
              totalPages={totalPages}
              nextPage={nextPage}
              prevPage={prevPage}
              handleViewNetwork={handleViewNetwork}
              openDeleteDialog={openDeleteDialog}
              openDuplicateDialog={openDuplicateDialog}
              onCreateProject={handleCreateProject}
            />
          </div>
        </div>
      ) : (
        activeComponent
      )}

      <ConfirmationModal
        isOpen={deleteConfirmation.isOpen}
        onClose={closeDeleteDialog}
        onConfirm={handleDeleteNetwork}
        title="Delete Project"
        message={`Are you sure you want to delete "${deleteConfirmation.projectName}"?`}
        confirmText="Delete"
        confirmColor="red"
        disabled={loadingDelete}
      >
        <p className="mt-2 text-sm text-red-600">
          This action cannot be undone. All associated data will be permanently
          removed.
        </p>
      </ConfirmationModal>

      <DuplicateModal
        isOpen={duplicateConfirmation.isOpen}
        onClose={closeDuplicateDialog}
        onConfirm={handleDuplicateNetwork}
        dataSetName={duplicateConfirmation.dataSetName}
        projectData={duplicateConfirmation.projectData}
        title="Start new analysis"
        confirmText="Analyze"
        confirmColor="green"
        disabled={loading}
      />
    </div>
  );
};

export default LandingDashboard;
