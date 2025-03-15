// UpdateMarksFlow.jsx
import React, { useState } from "react";
import SelectClassStep from "./SelectClassStep";
import SelectExamStep from "./SelectExamStep";
import UpdateMarksStep from "./UpdateMarksStep";

const UpdateMarksFlow = () => {
  const [step, setStep] = useState(1);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedExamId, setSelectedExamId] = useState("");

  // Step 1: After selecting a class, move to step 2
  const handleClassSelected = (className) => {
    setSelectedClass(className);
    setStep(2);
  };

  // Step 2: After selecting an exam, move to step 3
  const handleExamSelected = (examId) => {
    setSelectedExamId(examId);
    setStep(3);
  };

  return (
    <div style={{ margin: "2rem" }}>
      <h1>Update Marks Flow</h1>

      {step === 1 && (
        <SelectClassStep
          onClassSelected={handleClassSelected}
        />
      )}
      {step === 2 && (
        <SelectExamStep
          className={selectedClass}
          onExamSelected={handleExamSelected}
        />
      )}
      {step === 3 && (
        <UpdateMarksStep
          className={selectedClass}
          examId={selectedExamId}
        />
      )}
    </div>
  );
};

export default UpdateMarksFlow;
