// SelectClassStep.jsx
import React, { useState } from "react";

const SelectClassStep = ({ onClassSelected }) => {
  const [className, setClassName] = useState("");

  // For demo, you can hardcode a few classes or fetch from an API
  const classes = ["10", "9", "8", "7"];

  const handleSelect = () => {
    if (className) {
      onClassSelected(className);
    }
  };

  return (
    <div style={{ marginTop: "1rem" }}>
      <h2>Select Class</h2>
      <select
        value={className}
        onChange={(e) => setClassName(e.target.value)}
      >
        <option value="">-- Select a Class --</option>
        {classes.map((cls) => (
          <option key={cls} value={cls}>
            {cls}
          </option>
        ))}
      </select>
      <button onClick={handleSelect} style={{ marginLeft: "1rem" }}>
        Next
      </button>
    </div>
  );
};

export default SelectClassStep;
