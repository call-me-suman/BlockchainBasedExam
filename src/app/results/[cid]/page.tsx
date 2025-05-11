"use client";
import React, { useEffect, useState } from "react";

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
  questions: string;
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
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-400"></div>
        <p className="ml-3 text-lg text-blue-300">Loading exam results...</p>
      </div>
    );
  }

  // Show error state
  if (error || !examResult) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center p-8 bg-black/40 backdrop-blur-md rounded-lg shadow-xl border border-gray-800">
          <p className="text-xl text-red-400 mb-4">
            {error || "Error loading exam results"}
          </p>
          <button
            onClick={() => (window.location.href = "/")}
            className="bg-blue-500 bg-opacity-70 hover:bg-opacity-100 text-white px-4 py-2 rounded-lg transition duration-300 shadow-lg shadow-blue-500/20"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  // Determine the color for the score display
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-400";
    if (score >= 60) return "text-blue-400";
    if (score >= 40) return "text-yellow-400";
    return "text-red-400";
  };

  return (
    <div className="min-h-screen bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-black/30 backdrop-blur-lg rounded-xl shadow-2xl overflow-hidden mb-8 border border-blue-900/40">
          <div className="px-6 py-4 bg-gradient-to-r from-blue-800/70 to-blue-600/70 text-white">
            <h1 className="text-2xl font-bold">Exam Result Dashboard</h1>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column - Exam Details */}
              <div>
                <h2 className="text-xl font-semibold mb-4 text-white">
                  {examResult.examTitle}
                </h2>
                <div className="space-y-3 text-gray-300">
                  <p>
                    <span className="font-medium text-blue-300">Exam ID:</span>{" "}
                    <span className="font-mono">{examResult.examId}</span>
                  </p>
                  <p>
                    <span className="font-medium text-blue-300">
                      Submitted:
                    </span>{" "}
                    {formatDate(examResult.submittedAt)}
                  </p>
                  <p>
                    <span className="font-medium text-blue-300">
                      Total Questions:
                    </span>{" "}
                    {examResult.totalQuestions}
                  </p>
                  <p>
                    <span className="font-medium text-blue-300">
                      Correct Answers:
                    </span>{" "}
                    {examResult.correctAnswers}
                  </p>
                </div>
              </div>

              {/* Right Column - Score */}
              <div className="flex flex-col items-center justify-center">
                <div className="w-40 h-40 rounded-full border-4 border-blue-500/20 bg-black/40 backdrop-blur-md flex items-center justify-center mb-4 shadow-lg shadow-blue-500/10">
                  <div className="text-center">
                    <p
                      className={`text-4xl font-bold ${getScoreColor(
                        examResult.score
                      )}`}
                    >
                      {Math.round(examResult.score)}%
                    </p>
                    <p className="text-sm text-gray-400">Score</p>
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-lg font-medium text-gray-300">
                    {examResult.correctAnswers} out of{" "}
                    {examResult.totalQuestions} correct
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Question Review */}
        <div className="bg-black/30 backdrop-blur-lg rounded-xl shadow-2xl overflow-hidden border border-blue-900/40">
          <div className="px-6 py-4 bg-gradient-to-r from-blue-800/70 to-blue-600/70 text-white">
            <h2 className="text-xl font-bold">Question Review</h2>
          </div>
          <div className="p-6">
            <div className="space-y-8">
              {examResult.studentAnswers.map((answer, index) => (
                <div
                  key={index}
                  className={`p-5 rounded-xl backdrop-blur-sm ${
                    answer.isCorrect
                      ? "bg-emerald-900/20 border border-emerald-800/40"
                      : "bg-red-900/20 border border-red-800/40"
                  }`}
                >
                  <div className="flex items-start mb-4">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                        answer.isCorrect
                          ? "bg-emerald-500/30 text-emerald-400"
                          : "bg-red-500/30 text-red-400"
                      }`}
                    >
                      {answer.isCorrect ? "✓" : "✗"}
                    </div>
                    <h3 className="text-lg font-medium text-white">
                      Question {answer.questionIndex + 1}: {answer.question}
                    </h3>
                  </div>

                  <div className="ml-11 space-y-3">
                    {answer.options.map((option, optIndex) => {
                      const letter = String.fromCharCode(65 + optIndex); // A, B, C, D
                      const isSelected = answer.selectedAnswer === letter;
                      const isCorrectAnswer = letter === answer.correctAnswer;

                      return (
                        <div
                          key={optIndex}
                          className={`p-3 rounded-lg backdrop-blur-sm ${
                            isSelected && isCorrectAnswer
                              ? "bg-emerald-500/20 border border-emerald-500/40"
                              : isSelected && !isCorrectAnswer
                              ? "bg-red-500/20 border border-red-500/40"
                              : !isSelected && isCorrectAnswer
                              ? "bg-emerald-500/10 border border-emerald-500/30"
                              : "bg-gray-800/40 border border-gray-700/40"
                          }`}
                        >
                          <span className="font-bold mr-2 text-blue-300">
                            {letter}.
                          </span>
                          <span className="text-gray-300">{option}</span>
                          {isSelected && (
                            <span className="ml-2 font-medium text-blue-300">
                              (Your answer)
                            </span>
                          )}
                          {isCorrectAnswer && (
                            <span className="ml-2 text-emerald-400 font-medium">
                              (Correct answer)
                            </span>
                          )}
                        </div>
                      );
                    })}

                    {!answer.isCorrect && (
                      <div className="mt-4 p-3 rounded-lg bg-red-900/20 border border-red-800/40">
                        <p className="text-red-400">
                          Your answer: {answer.selectedAnswer || "Not answered"}
                        </p>
                        <p className="text-emerald-400">
                          Correct answer: {answer.correctAnswer}
                        </p>
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
            className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white px-6 py-2 rounded-lg transition duration-300 shadow-lg shadow-blue-500/20"
          >
            Return Home
          </button>
          <button
            onClick={() => window.print()}
            className="bg-gray-800/70 hover:bg-gray-700 text-gray-300 px-6 py-2 rounded-lg transition duration-300 shadow-lg"
          >
            Print Results
          </button>
        </div>
      </div>
    </div>
  );
}
