"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  useIsStudentVerified,
  useGetAllExams,
  useExamFunctions,
  useGetQuestions,
} from "../../../utils/blockchain";
import { useActiveAccount } from "thirdweb/react";

interface Exam {
  id: bigint;
  title: string;
  startTime: bigint;
  duration: bigint;
  isActive: boolean;
  isAvailable: boolean;
  hasSubmitted: boolean;
}

export default function StudentDashboard() {
  const router = useRouter();
  const account = useActiveAccount();
  const address = account?.address;
  const [loading, setLoading] = useState(true);
  const [exams, setExams] = useState<Exam[]>([]);
  const [selectedExamId, setSelectedExamId] = useState<bigint | null>(null);

  // Get verification status
  const { data: isVerified, isLoading: verificationLoading } =
    useIsStudentVerified(address || "");

  // Get all exams with proper typing
  const { data: allExams, isLoading: examsLoading } = useGetAllExams();

  // Get questions for the selected exam
  const { data: questionsData, isLoading: questionsLoading } = useGetQuestions(
    selectedExamId || BigInt(0)
  );

  // Navigate to exam page when questions are loaded
  useEffect(() => {
    if (selectedExamId && questionsData && !questionsLoading) {
      // The questionsData should be the IPFS CID
      router.push(`/exams/${questionsData}`);
    }
  }, [questionsData, questionsLoading, selectedExamId, router]);

  // Get exam availability status for all exams
  useEffect(() => {
    const loadExams = async () => {
      setLoading(true);

      if (allExams && address) {
        // Properly type and destructure the allExams data
        const [examIds, titles, startTimes, durations, activeStatus] = allExams;

        const formattedExams = await Promise.all(
          examIds.map(async (id: bigint, index: number) => {
            // Check if exam is currently available (within time window)
            const startTime = startTimes[index];
            const duration = durations[index];
            const currentTime = BigInt(Math.floor(Date.now() / 1000));
            const endTime = startTime + duration;
            const isAvailable =
              activeStatus[index] &&
              currentTime >= startTime &&
              currentTime <= endTime;

            // Check if student has submitted answers
            const submission = await fetchSubmission(id, address);
            const hasSubmitted = submission !== null && submission !== "";

            return {
              id,
              title: titles[index],
              startTime,
              duration,
              isActive: activeStatus[index],
              isAvailable,
              hasSubmitted,
            };
          })
        );

        setExams(formattedExams);
      }

      setLoading(false);
    };

    if (!examsLoading && allExams) {
      loadExams();
    }
  }, [allExams, examsLoading, address]);

  // Fetch submission for a specific exam
  const fetchSubmission = async (examId: bigint, studentAddress: string) => {
    try {
      const response = await fetch(
        `/api/submissions?examId=${examId}&studentAddress=${studentAddress}`
      );
      if (response.ok) {
        const data = await response.json();
        return data.submission;
      }
      return null;
    } catch (error) {
      console.error("Error fetching submission:", error);
      return null;
    }
  };

  const handleTakeExam = (examId: bigint) => {
    // Set the selected exam ID to trigger the useGetQuestions hook
    setSelectedExamId(examId);
  };

  const formatTime = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) * 1000);
    return date.toLocaleString();
  };

  const getExamStatus = (exam: Exam) => {
    const currentTime = BigInt(Math.floor(Date.now() / 1000));

    if (!exam.isActive) {
      return "Inactive";
    } else if (currentTime < exam.startTime) {
      return "Not Started";
    } else if (currentTime > exam.startTime + exam.duration) {
      return "Ended";
    } else {
      return "Active";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "text-green-500";
      case "Inactive":
        return "text-red-500";
      case "Not Started":
        return "text-yellow-500";
      case "Ended":
        return "text-gray-500";
      default:
        return "";
    }
  };

  if (!address) {
    return (
      <div className="min-h-screen bg-gray-100 p-6 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md text-center">
          <h2 className="text-2xl font-bold mb-4">Wallet Not Connected</h2>
          <p className="mb-6">
            Please connect your wallet to access the student dashboard.
          </p>
        </div>
      </div>
    );
  }

  if (
    loading ||
    verificationLoading ||
    examsLoading ||
    (selectedExamId && questionsLoading)
  ) {
    return (
      <div className="min-h-screen bg-gray-100 p-6 flex items-center justify-center">
        <div className="text-xl font-semibold">
          {selectedExamId ? "Loading exam..." : "Loading dashboard..."}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-2xl font-bold mb-4">Student Dashboard</h1>

          <div className="mb-6 p-4 rounded-lg bg-gray-50">
            <div className="flex items-center mb-2">
              <span className="font-semibold mr-2">Wallet Address:</span>
              <span className="text-gray-700">{address}</span>
            </div>

            <div className="flex items-center">
              <span className="font-semibold mr-2">Verification Status:</span>
              {isVerified ? (
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                  Verified
                </span>
              ) : (
                <span className="bg-red-100 text-red-800 px-2 py-1 rounded">
                  Not Verified
                </span>
              )}
            </div>
          </div>

          {!isVerified && (
            <div className="mb-6 p-4 rounded-lg bg-yellow-50 border border-yellow-200">
              <p className="text-yellow-800">
                You are not verified yet. Please contact your instructor to get
                verified.
              </p>
            </div>
          )}

          <h2 className="text-xl font-bold mb-4">Available Exams</h2>

          {exams.length === 0 ? (
            <p className="text-gray-500 italic">
              No exams available at the moment.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-2 text-left border">Exam Title</th>
                    <th className="px-4 py-2 text-left border">Start Time</th>
                    <th className="px-4 py-2 text-left border">Duration</th>
                    <th className="px-4 py-2 text-left border">Status</th>
                    <th className="px-4 py-2 text-left border">Submission</th>
                    <th className="px-4 py-2 text-left border">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {exams.map((exam) => {
                    const examStatus = getExamStatus(exam);
                    const statusColor = getStatusColor(examStatus);

                    return (
                      <tr key={String(exam.id)} className="hover:bg-gray-50">
                        <td className="px-4 py-3 border">{exam.title}</td>
                        <td className="px-4 py-3 border">
                          {formatTime(exam.startTime)}
                        </td>
                        <td className="px-4 py-3 border">{`${
                          Number(exam.duration) / 60
                        } minutes`}</td>
                        <td
                          className={`px-4 py-3 border font-medium ${statusColor}`}
                        >
                          {examStatus}
                        </td>
                        <td className="px-4 py-3 border">
                          {exam.hasSubmitted ? (
                            <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                              Submitted
                            </span>
                          ) : (
                            <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm">
                              Not Submitted
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 border">
                          {examStatus === "Active" && !exam.hasSubmitted ? (
                            <button
                              onClick={() => handleTakeExam(exam.id)}
                              className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
                              disabled={!isVerified}
                            >
                              Take Exam
                            </button>
                          ) : exam.hasSubmitted ? (
                            <span className="text-sm text-gray-500">
                              Completed
                            </span>
                          ) : (
                            <button
                              disabled
                              className="bg-gray-300 text-gray-500 px-3 py-1 rounded text-sm cursor-not-allowed"
                            >
                              {examStatus === "Ended"
                                ? "Expired"
                                : "Not Available"}
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
