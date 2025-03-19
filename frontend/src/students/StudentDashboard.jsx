import React, { useEffect, useState } from "react";
import axiosInstance from "../services/api"; // your axios setup
import { toast } from "react-toastify";

const StudentResults = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllResults = async () => {
      try {
        setLoading(true);
        // GET /exam/student/all-results
        const response = await axiosInstance.get("/exam/student/all-results");
        setResults(response.data.data); // an array of exam objects
      } catch (error) {
        console.error("Error fetching all student results:", error);
        toast.error("Could not fetch exam results");
      } finally {
        setLoading(false);
      }
    };

    fetchAllResults();
  }, []);

  if (loading) {
    return <div>Loading your exam results...</div>;
  }

  if (!results || results.length === 0) {
    return <div>No exam results found.</div>;
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">All Exam Results</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-3 px-4 text-left">Exam Name</th>
              <th className="py-3 px-4 text-left">Date of Exam</th>
              <th className="py-3 px-4 text-left">Topic</th>
              <th className="py-3 px-4 text-left">Sub-Topic</th>
              <th className="py-3 px-4 text-left">Total Marks</th>
              <th className="py-3 px-4 text-left">Marks Obtained</th>
              <th className="py-3 px-4 text-left">Remarks</th>
            </tr>
          </thead>
          <tbody>
            {results.map((paper) => (
              <tr key={paper.paperId} className="border-b hover:bg-gray-50">
                <td className="py-2 px-4">{paper.examName}</td>
                <td className="py-2 px-4">
                  {new Date(paper.dateOfExam).toLocaleDateString()}
                </td>
                <td className="py-2 px-4">{paper.topic}</td>
                <td className="py-2 px-4">{paper.subTopic}</td>
                <td className="py-2 px-4">{paper.totalMarks}</td>
                <td className="py-2 px-4">
                  {paper.marksObtained !== null ? paper.marksObtained : "N/A"}
                </td>
                <td className="py-2 px-4">{paper.remarks || ""}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StudentResults;
