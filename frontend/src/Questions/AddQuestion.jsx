import React, { useState } from "react";
import axiosInstance from "../services/api";
import { toast } from "react-toastify";

const UploadQuestions = () => {
  const [mode, setMode] = useState("file"); // "file", "json", "manual"
  const [file, setFile] = useState(null);
  const [jsonData, setJsonData] = useState("");
  const [manualData, setManualData] = useState({
    class: "",
    questionText: "",
    questionType: "",
    options: "",
    correctAnswer: "",
    difficulty: "",
    subject: "",
    topic: "",
    subTopic: "",
    tags: "",
    explanation: "",
    matchingPairs: "",
    codingQuestion: "",
    // createdBy is assumed to be provided by auth on the backend
  });
  const [loading, setLoading] = useState(false);

  const handleModeChange = (newMode) => {
    setMode(newMode);
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleJsonChange = (e) => {
    setJsonData(e.target.value);
  };

  const handleManualChange = (e) => {
    const { name, value } = e.target;
    setManualData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let payload, headers;
      if (mode === "file") {
        if (!file) {
          toast.error("Please select a file");
          setLoading(false);
          return;
        }
        const formData = new FormData();
        formData.append("file", file);
        payload = formData;
        headers = { "Content-Type": "multipart/form-data" };
      } else if (mode === "json") {
        if (!jsonData) {
          toast.error("Please enter question JSON data");
          setLoading(false);
          return;
        }
        try {
          payload = JSON.parse(jsonData);
        } catch (err) {
          toast.error("Invalid JSON format");
          setLoading(false);
          return;
        }
        headers = { "Content-Type": "application/json" };
      } else if (mode === "manual") {
        // Prepare manual data payload:
        payload = {
          ...manualData,
          // Convert options and tags from comma-separated strings to arrays if applicable:
          options:
            (manualData.questionType === "MCQ" || manualData.questionType === "TRUE_FALSE") && manualData.options
              ? manualData.options.split(",").map((opt) => opt.trim())
              : [],
          tags: manualData.tags ? manualData.tags.split(",").map((tag) => tag.trim()) : [],
          // matchingPairs and codingQuestion can be parsed similarly if needed.
        };
        headers = { "Content-Type": "application/json" };
      }
      const response = await axiosInstance.post("/questions", payload, { headers });
      toast.success(response.data.data.message || "Questions added successfully");
      // Optionally reset the form for the selected mode
      if (mode === "manual") {
        setManualData({
          class: "",
          questionText: "",
          questionType: "",
          options: "",
          correctAnswer: "",
          difficulty: "",
          subject: "",
          topic: "",
          subTopic: "",
          tags: "",
          explanation: "",
          matchingPairs: "",
          codingQuestion: "",
        });
      } else if (mode === "json") {
        setJsonData("");
      } else if (mode === "file") {
        setFile(null);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error uploading questions");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-blue-100 flex flex-col items-center justify-center p-4">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Upload Questions</h2>
      <div className="mb-4">
        <button
          type="button"
          onClick={() => handleModeChange("file")}
          className={`px-4 py-2 rounded-l ${
            mode === "file" ? "bg-purple-600 text-white" : "bg-gray-300 text-gray-700"
          }`}
        >
          File Upload
        </button>
        <button
          type="button"
          onClick={() => handleModeChange("json")}
          className={`px-4 py-2 ${
            mode === "json" ? "bg-purple-600 text-white" : "bg-gray-300 text-gray-700"
          }`}
        >
          JSON Input
        </button>
        <button
          type="button"
          onClick={() => handleModeChange("manual")}
          className={`px-4 py-2 rounded-r ${
            mode === "manual" ? "bg-purple-600 text-white" : "bg-gray-300 text-gray-700"
          }`}
        >
          Manual Entry
        </button>
      </div>
      <form onSubmit={handleSubmit} className="w-full max-w-3xl bg-white p-6 rounded shadow">
        {mode === "file" && (
          <div className="mb-4">
            <label htmlFor="file" className="block text-gray-700 font-semibold mb-2">
              Select Excel File:
            </label>
            <input type="file" id="file" accept=".xlsx,.xls" onChange={handleFileChange} className="w-full" />
          </div>
        )}
        {mode === "json" && (
          <div className="mb-4">
            <label htmlFor="jsonData" className="block text-gray-700 font-semibold mb-2">
              Paste Questions JSON:
            </label>
            <textarea
              id="jsonData"
              value={jsonData}
              onChange={handleJsonChange}
              rows="10"
              placeholder='[ { "class": "10", "questionText": "What is 2+2?", "questionType": "MCQ", "options": ["3","4","5"], "correctAnswer": "4", "difficulty": "Easy", "subject": "Math", "topic": "Addition", "subTopic": "", "tags": ["basic"], "explanation": "2+2 equals 4", "matchingPairs": [], "codingQuestion": null, "createdBy": "YOUR_USER_ID" } ]'
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400"
            ></textarea>
          </div>
        )}
        {mode === "manual" && (
          <>
            {manualData.questionType === "" ? (
              <div className="mb-6">
                <label htmlFor="questionType" className="block text-gray-700 font-semibold mb-2">
                  Select Question Type
                </label>
                <select
                  name="questionType"
                  id="questionType"
                  value={manualData.questionType}
                  onChange={handleManualChange}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400"
                  required
                >
                  <option value="">-- Choose Type --</option>
                  <option value="MCQ">MCQ</option>
                  <option value="TRUE_FALSE">TRUE_FALSE</option>
                  <option value="SHORT_ANSWER">SHORT_ANSWER</option>
                  <option value="FILL_IN_THE_BLANK">FILL_IN_THE_BLANK</option>
                  <option value="MATCHING">MATCHING</option>
                  <option value="ESSAY">ESSAY</option>
                  <option value="CODING">CODING</option>
                </select>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="class" className="block text-gray-700 font-semibold mb-1">
                    Class
                  </label>
                  <input
                    type="text"
                    name="class"
                    id="class"
                    value={manualData.class}
                    onChange={handleManualChange}
                    placeholder="e.g., 10"
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="questionText" className="block text-gray-700 font-semibold mb-1">
                    Question Text
                  </label>
                  <input
                    type="text"
                    name="questionText"
                    id="questionText"
                    value={manualData.questionText}
                    onChange={handleManualChange}
                    placeholder="Enter your question"
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400"
                    required
                  />
                </div>
                {(manualData.questionType === "MCQ" || manualData.questionType === "TRUE_FALSE") && (
                  <div className="md:col-span-2">
                    <label htmlFor="options" className="block text-gray-700 font-semibold mb-1">
                      Options (comma-separated)
                    </label>
                    <input
                      type="text"
                      name="options"
                      id="options"
                      value={manualData.options}
                      onChange={handleManualChange}
                      placeholder="Option1, Option2, Option3, ..."
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400"
                      required
                    />
                  </div>
                )}
                <div>
                  <label htmlFor="correctAnswer" className="block text-gray-700 font-semibold mb-1">
                    Correct Answer
                  </label>
                  <input
                    type="text"
                    name="correctAnswer"
                    id="correctAnswer"
                    value={manualData.correctAnswer}
                    onChange={handleManualChange}
                    placeholder="Enter correct answer"
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                </div>
                <div>
                  <label htmlFor="difficulty" className="block text-gray-700 font-semibold mb-1">
                    Difficulty
                  </label>
                  <select
                    name="difficulty"
                    id="difficulty"
                    value={manualData.difficulty}
                    onChange={handleManualChange}
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400"
                    required
                  >
                    <option value="">Select Difficulty</option>
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="subject" className="block text-gray-700 font-semibold mb-1">
                    Subject
                  </label>
                  <input
                    type="text"
                    name="subject"
                    id="subject"
                    value={manualData.subject}
                    onChange={handleManualChange}
                    placeholder="e.g., Mathematics"
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="topic" className="block text-gray-700 font-semibold mb-1">
                    Topic
                  </label>
                  <input
                    type="text"
                    name="topic"
                    id="topic"
                    value={manualData.topic}
                    onChange={handleManualChange}
                    placeholder="e.g., Algebra"
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="subTopic" className="block text-gray-700 font-semibold mb-1">
                    Sub Topic
                  </label>
                  <input
                    type="text"
                    name="subTopic"
                    id="subTopic"
                    value={manualData.subTopic}
                    onChange={handleManualChange}
                    placeholder="e.g., Linear Equations"
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                </div>
                <div>
                  <label htmlFor="tags" className="block text-gray-700 font-semibold mb-1">
                    Tags (comma-separated)
                  </label>
                  <input
                    type="text"
                    name="tags"
                    id="tags"
                    value={manualData.tags}
                    onChange={handleManualChange}
                    placeholder="tag1, tag2, tag3"
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="explanation" className="block text-gray-700 font-semibold mb-1">
                    Explanation
                  </label>
                  <textarea
                    name="explanation"
                    id="explanation"
                    value={manualData.explanation}
                    onChange={handleManualChange}
                    placeholder="Provide explanation if any"
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400"
                    rows="3"
                  ></textarea>
                </div>
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-md font-semibold transition-colors duration-300 mt-4"
            >
              {loading ? "Submitting..." : "Submit Question"}
            </button>
          </>
        )}
      </form>
    </div>
  );
};

export default UploadQuestions;
