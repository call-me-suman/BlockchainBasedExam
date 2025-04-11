"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  useGetAllExams,
  useIsExamAvailable,
  useExamFunctions,
} from "../../../utils/blockchain";

export default function AdminDashboard() {
  const router = useRouter();
  const {
    data: examsData,
    isLoading: examsLoading,
    error: examsError,
    refetch,
  } = useGetAllExams();
  const { updateExamStatus } = useExamFunctions();
  const [statusUpdating, setStatusUpdating] = useState<Record<string, boolean>>(
    {}
  );
  const [exams, setExams] = useState<
    Array<{
      id: bigint;
      title: string;
      startTime: bigint;
      duration: bigint;
      isActive: boolean | undefined;
    }>
  >([]);

  // Format basic exam data from the tuple array returned by the hook
  useEffect(() => {
    if (examsData) {
      const formattedExams = examsData[0].map((id, index) => ({
        id: id,
        title: examsData[1][index],
        startTime: examsData[2][index],
        duration: examsData[3][index],
        isActive: undefined, // Will be filled by individual hooks
      }));
      setExams(formattedExams);
    }
  }, [examsData]);

  const handleStatusChange = async (examId: bigint, currentStatus: boolean) => {
    setStatusUpdating((prev) => ({ ...prev, [examId.toString()]: true }));
    try {
      await updateExamStatus(examId, !currentStatus);
      // Wait a moment before refetching to allow the blockchain to update
      setTimeout(() => {
        refetch();
        setStatusUpdating((prev) => ({ ...prev, [examId.toString()]: false }));
      }, 2000);
    } catch (error) {
      console.error("Failed to update exam status:", error);
      setStatusUpdating((prev) => ({ ...prev, [examId.toString()]: false }));
    }
  };

  const navigateToUpload = () => {
    router.push("/upload");
  };

  const formatDate = (timestamp: bigint) => {
    return new Date(Number(timestamp) * 1000).toLocaleString();
  };

  const formatDuration = (seconds: bigint) => {
    const hours = Math.floor(Number(seconds) / 3600);
    const minutes = Math.floor((Number(seconds) % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            Exam Admin Dashboard
          </h1>
          <button
            onClick={navigateToUpload}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow"
          >
            Upload New Exam
          </button>
        </div>

        {examsLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-xl text-gray-600">Loading exams...</div>
          </div>
        ) : examsError ? (
          <div className="bg-red-100 text-red-800 p-4 rounded-lg">
            Error loading exams: {examsError.message}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {exams.length > 0 ? (
              exams.map((exam) => (
                <ExamCard
                  key={exam.id.toString()}
                  exam={exam}
                  onStatusChange={handleStatusChange}
                  isUpdating={statusUpdating[exam.id.toString()]}
                  router={router}
                />
              ))
            ) : (
              <div className="col-span-full bg-gray-50 p-8 rounded-lg text-center">
                <p className="text-lg text-gray-600">No exams found.</p>
                <p className="text-gray-500 mt-2">
                  Click "Upload New Exam" to create your first exam.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Separate component for each exam card to efficiently use the useIsExamAvailable hook
function ExamCard({
  exam,
  onStatusChange,
  isUpdating,
  router,
}: {
  exam: {
    id: bigint;
    title: string;
    startTime: bigint;
    duration: bigint;
    isActive: boolean | undefined;
  };
  onStatusChange: (examId: bigint, currentStatus: boolean) => Promise<void>;
  isUpdating: boolean;
  router: ReturnType<typeof useRouter>;
}) {
  // Get the actual availability status from the blockchain
  const { data: isAvailable, isLoading: availabilityLoading } =
    useIsExamAvailable(exam.id);

  const formatDate = (timestamp: bigint) => {
    return new Date(Number(timestamp) * 1000).toLocaleString();
  };

  const formatDuration = (seconds: bigint) => {
    const hours = Math.floor(Number(seconds) / 3600);
    const minutes = Math.floor((Number(seconds) % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
      <div className="p-5">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-semibold text-gray-800 truncate">
            {exam.title}
          </h2>
          {availabilityLoading ? (
            <span className="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-600">
              Loading...
            </span>
          ) : (
            <span
              className={`px-2 py-1 rounded text-xs font-medium ${
                isAvailable
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {isAvailable ? "Active" : "Inactive"}
            </span>
          )}
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">ID:</span>
            <span className="text-sm font-medium text-gray-700">
              {exam.id.toString()}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Start Time:</span>
            <span className="text-sm font-medium text-gray-700">
              {formatDate(exam.startTime)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Duration:</span>
            <span className="text-sm font-medium text-gray-700">
              {formatDuration(exam.duration)}
            </span>
          </div>
        </div>

        <div className="flex justify-between items-center pt-4 border-t border-gray-200">
          <button
            onClick={() =>
              isAvailable !== undefined && onStatusChange(exam.id, isAvailable)
            }
            disabled={
              isUpdating || availabilityLoading || isAvailable === undefined
            }
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              isAvailable
                ? "bg-red-600 hover:bg-red-700 text-white"
                : "bg-green-600 hover:bg-green-700 text-white"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isUpdating
              ? "Updating..."
              : availabilityLoading
              ? "Loading..."
              : isAvailable
              ? "Deactivate Exam"
              : "Activate Exam"}
          </button>
        </div>
      </div>
    </div>
  );
}
