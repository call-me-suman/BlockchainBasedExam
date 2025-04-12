"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Spinner from "@/components/Spinner";
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
        return "text-emerald-400";
      case "Inactive":
        return "text-red-400";
      case "Not Started":
        return "text-yellow-400";
      case "Ended":
        return "text-gray-400";
      default:
        return "";
    }
  };

  if (!address) {
    return (
      <div className="min-h-screen bg-black p-6 flex items-center justify-center">
        <div className="bg-black/40 backdrop-blur-lg p-8 rounded-xl shadow-2xl border border-gray-800 w-full max-w-md text-center">
          <h2 className="text-2xl text-white font-bold mb-4">
            Wallet Not Connected
          </h2>
          <p className="mb-6 text-gray-300">
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
      <div className="min-h-screen bg-black p-6 flex items-center justify-center">
        <div className="text-xl font-semibold text-white">
          {selectedExamId ? (
            <>
              <p className="mb-4">Loading exam...</p>
              <Spinner />
            </>
          ) : viewSubmissionId ? (
            <>
              <p className="mb-4">Loading results...</p>
              <Spinner />
            </>
          ) : (
            <>
              <p className="mb-4">Loading dashboard...</p>
              <Spinner />
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-6">
      <div className="max-w-5xl mx-auto">
        <div className="bg-black/50 backdrop-blur-lg rounded-xl shadow-2xl p-8 mb-6 border border-blue-900/40">
          <h1 className="text-3xl font-bold mb-6 text-white bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">
            Student Dashboard
          </h1>

          <div className="mb-8 p-4 rounded-xl bg-black/30 backdrop-blur-md border border-gray-800">
            <div className="flex flex-col md:flex-row md:items-center gap-4 mb-2">
              <span className="font-semibold text-gray-300">
                Wallet Address:
              </span>
              <span className="text-blue-400 font-mono text-sm md:text-base break-all">
                {address}
              </span>
            </div>

            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <span className="font-semibold text-gray-300">
                Verification Status:
              </span>
              {isVerified ? (
                <span className="bg-emerald-500/20 text-emerald-400 px-3 py-1.5 rounded-lg text-sm inline-block">
                  Verified
                </span>
              ) : (
                <span className="bg-red-500/20 text-red-400 px-3 py-1.5 rounded-lg text-sm inline-block">
                  Not Verified
                </span>
              )}
            </div>
          </div>

          {!isVerified && (
            <div className="mb-8 p-5 rounded-xl bg-yellow-500/10 border border-yellow-500/30">
              <p className="text-yellow-400">
                You are not verified yet. Please contact your instructor to get
                verified.
              </p>
            </div>
          )}

          <h2 className="text-2xl font-bold mb-6 text-white">
            Available Exams
          </h2>

          {exams.length === 0 ? (
            <p className="text-gray-400 italic">
              No exams available at the moment.
            </p>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-gray-800">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-blue-900/30 text-gray-200">
                    <th className="px-4 py-3 text-left border-b border-gray-800">
                      Exam Title
                    </th>
                    <th className="px-4 py-3 text-left border-b border-gray-800">
                      Start Time
                    </th>
                    <th className="px-4 py-3 text-left border-b border-gray-800">
                      Duration
                    </th>
                    <th className="px-4 py-3 text-left border-b border-gray-800">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left border-b border-gray-800">
                      Submission
                    </th>
                    <th className="px-4 py-3 text-left border-b border-gray-800">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {exams.map((exam) => {
                    const examStatus = getExamStatus(exam);
                    const statusColor = getStatusColor(examStatus);

                    return (
                      <tr
                        key={String(exam.id)}
                        className="text-gray-300 hover:bg-blue-900/10 transition duration-150"
                      >
                        <td className="px-4 py-4 border-r border-gray-800 font-medium">
                          {exam.title}
                        </td>
                        <td className="px-4 py-4 border-r border-gray-800">
                          {formatTime(exam.startTime)}
                        </td>
                        <td className="px-4 py-4 border-r border-gray-800">{`${
                          Number(exam.duration) / 60
                        } minutes`}</td>
                        <td
                          className={`px-4 py-4 border-r border-gray-800 font-medium ${statusColor}`}
                        >
                          {examStatus}
                        </td>
                        <td className="px-4 py-4 border-r border-gray-800">
                          {exam.hasSubmitted ? (
                            <span className="bg-emerald-500/20 text-emerald-400 px-3 py-1.5 rounded-lg text-sm inline-block">
                              Submitted
                            </span>
                          ) : (
                            <span className="bg-gray-700/50 text-gray-400 px-3 py-1.5 rounded-lg text-sm inline-block">
                              Not Submitted
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          {exam.hasSubmitted ? (
                            <button
                              onClick={() => handleViewResults(exam.id)}
                              className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition duration-150 shadow-md shadow-emerald-500/20"
                              disabled={!isVerified}
                            >
                              View Results
                            </button>
                          ) : examStatus === "Active" ? (
                            <button
                              onClick={() => handleTakeExam(exam.id)}
                              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition duration-150 shadow-md shadow-blue-500/20"
                              disabled={!isVerified}
                            >
                              Take Exam
                            </button>
                          ) : (
                            <button
                              disabled
                              className="bg-gray-700/50 text-gray-500 px-4 py-2 rounded-lg text-sm cursor-not-allowed"
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
