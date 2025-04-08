import React, { useState } from "react";
import UploadDataset from "./UploadDataset";
import PrepareDataset from "./PrepareDataset";
import ConfigureParameters from "./ConfigureParametersForm";
import ResultsComponent from "./ResultsComponent";
import PlatformSelectorStep from "../components/PlatformSelector/PlatformSelectorStep";
import PlatformSelector2 from "../components/PlatformSelector/index";
import NetworkVisualization from "./NetworkVisualization";
import UploadDatasetStep from ".//UploadDatasetStep";
import ConfigureParametersFormStep from "./ConfigureParametersFormStep" ; 
import NetworkScreen from "./NetworkScreen";
const MultiStepForm = ({ onClose }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    csvFile: null,
    parameters: {},
  });

  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);

  // Handle cancellation and return to dashboard
  const handleCancel = () => {
    onClose();
  };

  return (
    <>
      {step === 1 && (
        <UploadDatasetStep
          nextStep={nextStep}
          formData={formData}
          setFormData={setFormData}
          onCancel={handleCancel}
        />
      )}
      {step === 2 && (
        <PlatformSelectorStep
          nextStep={nextStep}
          prevStep={prevStep}
          formData={formData}
          setFormData={setFormData}
        />
      )}

      {/*step === 2 && (
        <PrepareDataset
          nextStep={nextStep}
          prevStep={prevStep}
          formData={formData}
          setFormData={setFormData}
        />
      )*/}
      {step === 3 && (
        <ConfigureParametersFormStep
          nextStep={nextStep}
          prevStep={prevStep}
          formData={formData}
          setFormData={setFormData}
        />
      )}
      {step === 4 && <NetworkScreen />}
      {/*  {step === 4 && (
        <ResultsComponent
          nextStep={nextStep}
          prevStep={prevStep}
          formData={formData}
        />
      )} */}
    </>
  );
};

export default MultiStepForm;
