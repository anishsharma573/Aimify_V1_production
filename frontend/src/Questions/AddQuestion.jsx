import React, { useState } from 'react';
import axiosInstance from '../services/api';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const UploadQuestions = () => {
  // State to control which form is visible: 'single', 'json', or 'excel'
  const [selectedForm, setSelectedForm] = useState('single');
  
  // State for Single Question form
  const [singleData, setSingleData] = useState({
    questionText: '',
    className: '',
    questionType: 'MCQ',
    subject: '',
    topic: '',
    subTopic: '',
    difficulty: 'Easy',
    tags: '',
    explanation: '',
    bloomsTaxonomy: '',
    createdBy: '',
    options: '',
    correctAnswer: '',
    matchingPairs: '',
    codingQuestion: '',
  });
  
  // State for JSON Input form
  const [jsonData, setJsonData] = useState('');
  
  // State for Excel file upload
  const [excelFile, setExcelFile] = useState(null);

  // Update singleData state when input changes
  const handleSingleChange = (e) => {
    setSingleData({ ...singleData, [e.target.name]: e.target.value });
  };

  // Submit handler for Single Question form
  const handleSingleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Prepare payload: convert comma-separated strings into arrays; parse matchingPairs JSON string if provided
      const payload = {
        ...singleData,
        tags: singleData.tags ? singleData.tags.split(',').map(s => s.trim()) : [],
        options: singleData.options ? singleData.options.split(',').map(s => s.trim()) : [],
        matchingPairs: singleData.matchingPairs ? JSON.parse(singleData.matchingPairs) : [],
      };

      const res = await axiosInstance.post('/questions/add-single-question', payload, {
        headers: { 'Content-Type': 'application/json' },
      });
      
      toast.success(res.data.message || 'Single question added successfully!');
      
      // Reset the form
      setSingleData({
        questionText: '',
        className: '',
        questionType: 'MCQ',
        subject: '',
        topic: '',
        subTopic: '',
        difficulty: 'Easy',
        tags: '',
        explanation: '',
        bloomsTaxonomy: '',
        createdBy: '',
        options: '',
        correctAnswer: '',
        matchingPairs: '',
        codingQuestion: '',
      });
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Error submitting single question');
    }
  };

  // Submit handler for JSON Input form
  const handleJsonSubmit = async (e) => {
    e.preventDefault();
    try {
      // Ensure jsonData is valid JSON
      const payload = { questions: JSON.parse(jsonData) };
      const res = await axiosInstance.post('/questions/add-json-file-question', payload, {
        headers: { 'Content-Type': 'application/json' },
      });
      
      toast.success(res.data.message || 'JSON questions added successfully!');
      setJsonData('');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Error submitting JSON questions');
    }
  };

  // Submit handler for Excel Upload form
  const handleExcelSubmit = async (e) => {
    e.preventDefault();
    if (!excelFile) {
      toast.error('Please select an Excel file.');
      return;
    }
    try {
      const formData = new FormData();
      formData.append('file', excelFile);
      const res = await axiosInstance.post('/questions/add-excel-question', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success(res.data.message || 'Excel file uploaded successfully!');
      setExcelFile(null);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Error uploading Excel file');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <ToastContainer />
      <div className="max-w-3xl mx-auto bg-white shadow-md rounded-md p-6">
        <h1 className="text-2xl font-bold mb-4 text-center">Add Question</h1>

        {/* Toggle Buttons */}
        <div className="flex justify-center mb-6 space-x-4">
          <button
            onClick={() => setSelectedForm('single')}
            className={`px-4 py-2 rounded focus:outline-none ${
              selectedForm === 'single'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-300 text-gray-800 hover:bg-gray-400'
            }`}
          >
            Single Question
          </button>
          <button
            onClick={() => setSelectedForm('json')}
            className={`px-4 py-2 rounded focus:outline-none ${
              selectedForm === 'json'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-300 text-gray-800 hover:bg-gray-400'
            }`}
          >
            JSON Input
          </button>
          <button
            onClick={() => setSelectedForm('excel')}
            className={`px-4 py-2 rounded focus:outline-none ${
              selectedForm === 'excel'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-300 text-gray-800 hover:bg-gray-400'
            }`}
          >
            Excel Upload
          </button>
        </div>

        {/* Single Question Form */}
        {selectedForm === 'single' && (
          <form onSubmit={handleSingleSubmit} className="space-y-4">
            <h2 className="text-xl font-semibold">Add Single Question</h2>
            <div>
              <label className="block mb-1">Question Text</label>
              <input
                type="text"
                name="questionText"
                value={singleData.questionText}
                onChange={handleSingleChange}
                className="w-full border border-gray-300 rounded px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block mb-1">Class Name</label>
              <input
                type="text"
                name="className"
                value={singleData.className}
                onChange={handleSingleChange}
                className="w-full border border-gray-300 rounded px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block mb-1">Question Type</label>
              <select
                name="questionType"
                value={singleData.questionType}
                onChange={handleSingleChange}
                className="w-full border border-gray-300 rounded px-3 py-2"
                required
              >
                <option value="MCQ">MCQ</option>
                <option value="TRUE_FALSE">TRUE_FALSE</option>
                <option value="SHORT_ANSWER">SHORT_ANSWER</option>
                <option value="FILL_IN_THE_BLANK">FILL_IN_THE_BLANK</option>
                <option value="MATCHING">MATCHING</option>
                <option value="ESSAY">ESSAY</option>
                <option value="CODING">CODING</option>
              </select>
            </div>
            <div>
              <label className="block mb-1">Subject</label>
              <input
                type="text"
                name="subject"
                value={singleData.subject}
                onChange={handleSingleChange}
                className="w-full border border-gray-300 rounded px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block mb-1">Topic</label>
              <input
                type="text"
                name="topic"
                value={singleData.topic}
                onChange={handleSingleChange}
                className="w-full border border-gray-300 rounded px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block mb-1">Sub Topic</label>
              <input
                type="text"
                name="subTopic"
                value={singleData.subTopic}
                onChange={handleSingleChange}
                className="w-full border border-gray-300 rounded px-3 py-2"
                required
              />
            </div>
            {/* Optional Fields */}
            <div>
              <label className="block mb-1">Tags (comma separated)</label>
              <input
                type="text"
                name="tags"
                value={singleData.tags}
                onChange={handleSingleChange}
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block mb-1">Options (comma separated for MCQ/TRUE_FALSE)</label>
              <input
                type="text"
                name="options"
                value={singleData.options}
                onChange={handleSingleChange}
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block mb-1">Matching Pairs (JSON Array for MATCHING)</label>
              <input
                type="text"
                name="matchingPairs"
                value={singleData.matchingPairs}
                onChange={handleSingleChange}
                placeholder='[{"question": "A", "answer": "1"}]'
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
            </div>
            <button type="submit" className="w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
              Submit Single Question
            </button>
          </form>
        )}

        {/* JSON Input Form */}
        {selectedForm === 'json' && (
          <form onSubmit={handleJsonSubmit} className="space-y-4">
            <h2 className="text-xl font-semibold">Add Questions from JSON</h2>
            <p className="text-sm text-gray-600">Paste a JSON array of question objects.</p>
            <div>
              <textarea
                name="questions"
                rows="10"
                value={jsonData}
                onChange={(e) => setJsonData(e.target.value)}
                placeholder='[{"questionText": "What is...", "className": "Class 10", ...}]'
                className="w-full border border-gray-300 rounded px-3 py-2"
                required
              ></textarea>
            </div>
            <button type="submit" className="w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
              Submit JSON Questions
            </button>
          </form>
        )}

        {/* Excel Upload Form */}
        {selectedForm === 'excel' && (
          <form onSubmit={handleExcelSubmit} className="space-y-4" encType="multipart/form-data">
            <h2 className="text-xl font-semibold">Add Questions from Excel</h2>
            <p className="text-sm text-gray-600">Upload an Excel file (.xlsx) containing question data.</p>
            <div>
              <input
                type="file"
                name="file"
                accept=".xlsx"
                onChange={(e) => setExcelFile(e.target.files[0])}
                className="w-full"
                required
              />
            </div>
            <button type="submit" className="w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
              Upload Excel File
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default UploadQuestions;
