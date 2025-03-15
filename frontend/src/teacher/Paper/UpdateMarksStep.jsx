// UpdateMarksStep.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";

const UpdateMarksStep = ({ className, examId }) => {
  const [students, setStudents] = useState([]);
  const [marks, setMarks] = useState([]);

  // Fetch students for the chosen class
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await axios.get(`/api/students/${className}`);
        const fetchedStudents = res.data.data;
        setStudents(fetchedStudents);

        // Initialize marks array with each student's ID
        const initialMarks = fetchedStudents.map((student) => ({
          student: student._id,
          marksObtained: "",
        }));
        setMarks(initialMarks);
      } catch (error) {
        console.error("Error fetching students:", error);
      }
    };
    if (className) {
      fetchStudents();
    }
  }, [className]);

  // Update the marks array whenever the user inputs a mark
  const handleMarksChange = (index, value) => {
    const updatedMarks = [...marks];
    updatedMarks[index].marksObtained = value;
    setMarks(updatedMarks);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Send PATCH request to update exam marks
      await axios.patch(`/api/papers/${examId}/results`, {
        results: marks,
      });
      alert("Marks updated successfully!");
    } catch (error) {
      console.error("Error updating marks:", error);
      alert(error.response?.data?.message || "Error updating marks");
    }
  };

  return (
    <div style={{ marginTop: "1rem" }}>
      <h2>Update Marks</h2>
      <form onSubmit={handleSubmit}>
        {students.map((student, index) => (
          <div key={student._id} style={{ marginBottom: "1rem" }}>
            <label>
              {student.name}:
              <input
                type="number"
                value={marks[index]?.marksObtained || ""}
                onChange={(e) => handleMarksChange(index, e.target.value)}
                style={{ marginLeft: "0.5rem" }}
                required
              />
            </label>
          </div>
        ))}
        <button type="submit">Submit Marks</button>
      </form>
    </div>
  );
};

export default UpdateMarksStep;
