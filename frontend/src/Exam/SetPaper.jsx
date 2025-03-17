import React, { useState } from "react";
import { toast } from "react-toastify";
import axiosInstance from "../services/api"; // Your custom Axios instance

const SetPaper = ({ paperId }) => {
  // State for filtering criteria
  const [criteria, setCriteria] = useState({
    class: "",
    subject: "",
    topic: "",
    subTopic: ""
  });
  
  // State for fetched questions and for selected question IDs
  const [questions, setQuestions] = useState([]);
  const [selectedQuestionIds, setSelectedQuestionIds] = useState([]);
  const [loading, setLoading] = useState(false);

  // Update criteria state on input change
  const handleCriteriaChange = (e) => {
    const { name, value } = e.target;
    setCriteria((prev) => ({ ...prev, [name]: value }));
  };

  // Fetch questions based on the criteria
  const fetchQuestions = () => {
    if (!criteria.class || !criteria.subject) {
      toast.error("Please provide at least Class and Subject.");
      return;
    }
    setLoading(true);
    const queryString = `?class=${encodeURIComponent(criteria.class)}&subject=${encodeURIComponent(criteria.subject)}&topic=${encodeURIComponent(criteria.topic)}&subTopic=${encodeURIComponent(criteria.subTopic)}`;
    axiosInstance.get(`/questions/getQuestions${queryString}`)
      .then((res) => {
        setQuestions(res.data.data);
        if (res.data.data.length === 0) {
          toast.info("No questions found for the given criteria.");
        }
      })
      .catch((err) => {
        console.error("Error fetching questions:", err);
        toast.error(err.response?.data?.message || "Error fetching questions");
      })
      .finally(() => setLoading(false));
  };

  // Toggle the selection of a question
  const toggleQuestionSelection = (questionId) => {
    setSelectedQuestionIds((prev) =>
      prev.includes(questionId)
        ? prev.filter((id) => id !== questionId)
        : [...prev, questionId]
    );
  };

  // Submit the selected question IDs to set the exam paper
  const handleSetPaper = () => {
    if (!paperId) {
      toast.error("Paper ID is missing");
      return;
    }
    if (selectedQuestionIds.length === 0) {
      toast.error("Please select at least one question");
      return;
    }
    setLoading(true);
    axiosInstance.put("/exam/set-paper-questions", {
      paperId,
      questionIds: selectedQuestionIds
    })
      .then((res) => {
        toast.success("Questions set on paper successfully");
        // Optionally clear selection or update UI further here
      })
      .catch((err) => {
        console.error("Error setting paper questions:", err);
        toast.error(err.response?.data?.message || "Error setting paper questions");
      })
      .finally(() => setLoading(false));
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-center text-blue-700 mb-6">
        Set Exam Paper Questions
      </h2>
      
      {/* Criteria Section */}
      <div className="mb-4">
        <label className="block text-gray-700 mb-1">Class:</label>
        <input
          type="text"
          name="class"
          value={criteria.class}
          onChange={handleCriteriaChange}
          placeholder="Enter class (e.g., 8)"
          className="w-full p-2 border rounded mb-2"
        />
        <label className="block text-gray-700 mb-1">Subject:</label>
        <input
          type="text"
          name="subject"
          value={criteria.subject}
          onChange={handleCriteriaChange}
          placeholder="Enter subject (e.g., Math)"
          className="w-full p-2 border rounded mb-2"
        />
        <label className="block text-gray-700 mb-1">Topic:</label>
        <input
          type="text"
          name="topic"
          value={criteria.topic}
          onChange={handleCriteriaChange}
          placeholder="Enter topic (e.g., Algebra)"
          className="w-full p-2 border rounded mb-2"
        />
        <label className="block text-gray-700 mb-1">Sub-Topic (optional):</label>
        <input
          type="text"
          name="subTopic"
          value={criteria.subTopic}
          onChange={handleCriteriaChange}
          placeholder="Enter sub-topic"
          className="w-full p-2 border rounded"
        />
        <button
          onClick={fetchQuestions}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
        >
          {loading ? "Fetching..." : "Fetch Questions"}
        </button>
      </div>

      {/* Display Fetched Questions */}
      {questions.length > 0 && (
        <div className="mb-4">
          <h3 className="text-xl font-semibold mb-2">Available Questions</h3>
          {questions.map((q) => (
            <div key={q._id} className="flex items-center mb-2">
              <input
                type="checkbox"
                checked={selectedQuestionIds.includes(q._id)}
                onChange={() => toggleQuestionSelection(q._id)}
                className="mr-2"
              />
              <span>{q.questionText}</span>
            </div>
          ))}
        </div>
      )}

      {/* Button to Set Paper */}
      <button
        onClick={handleSetPaper}
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
      >
        {loading ? "Setting..." : "Set Paper with Selected Questions"}
      </button>
    </div>
  );
};

export default SetPaper;
