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

  // Add status filter state
  const [statusFilter, setStatusFilter] = useState<string>("all");

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

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">
            Exam Admin Dashboard
          </h1>
          <button
            onClick={navigateToUpload}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow"
          >
            Upload New Exam
          </button>
        </div>

        {/* Filter controls */}
        <div className="mb-6">
          <div className="bg-gray-900 p-4 rounded-lg shadow-sm border border-black">
            <h2 className="text-lg font-medium text-white mb-3">Filters</h2>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setStatusFilter("all")}
                className={`px-3 py-1.5 rounded-md text-sm font-medium ${
                  statusFilter === "all"
                    ? "bg-blue-100 text-blue-800 border-2 border-blue-300"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                }`}
              >
                All Exams
              </button>
              <button
                onClick={() => setStatusFilter("in-progress")}
                className={`px-3 py-1.5 rounded-md text-sm font-medium ${
                  statusFilter === "in-progress"
                    ? "bg-green-100 text-green-800 border-2 border-green-300"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                }`}
              >
                In Progress
              </button>
              <button
                onClick={() => setStatusFilter("scheduled")}
                className={`px-3 py-1.5 rounded-md text-sm font-medium ${
                  statusFilter === "scheduled"
                    ? "bg-blue-100 text-blue-800 border-2 border-blue-300"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                }`}
              >
                Scheduled
              </button>
              <button
                onClick={() => setStatusFilter("expired")}
                className={`px-3 py-1.5 rounded-md text-sm font-medium ${
                  statusFilter === "expired"
                    ? "bg-yellow-100 text-yellow-800 border-2 border-yellow-300"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                }`}
              >
                Expired
              </button>
              <button
                onClick={() => setStatusFilter("not-available")}
                className={`px-3 py-1.5 rounded-md text-sm font-medium ${
                  statusFilter === "not-available"
                    ? "bg-red-100 text-red-800 border-2 border-red-300"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                }`}
              >
                Not Available
              </button>
              <button
                onClick={() => setStatusFilter("completed")}
                className={`px-3 py-1.5 rounded-md text-sm font-medium ${
                  statusFilter === "completed"
                    ? "bg-purple-100 text-purple-800 border-2 border-purple-300"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                }`}
              >
                Completed
              </button>
            </div>
          </div>
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
                  statusFilter={statusFilter}
                />
              ))
            ) : (
              <div className="col-span-full bg-gray-50 p-8 rounded-lg text-center">
                <p className="text-lg text-gray-600">No exams found.</p>
                <p className="text-gray-500 mt-2">
                  Click &quot;Upload New Exam&quot; to create your first exam.
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
  statusFilter,
}: {
  exam: {
    id: bigint;
    title: string;
    startTime: bigint;
    duration: bigint;
    isActive: boolean | undefined;
  };
  onStatusChange: (
    examId: bigint,
    currentStatus: boolean,
    examTitle: string
  ) => Promise<void>;
  isUpdating: boolean;
  statusFilter: string;
}) {
  // Get the actual availability status from the blockchain
  const { data: isAvailable, isLoading: availabilityLoading } =
    useIsExamAvailable(exam.id);

  // Determine the current time and exam end time for status calculation
  const currentTime = Math.floor(Date.now() / 1000);
  const examStartTime = Number(exam.startTime);
  const examEndTime = examStartTime + Number(exam.duration);

  // Determine more detailed status
  const getStatusDetails = () => {
    if (isAvailable === undefined)
      return {
        label: "Unknown",
        colorClasses: "bg-gray-800/30 text-gray-300",
        statusKey: "unknown",
        glowColor: "rgba(75, 85, 99, 0.3)",
      };

    if (isAvailable) {
      // Active but may be in different states
      if (currentTime < examStartTime) {
        return {
          label: "Scheduled",
          colorClasses: "bg-blue-900/30 text-blue-300",
          statusKey: "scheduled",
          glowColor: "rgba(59, 130, 246, 0.3)",
        };
      } else if (currentTime >= examStartTime && currentTime <= examEndTime) {
        return {
          label: "In Progress",
          colorClasses: "bg-green-900/30 text-green-300",
          statusKey: "in-progress",
          glowColor: "rgba(16, 185, 129, 0.3)",
        };
      } else {
        return {
          label: "Completed",
          colorClasses: "bg-purple-900/30 text-purple-300",
          statusKey: "completed",
          glowColor: "rgba(124, 58, 237, 0.3)",
        };
      }
    } else {
      // Not active
      if (currentTime > examEndTime) {
        return {
          label: "Expired",
          colorClasses: "bg-yellow-900/30 text-yellow-300",
          statusKey: "expired",
          glowColor: "rgba(245, 158, 11, 0.3)",
        };
      } else {
        return {
          label: "Not Available",
          colorClasses: "bg-red-900/30 text-red-300",
          statusKey: "not-available",
          glowColor: "rgba(239, 68, 68, 0.3)",
        };
      }
    }
  };

  const status = getStatusDetails();

  // Check if this card should be displayed based on the filter
  if (statusFilter !== "all" && status.statusKey !== statusFilter) {
    return null; // Don't render this card if it doesn't match the filter
  }

  // Check if the activate/deactivate button should be disabled
  const isButtonDisabled = () => {
    if (isUpdating || availabilityLoading || isAvailable === undefined) {
      return true;
    }

    // Disable for expired exams
    if (currentTime > examEndTime) {
      return true;
    }

    // Disable activation if not within valid time range (can still deactivate)
    if (
      !isAvailable &&
      (currentTime < examStartTime || currentTime > examEndTime)
    ) {
      return true;
    }

    return false;
  };

  const formatDate = (timestamp: bigint) => {
    return new Date(Number(timestamp) * 1000).toLocaleString();
  };

  const formatDuration = (seconds: bigint) => {
    const hours = Math.floor(Number(seconds) / 3600);
    const minutes = Math.floor((Number(seconds) % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  // Get button text with context
  const getButtonText = () => {
    if (isUpdating) return "Updating...";
    if (availabilityLoading) return "Loading...";

    if (isAvailable) {
      return "Deactivate Exam";
    } else {
      if (currentTime > examEndTime) {
        return "Exam Expired";
      } else if (currentTime < examStartTime || currentTime > examEndTime) {
        return "Outside Schedule";
      } else {
        return "Activate Exam";
      }
    }
  };

  // Log when exam details are viewed

  // Get button style classes based on availability
  const getButtonClasses = () => {
    const baseClasses =
      "px-4 py-2 rounded-md text-sm font-medium backdrop-blur-sm transition-all duration-300 border disabled:opacity-50 disabled:cursor-not-allowed";

    if (isAvailable) {
      return `${baseClasses} text-red-300  hover:shadow-lg hover:shadow-red-900/20`;
    } else {
      return `${baseClasses}  text-green-300  hover:shadow-lg hover:shadow-green-900/20`;
    }
  };

  return (
    <div
      className="rounded-xl overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
      style={{
        background: `linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))`,
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
      }}
    >
      <div className="p-5">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-semibold text-white truncate">
            {exam.title}
          </h2>
          {availabilityLoading ? (
            <span className="px-2 py-1 rounded text-xs font-medium bg-gray-800/30 text-gray-300">
              Loading...
            </span>
          ) : (
            <span
              className={`px-2 py-1 rounded text-xs font-medium backdrop-blur-sm ${status.colorClasses} border border-white/10`}
            >
              {status.label}
            </span>
          )}
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex justify-between">
            <span className="text-sm text-gray-400">ID:</span>
            <span className="text-sm font-medium text-gray-200">
              {exam.id.toString()}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-400">Start Time:</span>
            <span className="text-sm font-medium text-gray-200">
              {formatDate(exam.startTime)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-400">Duration:</span>
            <span className="text-sm font-medium text-gray-200">
              {formatDuration(exam.duration)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-400">End Time:</span>
            <span className="text-sm font-medium text-gray-200">
              {formatDate(BigInt(examStartTime + Number(exam.duration)))}
            </span>
          </div>
        </div>

        <div className="flex justify-between items-center pt-4 border-t border-white/10">
          <button
            onClick={() =>
              isAvailable !== undefined &&
              onStatusChange(exam.id, isAvailable, exam.title)
            }
            disabled={isButtonDisabled()}
            className={getButtonClasses()}
            title={
              isButtonDisabled() && !isUpdating && !availabilityLoading
                ? "This exam can't be modified because it has expired or is outside its scheduled time"
                : ""
            }
          >
            {getButtonText()}
          </button>
        </div>
      </div>
    </div>
  );
}
