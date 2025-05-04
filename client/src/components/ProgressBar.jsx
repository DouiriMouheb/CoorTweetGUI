// components/ProgressBar.js
import { motion } from "framer-motion";

export const ProgressBar = ({ currentStep, totalSteps }) => {
  const progressPercentage = (currentStep / totalSteps) * 100;

  return (
    <motion.div
      className="w-full mx-auto max-w-3xl"
      initial={{ scaleX: 0 }}
      animate={{ scaleX: 1 }}
    >
      <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-[#00926c]"
          initial={{ width: 0 }}
          animate={{ width: `${progressPercentage}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
    </motion.div>
  );
};
