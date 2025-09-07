"use client";

import { useState, useEffect, useMemo, JSX } from "react";
import { useRouter } from "next/navigation";
import { useCallback, useRef } from "react";
import Spinner from "@/components/Spinner";
import {
  useIsStudentVerified,
  useGetAllExams,
  useGetQuestions,
  useIsStudentSubmitted,
  useGetStudentSubmission,
  useExamFunctions,
} from "../../../utils/blockchain";
import { useActiveAccount, useReadContract } from "thirdweb/react";
import React from "react";
import { getContractInstance } from "../../../utils/contract";

const contract = getContractInstance();

interface Exam {
  hasSubmitted: unknown;
  id: bigint;
  title: string;
  startTime: bigint;
  duration: bigint;
  isActive: boolean;
  isAvailable: boolean;
  // hasSubmitted: boolean;
  status: "active" | "upcoming" | "expired" | "inactive";
}

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegister: () => Promise<void>;
  isLoading: boolean;
}

interface SuccessToastProps {
  message: string;
  isVisible: boolean;
  onHide: () => void;
}

interface ExamSectionProps {
  title: string;
  exams: Exam[];
  icon: string;
}

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  exams: Exam[];
  onSelectExam: (exam: Exam) => void;
}

// Registration Modal Component
const RegistrationModal: React.FC<RegistrationModalProps> = ({
  isOpen,
  onClose,
  onRegister,
  isLoading,
}) => {
  if (!isOpen) return null;

  const handleRegisterAndVerify = async (): Promise<void> => {
    await onRegister();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-gray-900/95 backdrop-blur-lg rounded-xl shadow-2xl border border-gray-700 p-8 w-full max-w-md mx-4">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-white"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
            </svg>
          </div>
          <h2 className="text-2xl text-white font-bold mb-2">
            Join as Student
          </h2>
          <p className="text-gray-300">
            Register and verify your account to access exams
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 px-4 py-3 rounded-lg transition-all duration-200"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            onClick={handleRegisterAndVerify}
            disabled={isLoading}
            className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-4 py-3 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Setting up account...
              </>
            ) : (
              "Get Started"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// Success Toast Component
const SuccessToast: React.FC<SuccessToastProps> = ({
  message,
  isVisible,
  onHide,
}) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onHide();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onHide]);

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right-4 duration-300">
      <div className="bg-emerald-500/90 backdrop-blur-lg text-white px-6 py-4 rounded-lg shadow-lg border border-emerald-400/30 flex items-center gap-3">
        <svg
          className="w-5 h-5 flex-shrink-0"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
            clipRule="evenodd"
          />
        </svg>
        <span className="font-medium">{message}</span>
      </div>
    </div>
  );
};

