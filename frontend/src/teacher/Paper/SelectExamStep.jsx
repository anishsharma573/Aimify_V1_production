// SelectExamStep.jsx
import React, { useEffect, useState } from "react";
import axiosInstance from "../../services/api";


const SelectExamStep = ({ className, onExamSelected }) => {
  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState("");

  useEffect(() => {
    // Fetch exams for the given class
    const fetchExams = async () => {
      try {
        const res = await axiosInstance.get(`/exam/exams/${className}`);
        setExams(res.data.data); // assuming data.exams or data.data holds the array
      } catch (error) {
        console.error("Error fetching exams:", error);
      }
    };
    if (className) {
      fetchExams();
    }
  }, [className]);

  const handleSelect = () => {
    if (selectedExam) {
      onExamSelected(selectedExam);
    }
  };

  return (
    <div style={{ marginTop: "1rem" }}>
      <h2>Select Exam</h2>
      <select
        value={selectedExam}
        onChange={(e) => setSelectedExam(e.target.value)}
      >
        <option value="">-- Select an Exam --</option>
        {exams.map((exam) => (
          <option key={exam._id} value={exam._id}>
            {exam.examName} - {exam.subject}
          </option>
        ))}
      </select>
      <button onClick={handleSelect} style={{ marginLeft: "1rem" }}>
        Next
      </button>
    </div>
  );
};

export default SelectExamStep;
