"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Question {
  question: string;
  options: string[];
  correctAnswer: string;
}

interface ExamData {
  examTitle: string;
  startTime: number;
  duration: number;
  questions: Question[];
}

export default function ExamPage({
  params,
}: {
  params: { cid: string } | Promise<{ cid: string }>;
}) {
  const router = useRouter();

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

  // Timer for exam duration
  useEffect(() => {
    if (timeRemaining === null || timeRemaining <= 0 || examSubmitted) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(timer);
          submitExam();
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

  const submitExam = () => {
    if (!examData) return;

    let correctAnswers = 0;

    examData.questions.forEach((question, index) => {
      if (selectedAnswers[index] === question.correctAnswer) {
        correctAnswers++;
      }
    });

    const finalScore = (correctAnswers / examData.questions.length) * 100;
    setScore(finalScore);
    setExamSubmitted(true);
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  if (loading) {
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
      <div className="max-w-2xl mx-auto bg-black rounded shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">{examData.examTitle}</h1>
          {timeRemaining !== null && (
            <div className="bg-black-100 px-4 py-2 rounded-lg">
              <p className="font-bold">
                Time remaining: {formatTime(timeRemaining)}
              </p>
            </div>
          )}
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
          onClick={submitExam}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Submit Exam
        </button>
      </div>
    </div>
  );
}