// Search Modal Component
const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  exams,
  onSelectExam,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>("");

  const filteredExams = useMemo(() => {
    return exams.filter((exam) =>
      exam.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [exams, searchTerm]);

  const handleExamSelect = (exam: Exam): void => {
    onSelectExam(exam);
    onClose();
    setSearchTerm("");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/60 backdrop-blur-sm">
      <div className="bg-gray-900/95 backdrop-blur-lg rounded-xl shadow-2xl border border-gray-700 w-full max-w-2xl mx-4">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <svg
              className="w-5 h-5 text-gray-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                clipRule="evenodd"
              />
            </svg>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search exams..."
              className="flex-1 bg-transparent text-white text-lg focus:outline-none"
              autoFocus
            />
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {filteredExams.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <svg
                  className="w-12 h-12 mx-auto mb-3 opacity-50"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                    clipRule="evenodd"
                  />
                </svg>
                <p>No exams found</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredExams.map((exam) => (
                  <button
                    key={String(exam.id)}
                    onClick={() => handleExamSelect(exam)}
                    className="w-full text-left p-4 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700/50 hover:border-gray-600/50 transition-all duration-200"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-white font-medium">{exam.title}</h4>
                        <p className="text-gray-400 text-sm">
                          {exam.status.charAt(0).toUpperCase() +
                            exam.status.slice(1)}{" "}
                          •{" "}
                          {/* {exam.hasSubmitted ? " Submitted" : " Not Submitted"} */}
                        </p>
                      </div>
                      <div
                        className={`px-2 py-1 rounded-full text-xs ${
                          exam.status === "active"
                            ? "bg-emerald-500/20 text-emerald-400"
                            : exam.status === "upcoming"
                            ? "bg-blue-500/20 text-blue-400"
                            : "bg-gray-500/20 text-gray-400"
                        }`}
                      >
                        {exam.status}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Skeleton Components
const ExamRowSkeleton: React.FC = () => (
  <tr className="text-gray-300 animate-pulse">
    {[...Array(6)].map((_, i) => (
      <td key={i} className="px-4 py-4 border-r border-gray-800">
        <div className="h-4 bg-gray-700/50 rounded animate-pulse"></div>
      </td>
    ))}
  </tr>
);

// Custom hook for submission status checking
const useSubmissionStatusForExams = (
  examIds: bigint[],
  studentAddress: string
) => {
  const [submissionStatuses, setSubmissionStatuses] = useState<
    Map<string, boolean>
  >(new Map());
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!examIds.length || !studentAddress) {
      setSubmissionStatuses(new Map());
      return;
    }

    const fetchSubmissionStatuses = async () => {
      setLoading(true);
      const statusMap = new Map<string, boolean>();

      try {
        // Process exams in batches to avoid overwhelming the blockchain
        const batchSize = 5;
        for (let i = 0; i < examIds.length; i += batchSize) {
          const batch = examIds.slice(i, i + batchSize);

          const batchPromises = batch.map(async (examId) => {
            try {
              // You'll need to create a function in your blockchain utils that returns a promise
              // instead of using the hook directly
              const isSubmitted = await checkStudentSubmission(
                studentAddress,
                examId
              );
              return { examId, isSubmitted };
            } catch (error) {
              console.error(
                `Error checking submission for exam ${examId}:`,
                error
              );
              return { examId, isSubmitted: false };
            }
          });

          const batchResults = await Promise.all(batchPromises);
          batchResults.forEach(({ examId, isSubmitted }) => {
            statusMap.set(examId.toString(), isSubmitted);
          });
        }

        setSubmissionStatuses(statusMap);
      } catch (error) {
        console.error("Error fetching submission statuses:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissionStatuses();
  }, [examIds, studentAddress]);

  return { submissionStatuses, loading };
};
// You can place this component inside your StudentDashboard file, before the main export

const ExamActions: React.FC<{
  exam: Exam;
  isVerified: boolean;
  handleTakeExam: (id: bigint) => void;
  handleViewResults: (id: bigint) => void;
  address: string;
}> = ({ exam, isVerified, handleTakeExam, handleViewResults, address }) => {
  // CORRECT USAGE: Call the hook at the top level of a React component.
  const { data: hasSubmitted, isLoading } = useReadContract({
    contract,
    method:
      "function hasSubmitted(uint256 examId, address student) view returns (bool)",
    // Only run the query if the student is verified
    params: [exam.id, address],
  });

  // Render a loading state while checking
  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 border-2 border-gray-500 border-t-gray-300 rounded-full animate-spin"></div>
        <span className="text-gray-400 text-sm">Checking...</span>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between w-full">
      <div>
        {hasSubmitted ? (
          <span className="bg-emerald-500/20 text-emerald-400 px-3 py-1.5 rounded-lg text-sm inline-flex items-center gap-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            Submitted
          </span>
        ) : (
          <span className="bg-gray-700/50 text-gray-400 px-3 py-1.5 rounded-lg text-sm">
            Not Submitted
          </span>
        )}
      </div>

      <div>
        {hasSubmitted ? (
          <button
            onClick={() => handleViewResults(exam.id)}
            className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-md shadow-emerald-500/20 hover:shadow-emerald-500/30 hover:scale-105"
            disabled={!isVerified}
          >
            View Results
          </button>
        ) : exam.status === "active" ? (
          <button
            onClick={() => handleTakeExam(exam.id)}
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-md shadow-blue-500/20 hover:shadow-blue-500/30 hover:scale-105"
            disabled={!isVerified}
          >
            Take Exam
          </button>
        ) : (
          <button
            disabled
            className="bg-gray-700/50 text-gray-500 px-4 py-2 rounded-lg text-sm cursor-not-allowed"
          >
            {exam.status === "expired" ? "Expired" : "Not Available"}
          </button>
        )}
      </div>
    </div>
  );
};

export default function StudentDashboard(): JSX.Element {
  const router = useRouter();
  const account = useActiveAccount();
  const address: string = account?.address || "";

  // State management
  const [loading, setLoading] = useState<boolean>(true);
  const [exams, setExams] = useState<Exam[]>([]);
  const [selectedExamId, setSelectedExamId] = useState<bigint | null>(null);
  const [viewSubmissionId, setViewSubmissionId] = useState<bigint | null>(null);
  const [searchOpen, setSearchOpen] = useState<boolean>(false);
  const [registrationModalOpen, setRegistrationModalOpen] =
    useState<boolean>(false);
  const [registrationLoading, setRegistrationLoading] =
    useState<boolean>(false);
  const [successToast, setSuccessToast] = useState<{
    show: boolean;
    message: string;
  }>({ show: false, message: "" });

  // Use refs to avoid re-render loops
  const currentTimeRef = useRef<bigint>(BigInt(Math.floor(Date.now() / 1000)));

  // Blockchain hooks
  const {
    data: isVerified,
    isLoading: verificationLoading,
    refetch: refetchVerification,
  } = useIsStudentVerified(address);

  const {
    data: allExams,
    isLoading: examsLoading,
    error: examsError,
  } = useGetAllExams();

  const { data: questionsData, isLoading: questionsLoading } = useGetQuestions(
    selectedExamId || BigInt(0)
  );

  const { data: submissionCid, isLoading: submissionCidLoading } =
    useGetStudentSubmission(viewSubmissionId || BigInt(0), address);

  const { registerStudentandVerify, transactionError } = useExamFunctions();

  // Extract exam IDs for submission checking
  const examIds = useMemo(() => {
    if (!allExams || !allExams[0]) return [];
    return allExams[0] as bigint[];
  }, [allExams]);

  // Use custom hook for submission statuses
  const { submissionStatuses, loading: submissionLoading } =
    useSubmissionStatusForExams(examIds, isVerified ? address : "");

  // Calculate exam status
  const calculateExamStatus = useCallback(
    (
      startTime: bigint,
      duration: bigint,
      isActive: boolean
    ): "active" | "upcoming" | "expired" | "inactive" => {
      if (!isActive) return "inactive";

      const endTime = startTime + duration;
      const now = currentTimeRef.current;

      if (now < startTime) return "upcoming";
      if (now > endTime) return "expired";
      return "active";
    },
    []
  );

  // Handle registration and verification
  const handleRegistrationFlow = useCallback(async (): Promise<void> => {
    if (!address) return;

    setRegistrationLoading(true);
    try {
      await registerStudentandVerify(address);
      setSuccessToast({
        show: true,
        message: "Account setup complete! You can now access exams.",
      });

      setTimeout(async () => {
        await refetchVerification();
      }, 2000);
    } catch (error) {
      console.error("Registration error:", error);
      setSuccessToast({
        show: true,
        message: "Setup failed. Please try again.",
      });
    } finally {
      setRegistrationLoading(false);
    }
  }, [address, registerStudentandVerify, refetchVerification]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      } else if (e.key === "Escape") {
        setSearchOpen(false);
        setRegistrationModalOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Update time periodically
  useEffect(() => {
    const updateTime = (): void => {
      currentTimeRef.current = BigInt(Math.floor(Date.now() / 1000));
    };

    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  // Navigate to exam when questions are loaded
  useEffect(() => {
    if (selectedExamId && questionsData && !questionsLoading) {
      router.push(`/exams/${questionsData}`);
      setSelectedExamId(null);
    }
  }, [questionsData, questionsLoading, selectedExamId, router]);

  // Handle viewing submission results
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
      }
      setViewSubmissionId(null);
    }
  }, [submissionCid, submissionCidLoading, viewSubmissionId, router]);

  // Main data loading effect
  useEffect(() => {
    if (!address || verificationLoading || examsLoading) {
      return;
    }

    const loadExamsData = async () => {
      try {
        setLoading(true);

        if (!allExams) {
          console.log("No exams data available");
          setExams([]);
          return;
        }

        const [examIds, titles, startTimes, durations, activeStatus] = allExams;

        if (!examIds || examIds.length === 0) {
          console.log("No exams found");
          setExams([]);
          return;
        }

        // Process exams with submission status
        const processedExams: Exam[] = examIds.map(
          (id: bigint, index: number) => {
            const startTime = startTimes[index];
            const duration = durations[index];
            const status = calculateExamStatus(
              startTime,
              duration,
              activeStatus[index]
            );

            // Get hasSubmitted from submissionStatuses map
            const hasSubmitted = submissionStatuses.get(id.toString()) ?? false;

            return {
              id,
              title: titles[index],
              startTime,
              duration,
              isActive: activeStatus[index],
              isAvailable: status === "active",
              hasSubmitted,
              status,
            };
          }
        );

        // Sort exams by status priority
        const sortedExams = processedExams.sort((a, b) => {
          const statusOrder = {
            active: 0,
            upcoming: 1,
            expired: 2,
            inactive: 3,
          };
          return statusOrder[a.status] - statusOrder[b.status];
        });

        setExams(sortedExams);
      } catch (error) {
        console.error("Error loading exams:", error);
        setExams([]);
      } finally {
        setLoading(false);
      }
    };

    loadExamsData();
  }, [
    address,
    allExams,
    isVerified,
    calculateExamStatus,
    submissionStatuses,
    verificationLoading,
    examsLoading,
  ]);

  // Grouped exams
  const groupedExams = useMemo(() => {
    return {
      active: exams.filter((e) => e.status === "active"),
      upcoming: exams.filter((e) => e.status === "upcoming"),
      expired: exams.filter((e) => e.status === "expired"),
      inactive: exams.filter((e) => e.status === "inactive"),
    };
  }, [exams]);

  // Event handlers
  const handleTakeExam = useCallback((examId: bigint): void => {
    setSelectedExamId(examId);
  }, []);

  const handleViewResults = useCallback((examId: bigint): void => {
    setViewSubmissionId(examId);
  }, []);

  // Utility functions
  const formatTime = useCallback((timestamp: bigint): string => {
    const date = new Date(Number(timestamp) * 1000);
    return date.toLocaleString();
  }, []);

  const formatDuration = useCallback((duration: bigint): string => {
    const minutes = Number(duration) / 60;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (hours > 0) {
      return `${hours}h ${remainingMinutes}m`;
    }
    return `${minutes}m`;
  }, []);
  const checkForsubmission = (examID: bigint, address: string) => {
    return useReadContract({
      contract,
      method:
        "function hasSubmitted(uint256 examId, address student) view returns (bool)",
      params: [examID, address],
    });
  };

  const getStatusDisplay = useCallback(
    (status: string): { text: string; color: string } => {
      const statusMap = {
        active: { text: "Active", color: "text-emerald-400 bg-emerald-500/20" },
        upcoming: { text: "Upcoming", color: "text-blue-400 bg-blue-500/20" },
        expired: { text: "Expired", color: "text-gray-400 bg-gray-500/20" },
        inactive: { text: "Inactive", color: "text-red-400 bg-red-500/20" },
      };
      return (
        statusMap[status as keyof typeof statusMap] || {
          text: status,
          color: "",
        }
      );
    },
    []
  );

  // ExamSection component
  const ExamSection: React.FC<ExamSectionProps> = React.memo(
    ({ title, exams, icon }) => {
      if (exams.length === 0) return null;

      return (
        <div className="mb-8 animate-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">{icon}</span>
            <h3 className="text-xl font-bold text-white">{title}</h3>
            <span className="bg-gray-700/50 text-gray-300 px-2 py-1 rounded-full text-sm">
              {exams.length}
            </span>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {exams.map((exam) => {
              const statusDisplay = getStatusDisplay(exam.status);
              return (
                <div
                  key={String(exam.id)}
                  className="bg-gray-900/40 backdrop-blur-sm rounded-xl border border-gray-700/40 p-6 hover:border-gray-600/60 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-blue-500/10"
                >
                  <div className="flex items-start justify-between mb-4">
                    <h4 className="font-semibold text-white text-lg leading-tight">
                      {exam.title}
                    </h4>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${statusDisplay.color}`}
                    >
                      {statusDisplay.text}
                    </span>
                  </div>

                  <div className="space-y-2 mb-4 text-sm text-gray-300">
                    <div className="flex items-center gap-2">
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>{formatTime(exam.startTime)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>Duration: {formatDuration(exam.duration)}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center justify-between">
                      <ExamActions
                        exam={exam}
                        isVerified={isVerified || false}
                        address={address}
                        handleTakeExam={handleTakeExam}
                        handleViewResults={handleViewResults}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    }
  );

  // Early returns for loading and error states
  if (!address) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-6 flex items-center justify-center">
        <div className="bg-gray-900/40 backdrop-blur-lg p-8 rounded-xl shadow-2xl border border-gray-700 w-full max-w-md text-center animate-in slide-in-from-bottom-4 duration-500">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-white"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v2H2v-4l4.257-4.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 2 2 0 012 2 1 1 0 102 0 4 4 0 00-4-4z"
                clipRule="evenodd"
              />
            </svg>
          </div>
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

  // Show loading only for initial load
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-gray-900/50 backdrop-blur-lg rounded-xl shadow-2xl p-8 mb-6 border border-gray-700/40">
            <div className="h-8 bg-gray-700/50 rounded w-64 mb-6 animate-pulse"></div>
            <div className="mb-8 p-4 rounded-xl bg-gray-800/30 backdrop-blur-md border border-gray-700">
              <div className="h-4 bg-gray-700/50 rounded w-32 mb-2 animate-pulse"></div>
              <div className="h-4 bg-gray-700/50 rounded w-48 mb-4 animate-pulse"></div>
              <div className="h-4 bg-gray-700/50 rounded w-28 animate-pulse"></div>
            </div>
            <div className="h-6 bg-gray-700/50 rounded w-48 mb-6 animate-pulse"></div>

            <div className="overflow-x-auto rounded-xl border border-gray-700">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-800/30">
                    {[
                      "Exam Title",
                      "Start Time",
                      "Duration",
                      "Status",
                      "Submission",
                      "Action",
                    ].map((header) => (
                      <th
                        key={header}
                        className="px-4 py-3 text-left border-b border-gray-700"
                      >
                        <div className="h-4 bg-gray-700/50 rounded animate-pulse"></div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[...Array(5)].map((_, i) => (
                    <ExamRowSkeleton key={i} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main render
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-6">
      <SearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        exams={exams}
        onSelectExam={(exam) => handleTakeExam(exam.id)}
      />

      <RegistrationModal
        isOpen={registrationModalOpen}
        onClose={() => setRegistrationModalOpen(false)}
        onRegister={handleRegistrationFlow}
        isLoading={registrationLoading}
      />

      <SuccessToast
        message={successToast.message}
        isVisible={successToast.show}
        onHide={() => setSuccessToast({ show: false, message: "" })}
      />

      <div className="max-w-7xl mx-auto">
        <div className="bg-gray-900/50 backdrop-blur-lg rounded-xl shadow-2xl p-8 mb-6 border border-gray-700/40 animate-in slide-in-from-top-4 duration-500">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-4xl font-bold text-white bg-gradient-to-r from-blue-400 via-purple-500 to-blue-600 bg-clip-text text-transparent">
              Student Dashboard
            </h1>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setSearchOpen(true)}
                className="flex items-center gap-2 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-600/50 text-gray-300 px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105"
              >
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="hidden sm:inline">Search</span>
                <kbd className="hidden sm:inline-flex items-center px-2 py-1 bg-gray-700/50 text-xs rounded border border-gray-600/50">
                  ⌘K
                </kbd>
              </button>
            </div>
          </div>

          <div className="mb-8 p-6 rounded-xl bg-gray-800/30 backdrop-blur-md border border-gray-700/40">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <span className="font-semibold text-gray-400 text-sm uppercase tracking-wide">
                  Wallet Address
                </span>
                <span className="text-blue-400 font-mono text-sm break-all bg-gray-900/50 px-3 py-2 rounded-lg">
                  {address}
                </span>
              </div>

              <div className="flex flex-col gap-2">
                <span className="font-semibold text-gray-400 text-sm uppercase tracking-wide">
                  Verification Status
                </span>
                <div>
                  {isVerified ? (
                    <span className="bg-emerald-500/20 text-emerald-400 px-4 py-2 rounded-lg text-sm inline-flex items-center gap-2 font-medium">
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Verified Student
                    </span>
                  ) : (
                    <div className="flex items-center gap-3">
                      <span className="bg-yellow-500/20 text-yellow-400 px-4 py-2 rounded-lg text-sm inline-flex items-center gap-2 font-medium">
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Not Verified
                      </span>
                      <button
                        onClick={() => setRegistrationModalOpen(true)}
                        className="text-blue-400 hover:text-blue-300 text-sm font-medium underline decoration-dotted underline-offset-4 transition-colors duration-200"
                      >
                        Register & Verify →
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {exams.length === 0 ? (
            <div className="text-center py-12 animate-in slide-in-from-bottom-4 duration-500">
              <div className="w-24 h-24 bg-gradient-to-br from-gray-700 to-gray-800 rounded-full mx-auto mb-4 flex items-center justify-center">
                <svg
                  className="w-12 h-12 text-gray-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm3 5a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1zm0 3a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-300 mb-2">
                No Exams Available
              </h3>
              <p className="text-gray-400 mb-4">
                {!isVerified
                  ? "Register and verify your account to access available exams!"
                  : "There are no exams scheduled at the moment. Check back later!"}
              </p>
              {!isVerified && (
                <button
                  onClick={() => setRegistrationModalOpen(true)}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:scale-105 shadow-md shadow-blue-500/20 inline-flex items-center gap-2"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                  </svg>
                  Get Started
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-8">
              <ExamSection
                title="Active Exams"
                exams={groupedExams.active}
                icon="🔴"
              />
              <ExamSection
                title="Upcoming Exams"
                exams={groupedExams.upcoming}
                icon="🔵"
              />
              <ExamSection
                title="Expired Exams"
                exams={groupedExams.expired}
                icon="⚫"
              />
              <ExamSection
                title="Inactive Exams"
                exams={groupedExams.inactive}
                icon="🔘"
              />
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-emerald-500/10 backdrop-blur-sm rounded-xl p-4 border border-emerald-500/20 animate-in slide-in-from-bottom-4 duration-500">
            <div className="text-emerald-400 text-2xl font-bold">
              {groupedExams.active.length}
            </div>
            <div className="text-emerald-300 text-sm">Active</div>
          </div>
          <div className="bg-blue-500/10 backdrop-blur-sm rounded-xl p-4 border border-blue-500/20 animate-in slide-in-from-bottom-4 duration-500 delay-75">
            <div className="text-blue-400 text-2xl font-bold">
              {groupedExams.upcoming.length}
            </div>
            <div className="text-blue-300 text-sm">Upcoming</div>
          </div>
          <div className="bg-gray-500/10 backdrop-blur-sm rounded-xl p-4 border border-gray-500/20 animate-in slide-in-from-bottom-4 duration-500 delay-150">
            <div className="text-gray-400 text-2xl font-bold">
              {groupedExams.expired.length}
            </div>
            <div className="text-gray-300 text-sm">Expired</div>
          </div>
          <div className="bg-purple-500/10 backdrop-blur-sm rounded-xl p-4 border border-purple-500/20 animate-in slide-in-from-bottom-4 duration-500 delay-200">
            <div className="text-purple-400 text-2xl font-bold">
              {exams.filter((e) => e.hasSubmitted).length}
            </div>
            <div className="text-purple-300 text-sm">Submitted</div>
          </div>
        </div>

        {/* Loading states for individual actions */}
        {selectedExamId && questionsLoading && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="bg-gray-900/95 backdrop-blur-lg rounded-xl shadow-2xl border border-gray-700 p-8 text-center">
              <Spinner />
              <p className="mt-4 text-white font-medium">
                Loading exam questions...
              </p>
            </div>
          </div>
        )}

        {viewSubmissionId && submissionCidLoading && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="bg-gray-900/95 backdrop-blur-lg rounded-xl shadow-2xl border border-gray-700 p-8 text-center">
              <Spinner />
              <p className="mt-4 text-white font-medium">
                Loading exam results...
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
async function checkStudentSubmission(
  studentAddress: string,
  examId: bigint
): Promise<boolean> {
  try {
    // Replace with your contract call logic
    const result = await useReadContract({
      contract,
      method:
        "function hasSubmitted(uint256 examId, address student) view returns (bool)",
      params: [examId, studentAddress],
    });
    // If result is an object with a 'data' property, return result.data
    if (result && typeof result.data === "boolean") {
      return result.data;
    }
    // If result is directly boolean
    if (typeof result === "boolean") {
      return result;
    }
    return false;
  } catch (error) {
    console.error("Error in checkStudentSubmission:", error);
    return false;
  }
}
