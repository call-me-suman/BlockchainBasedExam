"use client";

import { useState, useEffect } from "react";
import {
  useGetAllExams,
  useGetStudentSubmission,
  useGetStudentsForExam,
  useExamFunctions,
} from "../../../utils/blockchain";

export default function AdminDashboard() {
  // State variables
  const [activeTab, setActiveTab] = useState("verifyStudents");
  const [studentAddress, setStudentAddress] = useState("");
  const [selectedExamId, setSelectedExamId] = useState<bigint>(BigInt(0));
  const [studentForSubmission, setStudentForSubmission] = useState("");
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  // Fetch all exams
  const {
    data: examsData,
    isLoading: examsLoading,
    error: examsError,
  } = useGetAllExams();

  // Fetch all students

  // Fetch student submission based on selected exam and student
  const {
    data: submissionData,
    isLoading: submissionLoading,
    error: submissionError,
  } = useGetStudentSubmission(
    selectedExamId,
    studentForSubmission || "0x0000000000000000000000000000000000000000"
  );

  // Fetch students for the selected exam
  const {
    data: studentsForExamData,
    isLoading: studentsForExamLoading,
    error: studentsForExamError,
  } = useGetStudentsForExam(selectedExamId);

  // Get blockchain functions for write operations
  const { verifyStudent, updateExamStatus, transactionError } =
    useExamFunctions();

  // Handle verification of student
  const handleVerifyStudent = async () => {
    if (!studentAddress) {
      setStatusMessage("Please enter a valid student address");
      return;
    }

    setLoading(true);
    setStatusMessage("Verifying student...");

    try {
      await verifyStudent(studentAddress);
      setStatusMessage("Student verification initiated successfully!");
      setStudentAddress("");
    } catch (error) {
      console.error("Error verifying student:", error);
      setStatusMessage(
        `Failed to verify student: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle updating exam status
  const handleUpdateExamStatus = async (examId: bigint, newStatus: boolean) => {
    setLoading(true);
    setStatusMessage(
      `Updating exam status to ${newStatus ? "active" : "inactive"}...`
    );

    try {
      await updateExamStatus(examId, newStatus);
      setStatusMessage("Exam status update initiated successfully!");
    } catch (error) {
      console.error("Error updating exam status:", error);
      setStatusMessage(
        `Failed to update exam status: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  // Clear status message after 5 seconds
  useEffect(() => {
    if (statusMessage) {
      const timer = setTimeout(() => {
        setStatusMessage("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [statusMessage]);

  // Handle transaction errors
  useEffect(() => {
    if (transactionError) {
      setStatusMessage(
        `Transaction error: ${transactionError.message || "Unknown error"}`
      );
    }
  }, [transactionError]);

  return (
    <div className="min-h-screen bg-gray-900 p-6 text-white bg-opacity-95">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-white">Admin Dashboard</h1>

        {/* Status message */}
        {statusMessage && (
          <div
            className={`mb-4 p-4 rounded-md backdrop-blur-md border ${
              statusMessage.includes("error") ||
              statusMessage.includes("Failed")
                ? "bg-red-900 bg-opacity-20 border-red-500 text-red-300"
                : "bg-green-900 bg-opacity-20 border-green-500 text-green-300"
            }`}
          >
            {statusMessage}
          </div>
        )}

        {/* Navigation tabs */}
        <div className="mb-8 border-b border-gray-700">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab("verifyStudents")}
              className={`py-3 px-1 font-medium ${
                activeTab === "verifyStudents"
                  ? "border-b-2 border-purple-500 text-purple-400"
                  : "text-gray-400 hover:text-gray-300"
              }`}
            >
              Verify Students
            </button>
            <button
              onClick={() => setActiveTab("viewSubmissions")}
              className={`py-3 px-1 font-medium ${
                activeTab === "viewSubmissions"
                  ? "border-b-2 border-purple-500 text-purple-400"
                  : "text-gray-400 hover:text-gray-300"
              }`}
            >
              View Submissions
            </button>
            <button
              onClick={() => setActiveTab("studentsForExam")}
              className={`py-3 px-1 font-medium ${
                activeTab === "studentsForExam"
                  ? "border-b-2 border-purple-500 text-purple-400"
                  : "text-gray-400 hover:text-gray-300"
              }`}
            >
              Students For Exam
            </button>
            <button
              onClick={() => setActiveTab("allExams")}
              className={`py-3 px-1 font-medium ${
                activeTab === "allExams"
                  ? "border-b-2 border-purple-500 text-purple-400"
                  : "text-gray-400 hover:text-gray-300"
              }`}
            >
              Manage Exams
            </button>
          </nav>
        </div>

        {/* Tab content */}
        <div className="bg-gray-900 bg-opacity-50 backdrop-blur-lg p-6 rounded-lg shadow-xl border border-gray-800">
          {/* Verify Students Tab */}
          {activeTab === "verifyStudents" && (
            <div>
              <h2 className="text-xl font-semibold mb-4 text-white">
                Verify Students
              </h2>
              <div className="mb-4">
                <label
                  htmlFor="studentAddress"
                  className="block text-sm font-medium text-gray-300 mb-1"
                >
                  Student Address
                </label>
                <div className="flex">
                  <input
                    id="studentAddress"
                    type="text"
                    placeholder="0x..."
                    value={studentAddress}
                    onChange={(e) => setStudentAddress(e.target.value)}
                    className="flex-1 bg-gray-800 bg-opacity-50 border border-gray-700 rounded-l-md p-2 text-white focus:ring-purple-500 focus:border-purple-500"
                  />
                  <button
                    onClick={handleVerifyStudent}
                    disabled={loading}
                    className="bg-purple-700 text-white px-4 py-2 rounded-r-md hover:bg-purple-600 disabled:bg-purple-900 disabled:opacity-50"
                  >
                    {loading ? "Processing..." : "Verify"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* View Submissions Tab */}
          {activeTab === "viewSubmissions" && (
            <div>
              <h2 className="text-xl font-semibold mb-4 text-white">
                View Student Submissions
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label
                    htmlFor="examSelect"
                    className="block text-sm font-medium text-gray-300 mb-1"
                  >
                    Select Exam
                  </label>
                  <select
                    id="examSelect"
                    value={selectedExamId.toString()}
                    onChange={(e) => setSelectedExamId(BigInt(e.target.value))}
                    className="w-full bg-gray-800 border border-gray-700 rounded-md p-2 text-white focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option value="0">Select an exam</option>
                    {examsData &&
                      Array.isArray(examsData) &&
                      examsData[0]?.map((id, index) => (
                        <option key={id.toString()} value={id.toString()}>
                          {examsData[1][index]} (ID: {id.toString()})
                        </option>
                      ))}
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="studentForSubmission"
                    className="block text-sm font-medium text-gray-300 mb-1"
                  >
                    Student Address
                  </label>
                  <input
                    id="studentForSubmission"
                    type="text"
                    placeholder="0x..."
                    value={studentForSubmission}
                    onChange={(e) => setStudentForSubmission(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-md p-2 text-white focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
              </div>

              {/* Show submission */}
              <div className="mt-4 p-4 bg-gray-800 bg-opacity-50 backdrop-blur-md rounded-md border border-gray-700">
                <h3 className="text-lg font-medium mb-2 text-white">
                  Submission
                </h3>
                {submissionLoading ? (
                  <p className="text-gray-400">Loading submission...</p>
                ) : submissionError ? (
                  <p className="text-red-400">
                    Error loading submission: {submissionError.message}
                  </p>
                ) : submissionData ? (
                  <div className="overflow-auto max-h-60 p-3 bg-gray-900 bg-opacity-70 border border-gray-700 rounded">
                    <p className="font-mono text-sm text-gray-300">
                      {submissionData}
                    </p>
                  </div>
                ) : (
                  <p className="text-gray-400">
                    No submission found or select both exam and student address.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Students For Exam Tab */}
          {activeTab === "studentsForExam" && (
            <div>
              <h2 className="text-xl font-semibold mb-4 text-white">
                Students For Exam
              </h2>
              <div className="mb-6">
                <label
                  htmlFor="examSelectForStudents"
                  className="block text-sm font-medium text-gray-300 mb-1"
                >
                  Select Exam
                </label>
                <select
                  id="examSelectForStudents"
                  value={selectedExamId.toString()}
                  onChange={(e) => setSelectedExamId(BigInt(e.target.value))}
                  className="w-full bg-gray-800 border border-gray-700 rounded-md p-2 text-white focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="0">Select an exam</option>
                  {examsData &&
                    Array.isArray(examsData) &&
                    examsData[0]?.map((id, index) => (
                      <option key={id.toString()} value={id.toString()}>
                        {examsData[1][index]} (ID: {id.toString()})
                      </option>
                    ))}
                </select>
              </div>

              {/* Show students for selected exam */}
              <div className="mt-4">
                <h3 className="text-lg font-medium mb-3 text-white">
                  Enrolled Students
                </h3>
                {studentsForExamLoading ? (
                  <p className="text-gray-400">Loading students...</p>
                ) : studentsForExamError ? (
                  <p className="text-red-400">
                    Error loading students: {studentsForExamError.message}
                  </p>
                ) : studentsForExamData &&
                  Array.isArray(studentsForExamData) &&
                  studentsForExamData.length > 0 ? (
                  <div className="overflow-x-auto bg-gray-900 bg-opacity-50 rounded-md border border-gray-700">
                    <table className="min-w-full divide-y divide-gray-700">
                      <thead className="bg-gray-800 bg-opacity-70">
                        <tr>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
                          >
                            Student Address
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-gray-900 bg-opacity-40 backdrop-blur-sm divide-y divide-gray-800">
                        {studentsForExamData.map((address) => (
                          <tr key={address}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-300">
                              {address}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-gray-400">
                    No students enrolled for this exam or select an exam first.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* All Exams Tab */}
          {activeTab === "allExams" && (
            <div>
              <h2 className="text-xl font-semibold mb-4 text-white">
                Manage Exams
              </h2>
              {examsLoading ? (
                <p className="text-gray-400">Loading exams...</p>
              ) : examsError ? (
                <p className="text-red-400">
                  Error loading exams: {examsError.message}
                </p>
              ) : examsData &&
                Array.isArray(examsData) &&
                examsData[0]?.length > 0 ? (
                <div className="overflow-x-auto bg-gray-900 bg-opacity-50 rounded-md border border-gray-700">
                  <table className="min-w-full divide-y divide-gray-700">
                    <thead className="bg-gray-800 bg-opacity-70">
                      <tr>
                        <th
                          scope="col"
                          className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
                        >
                          ID
                        </th>
                        <th
                          scope="col"
                          className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
                        >
                          Title
                        </th>
                        <th
                          scope="col"
                          className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
                        >
                          Start Time
                        </th>
                        <th
                          scope="col"
                          className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
                        >
                          Duration (hrs)
                        </th>
                        <th
                          scope="col"
                          className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
                        >
                          Status
                        </th>
                        <th
                          scope="col"
                          className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
                        >
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-gray-900 bg-opacity-40 backdrop-blur-sm divide-y divide-gray-800">
                      {examsData[0].map((id, index) => (
                        <tr key={id.toString()}>
                          <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-300">
                            {id.toString()}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-400">
                            {examsData[1][index]}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-400">
                            {new Date(
                              Number(examsData[2][index]) * 1000
                            ).toLocaleString()}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-400">
                            {(Number(examsData[3][index]) / 3600).toFixed(1)}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                examsData[4][index]
                                  ? "bg-green-900 bg-opacity-40 text-green-400"
                                  : "bg-red-900 bg-opacity-40 text-red-400"
                              }`}
                            >
                              {examsData[4][index] ? "Active" : "Inactive"}
                            </span>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm">
                            <button
                              onClick={() =>
                                handleUpdateExamStatus(id, !examsData[4][index])
                              }
                              disabled={loading}
                              className={`px-3 py-1 rounded-md text-white backdrop-blur-sm ${
                                examsData[4][index]
                                  ? "bg-red-800 hover:bg-red-700"
                                  : "bg-purple-800 hover:bg-purple-700"
                              } disabled:opacity-50`}
                            >
                              {examsData[4][index] ? "Deactivate" : "Activate"}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-400">No exams created yet.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
