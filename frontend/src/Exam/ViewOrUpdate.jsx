import React, { useEffect, useState } from "react";
import axiosInstance from "../services/api";

function ViewOrUpdatePaper({ paperId }) {
  const [paper, setPaper] = useState(null);

  useEffect(() => {
    if (paperId) {
      axiosInstance
        .get(`/exam/${paperId}`)
        .then((response) => {
          setPaper(response.data.data);
        })
        .catch((error) => {
          console.error("Error fetching paper:", error);
        });
    }
  }, [paperId]);

  if (!paper) {
    return <div>Loading paper details...</div>;
  }

  return (
    <div>
      <h2>Exam: {paper.examName}</h2>
      <p>Topic: {paper.topic}</p>
      <p>Sub-Topic: {paper.subTopic}</p>
      <p>Total Marks: {paper.totalMarks}</p>

      <h3>Assigned Students:</h3>
      <ul>
        {paper.results.map((res) => (
          <li key={res.student._id}>
            {res.student.name} (ID: {res.student._id}) 
            - Current Marks: {res.marksObtained ?? "Not Set"}
          </li>
        ))}
      </ul>
      {/* Possibly add your "Update Marks" form here */}
    </div>
  );
}

export default ViewOrUpdatePaper;
