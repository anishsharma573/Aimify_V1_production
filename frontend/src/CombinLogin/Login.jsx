// components/LoginSelection.jsx
import React, { useState } from 'react';
import TeacherLogin from '../teacher/Auth/TeacherLogin';
import StudentLogin from '../students/Auth/StudentLogin';

const LoginSelection = () => {
  const [loginType, setLoginType] = useState('teacher'); // default login type

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-400 to-white">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-semibold text-center mb-6 text-purple-600">
          Select Login Type
        </h2>
        <div className="flex justify-around mb-6">
          <button 
            onClick={() => setLoginType('teacher')}
            className={`px-4 py-2 rounded transition duration-300 focus:outline-none ${
              loginType === 'teacher'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Teacher Login
          </button>
          <button 
            onClick={() => setLoginType('student')}
            className={`px-4 py-2 rounded transition duration-300 focus:outline-none ${
              loginType === 'student'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Student Login
          </button>
        </div>
        <div className="login-form">
          {loginType === 'teacher' && <TeacherLogin />}
          {loginType === 'student' && <StudentLogin />}
        </div>
      </div>
    </div>
  );
};

export default LoginSelection;
