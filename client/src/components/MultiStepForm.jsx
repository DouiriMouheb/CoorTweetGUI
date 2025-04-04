import React, { useState } from "react";
import UploadDataset from "./UploadDataset";
import PrepareDataset from "./PrepareDataset";
import ConfigureParameters from "./ConfigureParametersForm";
import ResultsComponent from "./ResultsComponent";
import PlatformSelector from "./PlatformSelector";

const MultiStepForm = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    csvFile: null,
    parameters: {},
  });

  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);

  return (
    <div className="w-[90%] h-[95vh] mx-auto p-4 flex flex-col justify-between bg-gray-100 rounded-lg shadow-md">
      {step === 1 && (
        <UploadDataset
          nextStep={nextStep}
          formData={formData}
          setFormData={setFormData}
        />
      )}
      {step === 2 && (
        <PlatformSelector
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
        <ConfigureParameters
          nextStep={nextStep}
          prevStep={prevStep}
          formData={formData}
          setFormData={setFormData}
        />
      )}
      {step === 4 && (
        <ResultsComponent
          nextStep={nextStep}
          prevStep={prevStep}
          formData={formData}
        />
      )}
    </div>
  );
};

export default MultiStepForm;
