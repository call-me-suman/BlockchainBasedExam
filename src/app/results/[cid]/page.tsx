"use client";
import React, { useEffect, useState } from "react";
import { useSendTransaction } from "thirdweb/react";

interface QuestionResult {
  questionIndex: number;
  question: string;
  options: string[];
  correctAnswer: string;
  selectedAnswer: string;
  isCorrect: boolean;
}

interface GraceMarks {
  enabled: boolean;
  questions: any[];
  points: number;
}

interface ExamResult {
  examId: string;
  examTitle: string;
  studentAnswers: QuestionResult[];
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  submittedAt: number;
  graceMarks: GraceMarks;
}

export default function ResultPage({
  params,
}: {
  params: { cid: string } | Promise<{ cid: string }>;
}) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [cid, setCid] = useState<string | null>(null);
  const [examResult, setExamResult] = useState<ExamResult | null>(null);

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
        setLoading(true);
        const response = await fetch(`/api/exams/${cid}`);
        if (!response.ok) {
          throw new Error("Failed to load exam results");
        }

        const data = await response.json();
        console.log("Fetched exam data:", data);
        setExamResult(data);
      } catch (err) {
        console.error("Error fetching exam results:", err);
        setError("Failed to load exam results");
      } finally {
        setLoading(false);
      }
    };

    fetchExam();
  }, [cid]);

  // Format the timestamp to a readable date
  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <p className="ml-3 text-lg">Loading exam results...</p>
      </div>
    );
  }

  // Show error state
  if (error || !examResult) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-md">
          <p className="text-xl text-red-600 mb-4">
            {error || "Error loading exam results"}
          </p>
          <button
            onClick={() => (window.location.href = "/")}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  // Determine the color for the score display
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-blue-600";
    if (score >= 40) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <div className="px-6 py-4 bg-blue-600 text-white">
            <h1 className="text-2xl font-bold">Exam Result Dashboard</h1>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column - Exam Details */}
              <div>
                <h2 className="text-xl font-semibold mb-4">
                  {examResult.examTitle}
                </h2>
                <div className="space-y-2 text-gray-700">
                  <p>
                    <span className="font-medium">Exam ID:</span>{" "}
                    {examResult.examId}
                  </p>
                  <p>
                    <span className="font-medium">Submitted:</span>{" "}
                    {formatDate(examResult.submittedAt)}
                  </p>
                  <p>
                    <span className="font-medium">Total Questions:</span>{" "}
                    {examResult.totalQuestions}
                  </p>
                  <p>
                    <span className="font-medium">Correct Answers:</span>{" "}
                    {examResult.correctAnswers}
                  </p>
                </div>
              </div>

              {/* Right Column - Score */}
              <div className="flex flex-col items-center justify-center">
                <div className="w-40 h-40 rounded-full border-8 border-gray-200 flex items-center justify-center mb-4">
                  <div className="text-center">
                    <p
                      className={`text-3xl font-bold ${getScoreColor(
                        examResult.score
                      )}`}
                    >
                      {Math.round(examResult.score)}%
                    </p>
                    <p className="text-sm text-gray-500">Score</p>
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-lg font-medium">
                    {examResult.correctAnswers} out of{" "}
                    {examResult.totalQuestions} correct
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Question Review */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 bg-blue-600 text-white">
            <h2 className="text-xl font-bold">Question Review</h2>
          </div>
          <div className="p-6">
            <div className="space-y-8">
              {examResult.studentAnswers.map((answer, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg ${
                    answer.isCorrect ? "bg-green-50" : "bg-red-50"
                  }`}
                >
                  <div className="flex items-start mb-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                        answer.isCorrect
                          ? "bg-green-100 text-green-600"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      {answer.isCorrect ? "✓" : "✗"}
                    </div>
                    <h3 className="text-lg font-medium">
                      Question {answer.questionIndex + 1}: {answer.question}
                    </h3>
                  </div>

                  <div className="ml-11 space-y-2">
                    {answer.options.map((option, optIndex) => {
                      const letter = String.fromCharCode(65 + optIndex); // A, B, C, D
                      const isSelected = answer.selectedAnswer === letter;
                      const isCorrectAnswer = letter === answer.correctAnswer;

                      return (
                        <div
                          key={optIndex}
                          className={`p-2 rounded ${
                            isSelected && isCorrectAnswer
                              ? "bg-green-200"
                              : isSelected && !isCorrectAnswer
                              ? "bg-red-200"
                              : !isSelected && isCorrectAnswer
                              ? "bg-green-100"
                              : "bg-gray-100"
                          }`}
                        >
                          <span className="font-bold mr-2">{letter}.</span>
                          <span>{option}</span>
                          {isSelected && (
                            <span className="ml-2 font-medium">
                              (Your answer)
                            </span>
                          )}
                          {isCorrectAnswer && (
                            <span className="ml-2 text-green-600 font-medium">
                              (Correct answer)
                            </span>
                          )}
                        </div>
                      );
                    })}

                    {!answer.isCorrect && (
                      <div className="mt-3 text-red-600">
                        <p>
                          Your answer: {answer.selectedAnswer || "Not answered"}
                        </p>
                        <p>Correct answer: {answer.correctAnswer}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="mt-8 flex justify-center space-x-4">
          <button
            onClick={() => (window.location.href = "/")}
            className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
          >
            Return Home
          </button>
          <button
            onClick={() => window.print()}
            className="bg-gray-200 text-gray-800 px-6 py-2 rounded hover:bg-gray-300"
          >
            Print Results
          </button>
        </div>
      </div>
    </div>
  );
}
