import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import axiosInstance from "../services/api"; // Your custom Axios instance

const classOptions = [
  ...Array.from({ length: 12 }, (_, i) => `${i + 1}`),
  "Other",
];

const UpdateMarksForm = () => {
  const [selectedClass, setSelectedClass] = useState("");
  const [customClass, setCustomClass] = useState("");
  const [examPapers, setExamPapers] = useState([]);
  const [paperDetails, setPaperDetails] = useState(null);
  // Combined state for each student's marks and remarks
  const [studentData, setStudentData] = useState({});
  const [loading, setLoading] = useState(false);

  // 1. Fetch exam papers when a class is selected
  useEffect(() => {
    const className = selectedClass === "Other" ? customClass : selectedClass;
    if (className) {
      axiosInstance
        .get(`/exam/exams/${className}`)
        .then((response) => {
          setExamPapers(response.data.data);
        })
        .catch((error) => {
          console.error("Error fetching exams:", error);
          toast.error("Error fetching exam papers");
        });
    }
  }, [selectedClass, customClass]);

  // 2. When a teacher clicks an exam, fetch its details
  const handleExamClick = (paperId) => {
    axiosInstance
      .get(`/exam/${paperId}`)
      .then((response) => {
        const paper = response.data.data;
        setPaperDetails(paper);
        // Initialize studentData from paper.results
        const initialData = {};
        paper.results.forEach((result) => {
          const studentId = result.student._id;
          initialData[studentId] = {
            marksObtained: result.marksObtained !== null ? result.marksObtained : "",
            remarks: result.remarks || "",
          };
        });
        setStudentData(initialData);
      })
      .catch((error) => {
        console.error("Error fetching paper details:", error);
        toast.error("Error fetching paper details");
      });
  };

  // 3. Update local studentData as teacher edits values
  const handleMarkChange = (studentId, value) => {
    setStudentData((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        marksObtained: value,
      },
    }));
  };

  const handleRemarksChange = (studentId, value) => {
    setStudentData((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        remarks: value,
      },
    }));
  };

  // 4. Submit updated marks and remarks
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!paperDetails) {
      toast.error("No exam selected to update marks");
      return;
    }
    setLoading(true);
    const updates = Object.keys(studentData).map((studentId) => ({
      student: studentId,
      marksObtained: studentData[studentId].marksObtained,
      remarks: studentData[studentId].remarks,
    }));
    try {
      await axiosInstance.put("/exam/update-marks", {
        paperId: paperDetails._id,
        results: updates,
      });
      toast.success("Marks updated successfully");
    } catch (error) {
      console.error("Error updating marks:", error);
      toast.error(
        error.response?.data?.message || "Error updating marks"
      );
    } finally {
      setLoading(false);
    }
  };

  // 5. Handle PDF download
  const handleDownloadPDF = () => {
    if (!paperDetails) {
      toast.error("Please select an exam paper first");
      return;
    }
    window.location.href = `${axiosInstance.defaults.baseURL}/exam/download/${paperDetails._id}`;
  };

  return (
    <div className="max-w-5xl mx-auto p-6 bg-gray-50">
      <h2 className="text-3xl font-extrabold text-center text-blue-800 mb-8">
        Update Exam Marks
      </h2>

      {/* Class Selection Section */}
      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <h3 className="text-xl font-semibold text-gray-700 mb-4">
          Select Class
        </h3>
        <div className="flex flex-col md:flex-row gap-4">
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="flex-1 p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">-- Select Class --</option>
            {classOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          {selectedClass === "Other" && (
            <input
              type="text"
              placeholder="Enter custom class"
              value={customClass}
              onChange={(e) => setCustomClass(e.target.value)}
              className="flex-1 p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          )}
        </div>
      </div>

      {/* Exam Papers Listing */}
      {examPapers.length > 0 && (
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h3 className="text-xl font-semibold text-gray-700 mb-4">
            Assigned Exam Papers
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {examPapers.map((paper) => (
              <div
                key={paper._id}
                onClick={() => handleExamClick(paper._id)}
                className={`cursor-pointer border p-4 rounded-lg transition-colors hover:bg-blue-50 ${
                  paperDetails && paper._id === paperDetails._id ? "bg-blue-100" : "bg-white"
                }`}
              >
                <h4 className="text-lg font-bold text-gray-800">
                  {paper.examName} - {paper.topic}
                </h4>
                <p className="text-gray-600">{paper.subTopic}</p>
                <p className="text-sm text-gray-500 mt-2">
                  Total Marks: {paper.totalMarks}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PDF Download Button */}
      {paperDetails && (
        <div className="mb-8 text-center">
          <button
            onClick={handleDownloadPDF}
            className="bg-green-600 text-white px-6 py-3 rounded-full hover:bg-green-700 transition-colors"
          >
            Download Exam Results as PDF
          </button>
        </div>
      )}

      {/* Exam Details & Student Marks Form */}
      {paperDetails && (
        <div className="bg-white shadow rounded-lg p-6">
          <div className="mb-6 border-b pb-4">
            <h3 className="text-xl font-bold text-gray-800">
              Exam Details
            </h3>
            <p className="text-gray-700">
              <strong>Exam Name:</strong> {paperDetails.examName}
            </p>
            <p className="text-gray-700">
              <strong>Topic:</strong> {paperDetails.topic}
            </p>
            <p className="text-gray-700">
              <strong>Sub-Topic:</strong> {paperDetails.subTopic}
            </p>
            <p className="text-gray-700">
              <strong>Total Marks:</strong> {paperDetails.totalMarks}
            </p>
          </div>

          {paperDetails.results && paperDetails.results.length > 0 ? (
            <>
              {/* Scrollable table for many students */}
              <div className="overflow-x-auto max-h-[60vh] overflow-y-auto border rounded mb-6">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                        Student Name
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                        Marks Obtained
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                        Remarks
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {paperDetails.results.map((result) => {
                      const studentId = result.student._id;
                      const studentName = result.student.name || studentId;
                      const { marksObtained, remarks } =
                        studentData[studentId] || {};
                      return (
                        <tr key={studentId} className="hover:bg-blue-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {studentName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="number"
                              value={marksObtained || ""}
                              onChange={(e) =>
                                handleMarkChange(studentId, e.target.value)
                              }
                              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="Enter marks"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="text"
                              value={remarks || ""}
                              onChange={(e) =>
                                handleRemarksChange(studentId, e.target.value)
                              }
                              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="Enter remarks"
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="text-center">
                <button
                  type="submit"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="bg-blue-600 text-white px-8 py-3 rounded-full hover:bg-blue-700 transition-colors"
                >
                  {loading ? "Updating..." : "Update Marks"}
                </button>
              </div>
            </>
          ) : (
            <p className="text-red-500 mt-4 text-center">
              No students assigned to this exam.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default UpdateMarksForm;
