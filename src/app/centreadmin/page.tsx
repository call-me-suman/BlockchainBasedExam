"use client";

import { useState, useEffect } from "react";
import {
  useGetAllExams,
  useGetAllStudents,
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
  const {
    data: studentsData,
    isLoading: studentsLoading,
    error: studentsError,
  } = useGetAllStudents();

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
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">
          Admin Dashboard
        </h1>

        {/* Status message */}
        {statusMessage && (
          <div
            className={`mb-4 p-4 rounded-md ${
              statusMessage.includes("error") ||
              statusMessage.includes("Failed")
                ? "bg-red-100 text-red-700"
                : "bg-green-100 text-green-700"
            }`}
          >
            {statusMessage}
          </div>
        )}

        {/* Navigation tabs */}
        <div className="mb-8 border-b border-gray-200">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab("verifyStudents")}
              className={`py-3 px-1 font-medium ${
                activeTab === "verifyStudents"
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : "text-gray-500"
              }`}
            >
              Verify Students
            </button>
            <button
              onClick={() => setActiveTab("viewSubmissions")}
              className={`py-3 px-1 font-medium ${
                activeTab === "viewSubmissions"
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : "text-gray-500"
              }`}
            >
              View Submissions
            </button>
            <button
              onClick={() => setActiveTab("studentsForExam")}
              className={`py-3 px-1 font-medium ${
                activeTab === "studentsForExam"
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : "text-gray-500"
              }`}
            >
              Students For Exam
            </button>
            <button
              onClick={() => setActiveTab("allExams")}
              className={`py-3 px-1 font-medium ${
                activeTab === "allExams"
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : "text-gray-500"
              }`}
            >
              Manage Exams
            </button>
          </nav>
        </div>

        {/* Tab content */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          {/* Verify Students Tab */}
          {activeTab === "verifyStudents" && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Verify Students</h2>
              <div className="mb-4">
                <label
                  htmlFor="studentAddress"
                  className="block text-sm font-medium text-gray-700 mb-1"
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
                    className="flex-1 border border-gray-300 rounded-l-md p-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button
                    onClick={handleVerifyStudent}
                    disabled={loading}
                    className="bg-blue-600 text-white px-4 py-2 rounded-r-md hover:bg-blue-700 disabled:bg-blue-300"
                  >
                    {loading ? "Processing..." : "Verify"}
                  </button>
                </div>
              </div>

              {/* Display All Students */}
              <div className="mt-8">
                <h3 className="text-lg font-medium mb-3">All Students</h3>
                {studentsLoading ? (
                  <p>Loading students...</p>
                ) : studentsError ? (
                  <p className="text-red-500">
                    Error loading students: {studentsError.message}
                  </p>
                ) : studentsData &&
                  Array.isArray(studentsData) &&
                  studentsData[0]?.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Address
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Student ID
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {/* Assuming studentsData returns [addresses[], studentIds[], verificationStatus[]] */}
                        {Array.isArray(studentsData) &&
                          studentsData[0].map(
                            (address: string, index: number) => (
                              <tr key={address}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                  {address}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {studentsData[1][index]}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                  <span
                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                      studentsData[2][index]
                                        ? "bg-green-100 text-green-800"
                                        : "bg-yellow-100 text-yellow-800"
                                    }`}
                                  >
                                    {studentsData[2][index]
                                      ? "Verified"
                                      : "Unverified"}
                                  </span>
                                </td>
                              </tr>
                            )
                          )}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p>No students registered yet.</p>
                )}
              </div>
            </div>
          )}

          {/* View Submissions Tab */}
          {activeTab === "viewSubmissions" && (
            <div>
              <h2 className="text-xl font-semibold mb-4">
                View Student Submissions
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label
                    htmlFor="examSelect"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Select Exam
                  </label>
                  <select
                    id="examSelect"
                    value={selectedExamId.toString()}
                    onChange={(e) => setSelectedExamId(BigInt(e.target.value))}
                    className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="0">Select an exam</option>
                    {examsData &&
                      Array.isArray(examsData) &&
                      examsData[0]?.map((id: bigint, index: number) => (
                        <option key={id.toString()} value={id.toString()}>
                          {examsData[1][index]} (ID: {id.toString()})
                        </option>
                      ))}
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="studentForSubmission"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Student Address
                  </label>
                  <input
                    id="studentForSubmission"
                    type="text"
                    placeholder="0x..."
                    value={studentForSubmission}
                    onChange={(e) => setStudentForSubmission(e.target.value)}
                    className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Show submission */}
              <div className="mt-4 p-4 bg-gray-50 rounded-md">
                <h3 className="text-lg font-medium mb-2">Submission</h3>
                {submissionLoading ? (
                  <p>Loading submission...</p>
                ) : submissionError ? (
                  <p className="text-red-500">
                    Error loading submission: {submissionError.message}
                  </p>
                ) : submissionData ? (
                  <div className="overflow-auto max-h-60 p-3 bg-white border border-gray-200 rounded">
                    <p className="font-mono text-sm">
                      {submissionData as string}
                    </p>
                  </div>
                ) : (
                  <p>
                    No submission found or select both exam and student address.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Students For Exam Tab */}
          {activeTab === "studentsForExam" && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Students For Exam</h2>
              <div className="mb-6">
                <label
                  htmlFor="examSelectForStudents"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Select Exam
                </label>
                <select
                  id="examSelectForStudents"
                  value={selectedExamId.toString()}
                  onChange={(e) => setSelectedExamId(BigInt(e.target.value))}
                  className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="0">Select an exam</option>
                  {examsData &&
                    Array.isArray(examsData) &&
                    examsData[0]?.map((id: bigint, index: number) => (
                      <option key={id.toString()} value={id.toString()}>
                        {examsData[1][index]} (ID: {id.toString()})
                      </option>
                    ))}
                </select>
              </div>

              {/* Show students for selected exam */}
              <div className="mt-4">
                <h3 className="text-lg font-medium mb-3">Enrolled Students</h3>
                {studentsForExamLoading ? (
                  <p>Loading students...</p>
                ) : studentsForExamError ? (
                  <p className="text-red-500">
                    Error loading students: {studentsForExamError.message}
                  </p>
                ) : studentsForExamData &&
                  Array.isArray(studentsForExamData) &&
                  studentsForExamData.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Student Address
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {Array.isArray(studentsForExamData) &&
                          studentsForExamData.map((address: string) => (
                            <tr key={address}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {address}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p>
                    No students enrolled for this exam or select an exam first.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* All Exams Tab */}
          {activeTab === "allExams" && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Manage Exams</h2>
              {examsLoading ? (
                <p>Loading exams...</p>
              ) : examsError ? (
                <p className="text-red-500">
                  Error loading exams: {examsError.message}
                </p>
              ) : examsData &&
                Array.isArray(examsData) &&
                examsData[0]?.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          ID
                        </th>
                        <th
                          scope="col"
                          className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Title
                        </th>
                        <th
                          scope="col"
                          className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Start Time
                        </th>
                        <th
                          scope="col"
                          className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Duration (hrs)
                        </th>
                        <th
                          scope="col"
                          className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Status
                        </th>
                        <th
                          scope="col"
                          className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {/* Assuming examsData returns [examIds[], titles[], startTimes[], durations[], activeStatus[]] */}
                      {Array.isArray(examsData) &&
                        examsData[0].map((id: bigint, index: number) => (
                          <tr key={id.toString()}>
                            <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {id.toString()}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                              {examsData[1][index]}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(
                                Number(examsData[2][index]) * 1000
                              ).toLocaleString()}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                              {(Number(examsData[3][index]) / 3600).toFixed(1)}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  examsData[4][index]
                                    ? "bg-green-100 text-green-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                              >
                                {examsData[4][index] ? "Active" : "Inactive"}
                              </span>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm">
                              <button
                                onClick={() =>
                                  handleUpdateExamStatus(
                                    id,
                                    !examsData[4][index]
                                  )
                                }
                                disabled={loading}
                                className={`px-3 py-1 rounded-md text-white ${
                                  examsData[4][index]
                                    ? "bg-red-600 hover:bg-red-700"
                                    : "bg-green-600 hover:bg-green-700"
                                } disabled:opacity-50`}
                              >
                                {examsData[4][index]
                                  ? "Deactivate"
                                  : "Activate"}
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p>No exams created yet.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
