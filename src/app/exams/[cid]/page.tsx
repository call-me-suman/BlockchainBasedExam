"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { contract } from "../../../../utils/contract";
import { prepareContractCall } from "thirdweb";

import {
  useActiveAccount,
  useSendTransaction,
  useReadContract,
} from "thirdweb/react";

interface Question {
  question: string;
  options: string[];
  correctAnswer: string;
}

interface ExamData {
  examTitle: string;
  examId?: bigint; // Made examId optional
  startTime: number;
  duration: number;
  questions: Question[];
}

// Define the type for the data returned from the blockchain
type BlockchainExamsData = [
  bigint[], // examIds
  string[], // titles
  bigint[], // startTimes
  bigint[], // durations
  boolean[] // activeStatus
];

// Initialize Thirdweb client outside the component

// Function to get all exams with proper type annotations
export const useGetAllExams = () => {
  return useReadContract({
    contract,
    method:
      "function getAllExams() view returns (uint256[] examIds, string[] titles, uint256[] startTimes, uint256[] durations, bool[] activeStatus)",
    params: [],
  });
};

export default function ExamPage({
  params,
}: {
  params: { cid: string } | Promise<{ cid: string }>;
}) {
  const router = useRouter();

  // Use the hook inside the component

  // Use the hook to get all exams
  const { data: allExamsData, isLoading: isLoadingExams } = useGetAllExams();

  const [cid, setCid] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [examData, setExamData] = useState<ExamData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<{
    [key: number]: string;
  }>({});
  const [examSubmitted, setExamSubmitted] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [submissionStatus, setSubmissionStatus] = useState<string | null>(null);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const account = useActiveAccount();

  // Add this flag to prevent infinite loop
  const [examIdUpdated, setExamIdUpdated] = useState(false);

  // Get the sendTransaction hook
  const { mutate: sendTransaction, isPending } = useSendTransaction();

  // Handle async params
  useEffect(() => {
    const resolveParams = async () => {
      try {
        const resolvedParams = await Promise.resolve(params);
        setCid(resolvedParams.cid);
      } catch (err) {
        console.error("Error resolving params:", err);
        setError("Failed to load exam parameters");
        setLoading(false);
      }
    };

    resolveParams();
  }, [params]);

  // Fetch exam data when cid is available
  useEffect(() => {
    if (!cid) return;

    const fetchExam = async () => {
      try {
        const response = await fetch(`/api/exams/${cid}`);
        if (!response.ok) {
          throw new Error("Failed to load exam");
        }

        const data = await response.json();
        console.log("Fetched exam data:", data);

        // Set the exam data initially without examId
        setExamData(data);

        // Calculate time remaining
        const currentTime = Math.floor(Date.now() / 1000);
        const examEndTime = data.startTime + data.duration;

        if (currentTime < data.startTime) {
          setError("This exam has not started yet");
        } else if (currentTime > examEndTime) {
          setError("This exam has ended");
        } else {
          setTimeRemaining(examEndTime - currentTime);
        }
      } catch (err) {
        console.error("Error fetching exam:", err);
        setError("Failed to load exam data");
      } finally {
        setLoading(false);
      }
    };

    fetchExam();
  }, [cid]);

  // Find the exam ID by title once we have both exam data and all exams data
  // Add a flag to prevent infinite loop
  useEffect(() => {
    if (!examData || !allExamsData || isLoadingExams || examIdUpdated) return;

    try {
      console.log("All exams data:", allExamsData);

      // Cast the returned data to the array of arrays format
      const examsArrays = allExamsData as unknown as BlockchainExamsData;

      // Extract the arrays we need
      const [examIds, titles] = examsArrays;
      const examTitle = examData.examTitle;
      console.log("Looking for exam title:", examTitle);
      console.log("Available titles:", titles);

      // Find the index of the exam with matching title
      const examIndex = titles.findIndex((title) => title === examTitle);

      if (examIndex !== -1) {
        const foundExamId = examIds[examIndex];
        console.log(`Found exam ID for "${examTitle}": ${foundExamId}`);

        // Update examData with the found examId
        setExamData((prevData) => ({
          ...prevData!,
          examId: foundExamId,
        }));

        // Set flag to prevent this effect from running again
        setExamIdUpdated(true);
      } else {
        console.error(
          `Exam with title "${examTitle}" not found in the blockchain data`
        );
        setError("Could not find exam ID for this exam");
      }
    } catch (err) {
      console.error("Error finding exam ID:", err);
      setError("Failed to retrieve exam ID");
    }
  }, [examData, allExamsData, isLoadingExams, examIdUpdated]);

  // Timer for exam duration
  useEffect(() => {
    if (timeRemaining === null || timeRemaining <= 0 || examSubmitted) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(timer);
          handleSubmitExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining, examSubmitted]);

  const handleAnswerSelect = (questionIndex: number, answer: string) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionIndex]: answer,
    }));
  };

  const handleSubmitExam = async () => {
    if (!examData) return;

    // Check if we have a valid examId
    if (!examData.examId) {
      setSubmissionError(
        "Exam ID not found. Please wait for exam data to load fully."
      );
      setSubmissionStatus("Submission failed");
      return;
    }

    setSubmissionStatus("Processing submission...");

    try {
      // Calculate score and prepare results
      let correctAnswers = 0;
      const studentAnswers = examData.questions.map((question, index) => {
        const selectedAnswer = selectedAnswers[index] || "";
        const isCorrect = selectedAnswer === question.correctAnswer;

        if (isCorrect) {
          correctAnswers++;
        }

        return {
          questionIndex: index,
          question: question.question,
          options: question.options,
          correctAnswer: question.correctAnswer,
          selectedAnswer: selectedAnswer,
          isCorrect: isCorrect,
        };
      });

      const finalScore = (correctAnswers / examData.questions.length) * 100;
      setScore(finalScore);

      // Create the exam result JSON
      // Convert BigInt to string to make it serializable
      const examResult = {
        examId: examData.examId.toString(), // Convert BigInt to string
        examTitle: examData.examTitle,
        studentAnswers: studentAnswers,
        score: finalScore,
        totalQuestions: examData.questions.length,
        correctAnswers: correctAnswers,
        submittedAt: Math.floor(Date.now() / 1000),
        graceMarks: {
          enabled: false,
          questions: [],
          points: 0,
        },
      };

      // Upload exam result to IPFS
      setSubmissionStatus("Uploading results to IPFS...");
      const ipfsResponse = await fetch("/api/exams", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(examResult),
      });

      if (!ipfsResponse.ok) {
        throw new Error("Failed to upload results to IPFS");
      }

      const result = await ipfsResponse.json();

      // Submit the CID to blockchain
      setSubmissionStatus("Recording results on blockchain...");

      console.log(
        "Preparing to send transaction with examId:",
        examData.examId,
        "and CID:",
        result.cid
      );

      const transaction = prepareContractCall({
        contract,
        method: "function submitAnswers(uint256 examId, string answerHash)",
        params: [examData.examId, result.cid],
      });

      await sendTransaction(transaction);
      setSubmissionStatus("Please confirm the transaction in MetaMask...");
    } catch (err) {
      console.error("Error submitting exam:", err);
      setSubmissionError(
        `Failed to submit exam: ${
          err instanceof Error ? err.message : "Unknown error"
        }`
      );
      setSubmissionStatus("Submission failed");
    }
  };

  // Add this effect to watch for transaction completion
  useEffect(() => {
    if (
      !isPending &&
      submissionStatus === "Please confirm the transaction in MetaMask..."
    ) {
      // Transaction completed or was rejected
      setSubmissionStatus("Submission complete!");
      setExamSubmitted(true);
    }
  }, [isPending]);

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  // Show loading state for both the exam data and exam IDs
  if (loading || isLoadingExams) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl">Loading exam...</p>
      </div>
    );
  }

  if (error || !examData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-red-600 mb-4">
            {error || "Error loading exam"}
          </p>
          <button
            onClick={() => router.push("/")}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  if (submissionStatus && !examSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl mb-4">{submissionStatus}</p>
          {submissionError && (
            <p className="text-red-600 mb-4">{submissionError}</p>
          )}
        </div>
      </div>
    );
  }

  if (examSubmitted) {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-2xl mx-auto bg-white rounded shadow-md p-6">
          <h1 className="text-2xl font-bold mb-6">
            {examData.examTitle} - Results
          </h1>

          <div className="mb-6 p-4 bg-blue-50 rounded">
            <p className="text-xl mb-2">
              Your Score:{" "}
              <span className="font-bold">{score?.toFixed(2)}%</span>
            </p>
            <p>
              Correct answers:{" "}
              {
                examData.questions.filter(
                  (_, index) =>
                    selectedAnswers[index] ===
                    examData.questions[index].correctAnswer
                ).length
              }{" "}
              out of {examData.questions.length}
            </p>
            <p className="mt-2 text-sm text-green-600">
              Your results have been securely stored on the blockchain.
            </p>
          </div>

          <h2 className="text-xl font-bold mb-4">Review</h2>

          {examData.questions.map((question, index) => {
            const isCorrect = selectedAnswers[index] === question.correctAnswer;

            return (
              <div
                key={index}
                className={`mb-6 p-4 rounded ${
                  isCorrect ? "bg-green-50" : "bg-red-50"
                }`}
              >
                <p className="font-bold mb-2">
                  Question {index + 1}: {question.question}
                </p>

                <div className="mb-2">
                  {question.options.map((option, optIndex) => {
                    const letter = String.fromCharCode(65 + optIndex); // A, B, C, D
                    const isSelected = selectedAnswers[index] === letter;
                    const isCorrectAnswer = letter === question.correctAnswer;

                    return (
                      <div
                        key={optIndex}
                        className={`flex items-center p-1 ${
                          isSelected && isCorrectAnswer
                            ? "bg-green-200"
                            : isSelected && !isCorrectAnswer
                            ? "bg-red-200"
                            : !isSelected && isCorrectAnswer
                            ? "bg-green-100"
                            : ""
                        }`}
                      >
                        <span className="font-bold mr-2">{letter}.</span>
                        <span>{option}</span>
                      </div>
                    );
                  })}
                </div>

                {!isCorrect && (
                  <p className="text-sm text-red-600 mt-2">
                    Your answer: {selectedAnswers[index] || "Not answered"}
                    <br />
                    Correct answer: {question.correctAnswer}
                  </p>
                )}
              </div>
            );
          })}

          <button
            onClick={() => router.push("/")}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-2xl mx-auto bg-white rounded shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">{examData.examTitle}</h1>
          {timeRemaining !== null && (
            <div className="bg-gray-100 px-4 py-2 rounded-lg">
              <p className="font-bold">
                Time remaining: {formatTime(timeRemaining)}
              </p>
            </div>
          )}
        </div>

        <div className="mb-4 p-2 bg-blue-50 rounded">
          <p className="text-sm">
            Exam ID:{" "}
            {examData.examId ? examData.examId.toString() : "Loading..."}
          </p>
        </div>

        {examData.questions.map((question, qIndex) => (
          <div key={qIndex} className="mb-8 pb-4 border-b">
            <p className="font-bold mb-3">
              Question {qIndex + 1}: {question.question}
            </p>

            <div className="space-y-2">
              {question.options.map((option, oIndex) => {
                const letter = String.fromCharCode(65 + oIndex); // A, B, C, D
                return (
                  <div key={oIndex} className="flex items-center">
                    <input
                      type="radio"
                      id={`q${qIndex}-${letter}`}
                      name={`question-${qIndex}`}
                      value={letter}
                      checked={selectedAnswers[qIndex] === letter}
                      onChange={() => handleAnswerSelect(qIndex, letter)}
                      className="mr-2"
                    />
                    <label htmlFor={`q${qIndex}-${letter}`} className="flex-1">
                      <span className="font-bold mr-2">{letter}.</span>
                      {option}
                    </label>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        <button
          onClick={handleSubmitExam}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          disabled={!examData.examId}
        >
          Submit Exam
        </button>
      </div>
    </div>
  );
}
