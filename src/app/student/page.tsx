"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  useIsStudentVerified,
  useGetAllExams,
  useGetQuestions,
  useIsStudentSubmitted,
  useGetStudentSubmission,
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
  const address = account?.address || "";
  const [loading, setLoading] = useState(true);
  const [exams, setExams] = useState<Exam[]>([]);
  const [selectedExamId, setSelectedExamId] = useState<bigint | null>(null);
  const [viewSubmissionId, setViewSubmissionId] = useState<bigint | null>(null);
  const [currentExamIndex, setCurrentExamIndex] = useState<number | null>(null);
  const [currentTime, setCurrentTime] = useState(BigInt(0));

  // Get verification status
  const { data: isVerified, isLoading: verificationLoading } =
    useIsStudentVerified(address);

  // Get all exams with proper typing
  const { data: allExams, isLoading: examsLoading } = useGetAllExams();

  // Get questions for the selected exam
  const { data: questionsData, isLoading: questionsLoading } = useGetQuestions(
    selectedExamId || BigInt(0)
  );

  // Get submission status for current exam in focus
  const { data: isSubmitted, isLoading: submissionStatusLoading } =
    useIsStudentSubmitted(
      address,
      currentExamIndex !== null && exams[currentExamIndex]
        ? exams[currentExamIndex].id
        : BigInt(0)
    );

  const { data: submissionCid, isLoading: submissionCidLoading } =
    useGetStudentSubmission(viewSubmissionId || BigInt(0), address);

  useEffect(() => {
    setCurrentTime(BigInt(Math.floor(Date.now() / 1000)));
  }, []);

  // Navigate to exam page when questions are loaded

  useEffect(() => {
    if (selectedExamId && questionsData && !questionsLoading) {
      router.push(`/exams/${questionsData}`);
    }
  }, [questionsData, questionsLoading, selectedExamId, router]);

  useEffect(() => {
    if (viewSubmissionId && submissionCid && !submissionCidLoading) {
      if (
        submissionCid &&
        typeof submissionCid === "string" &&
        submissionCid.length > 0
      ) {
        router.push(`/results/${submissionCid}`);
      } else {
        console.log("No submission CID found for this exam");
        setViewSubmissionId(null); // Reset to avoid repeated attempts
      }
    }
  }, [submissionCid, submissionCidLoading, viewSubmissionId, router]);

  // Update submission status for current exam in focus
  useEffect(() => {
    if (
      currentExamIndex !== null &&
      exams[currentExamIndex] &&
      !submissionStatusLoading &&
      isSubmitted !== undefined
    ) {
      const updatedExams = [...exams];
      updatedExams[currentExamIndex] = {
        ...updatedExams[currentExamIndex],
        hasSubmitted: isSubmitted,
      };
      setExams(updatedExams);
      setCurrentExamIndex(null); // Reset after updating
    }
  }, [isSubmitted, submissionStatusLoading, currentExamIndex, exams]);

  // Process all exams data
  useEffect(() => {
    const loadExams = async () => {
      setLoading(true);

      if (allExams && address) {
        // Properly type and destructure the allExams data
        const [examIds, titles, startTimes, durations, activeStatus] = allExams;

        // First create all the exam objects with basic info
        const formattedExams = examIds.map((id: bigint, index: number) => {
          const startTime = startTimes[index];
          const duration = durations[index];

          const endTime = startTime + duration;
          const isAvailable =
            activeStatus[index] &&
            currentTime >= startTime &&
            currentTime <= endTime;

          return {
            id,
            title: titles[index],
            startTime,
            duration,
            isActive: activeStatus[index],
            isAvailable,
            hasSubmitted: false, // Default value, will be updated
          };
        });

        setExams(formattedExams);

        // Then check submission status for each exam one by one
        for (let i = 0; i < formattedExams.length; i++) {
          setCurrentExamIndex(i);
          // Wait a bit to let the hook run
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
      }

      setLoading(false);
    };

    if (!examsLoading && allExams) {
      loadExams();
    }
  }, [allExams, examsLoading, address]);

  const handleTakeExam = (examId: bigint) => {
    setSelectedExamId(examId);
  };

  const handleViewResults = (examId: bigint) => {
    setViewSubmissionId(examId);
    console.log(submissionCid);
    router.push(`/results/${submissionCid}`);
  };

  const formatTime = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) * 1000);
    return date.toLocaleString();
  };

  const getExamStatus = (exam: Exam) => {
    if (typeof window === "undefined") return "Loading...";
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
    (selectedExamId && questionsLoading) ||
    (viewSubmissionId && submissionCidLoading)
  ) {
    return (
      <div className="min-h-screen bg-gray-100 p-6 flex items-center justify-center">
        <div className="text-xl font-semibold">
          {selectedExamId
            ? "Loading exam..."
            : viewSubmissionId
            ? "Loading results..."
            : "Loading dashboard..."}
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
                          {exam.hasSubmitted ? (
                            <button
                              onClick={() => handleViewResults(exam.id)}
                              className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm"
                              disabled={!isVerified}
                            >
                              View Results
                            </button>
                          ) : examStatus === "Active" ? (
                            <button
                              onClick={() => handleTakeExam(exam.id)}
                              className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
                              disabled={!isVerified}
                            >
                              Take Exam
                            </button>
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
