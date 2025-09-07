"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  createThirdwebClient,
  defineChain,
  getContract,
  prepareContractCall,
} from "thirdweb";
import { useSendTransaction, useReadContract } from "thirdweb/react";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import { getExamContract } from "../../../../utils/blockchain";

// =============================
// Types & Constants
// =============================
interface Question {
  question: string;
  options: string[];
  correctAnswer: string;
}

interface ExamData {
  examTitle: string;
  examId?: bigint;
  startTime: number;
  duration: number;
  questions: Question[];
}

type BlockchainExamsData = [bigint[], string[], bigint[], bigint[], boolean[]];

// const client = createThirdwebClient({
//   clientId: `${process.env.NEXT_PUBLIC_CLIENT_ID}`,
// });
const contract = getExamContract();

// =============================
// Hooks
// =============================
export const useGetAllExams = () => {
  return useReadContract({
    contract,
    method:
      "function getAllExams() view returns (uint256[] examIds, string[] titles, uint256[] startTimes, uint256[] durations, bool[] activeStatus)",
    params: [],
  });
};

function useFullscreen() {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const enterFullscreen = useCallback(async () => {
    try {
      const elem = document.documentElement;
      if (elem.requestFullscreen) {
        await elem.requestFullscreen();
      } else if ((elem as any).webkitRequestFullscreen) {
        await (elem as any).webkitRequestFullscreen();
      } else if ((elem as any).msRequestFullscreen) {
        await (elem as any).msRequestFullscreen();
      }
      setIsFullscreen(true);
    } catch (err) {
      console.error("Error entering fullscreen:", err);
    }
  }, []);

  const exitFullscreen = useCallback(async () => {
    try {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      } else if ((document as any).webkitExitFullscreen) {
        await (document as any).webkitExitFullscreen();
      } else if ((document as any).msExitFullscreen) {
        await (document as any).msExitFullscreen();
      }
      setIsFullscreen(false);
    } catch (err) {
      console.error("Error exiting fullscreen:", err);
    }
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      const active = !!(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).msFullscreenElement
      );
      setIsFullscreen(active);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("msfullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener(
        "webkitfullscreenchange",
        handleFullscreenChange
      );
      document.removeEventListener(
        "msfullscreenchange",
        handleFullscreenChange
      );
    };
  }, []);

  return { isFullscreen, enterFullscreen, exitFullscreen };
}

// =============================
// Small UI Components
// =============================
function LoadingScreen({ text }: { text: string }) {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4" />
        <p className="text-xl text-gray-300 animate-pulse">{text}</p>
      </div>
    </div>
  );
}

function ErrorScreen({
  message,
  onBack,
}: {
  message: string;
  onBack: () => void;
}) {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-center bg-gray-800 p-8 rounded-2xl border border-gray-700 max-w-md mx-4">
        <div className="text-red-400 text-6xl mb-4">⚠️</div>
        <h2 className="text-2xl font-bold text-white mb-4">Exam Error</h2>
        <p className="text-lg text-red-400 mb-6">{message}</p>
        <button
          onClick={onBack}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105"
        >
          Return to Dashboard
        </button>
      </div>
    </div>
  );
}

function HeaderBar({
  examTitle,
  currentIndex,
  total,
  progress,
  timeRemaining,
  formatTime,
  isFullscreen,
  enterFullscreen,
  exitFullscreen,
}: {
  examTitle: string;
  currentIndex: number;
  total: number;
  progress: number;
  timeRemaining: number | null;
  formatTime: (s: number) => string;
  isFullscreen: boolean;
  enterFullscreen: () => void;
  exitFullscreen: () => void;
}) {
  return (
    <header className="bg-gray-800 border-b border-gray-700 fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center overflow-hidden">
              <Image
                src="/logo.jpg"
                alt="Exam Logo"
                width={48}
                height={48}
                className="object-contain"
              />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">{examTitle}</h1>
              <p className="text-sm text-gray-400">
                Question {currentIndex + 1} of {total}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-6">
            <button
              onClick={isFullscreen ? exitFullscreen : enterFullscreen}
              className="p-2 bg-gray-700 hover:bg-gray-600 rounded-xl text-gray-300 hover:text-white transition-all duration-200"
              title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
            >
              {isFullscreen ? (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 8V4m0 0h4M4 4l5 5m11-5V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v4m0 0h-4m4 0l-5-5"
                  />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 8h4V4M20 8h-4V4M4 16h4v4M20 16h-4v4"
                  />
                </svg>
              )}
            </button>

            <div className="hidden md:flex items-center space-x-3">
              <span className="text-sm text-gray-400">Progress:</span>
              <div className="w-32 bg-gray-700 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-sm font-semibold text-gray-300">
                {Math.round(progress)}%
              </span>
            </div>

            {timeRemaining !== null && (
              <div
                className={`px-4 py-2 rounded-xl font-bold ${
                  timeRemaining < 300
                    ? "bg-red-800/50 text-red-400 animate-pulse border border-red-600"
                    : timeRemaining < 900
                    ? "bg-yellow-800/50 text-yellow-400 border border-yellow-600"
                    : "bg-green-800/50 text-green-400 border border-green-600"
                }`}
              >
                <div className="flex items-center space-x-2">
                  <span>⏱️</span>
                  <span>{formatTime(timeRemaining)}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

function QuestionCard({
  question,
  index,
  selected,
  onSelect,
  answeredCount,
  total,
}: {
  question: Question;
  index: number;
  selected: string | undefined;
  onSelect: (letter: string) => void;
  answeredCount: number;
  total: number;
}) {
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-3xl shadow-xl p-8 mb-6 transform transition-all duration-300 hover:shadow-2xl">
      <div className="flex justify-between items-start mb-6">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-4">
            <span className="bg-blue-600 text-white px-4 py-2 rounded-xl font-bold">
              Q{index + 1}
            </span>
            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <span>
                {answeredCount} of {total} answered
              </span>
            </div>
          </div>
          <h2 className="text-2xl font-semibold text-white leading-relaxed">
            {question.question}
          </h2>
        </div>
      </div>

      <div className="space-y-4">
        {question.options.map((option, optIndex) => {
          const letter = String.fromCharCode(65 + optIndex);
          const isSelected = selected === letter;
          return (
            <label
              key={optIndex}
              className={`block p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 transform hover:scale-[1.02] ${
                isSelected
                  ? "border-blue-500 bg-blue-900/30 shadow-lg"
                  : "border-gray-600 bg-gray-700/30 hover:border-blue-400 hover:bg-blue-900/20"
              }`}
            >
              <div className="flex items-center space-x-4">
                <div
                  className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold transition-all duration-200 ${
                    isSelected
                      ? "border-blue-500 bg-blue-500 text-white"
                      : "border-gray-400 text-gray-300"
                  }`}
                >
                  {letter}
                </div>
                <input
                  type="radio"
                  name={`question-${index}`}
                  value={letter}
                  checked={isSelected}
                  onChange={() => onSelect(letter)}
                  className="sr-only"
                />
                <span className="text-lg text-gray-200 flex-1">{option}</span>
                {isSelected && (
                  <div className="text-blue-400 text-xl animate-pulse">✓</div>
                )}
              </div>
            </label>
          );
        })}
      </div>
    </div>
  );
}

function VoiceAssistant({
  status,
  listening,
  browserSupportsSpeechRecognition,
  onStart,
  onStop,
}: {
  status: string;
  listening: boolean;
  browserSupportsSpeechRecognition: boolean;
  onStart: () => void;
  onStop: () => void;
}) {
  return (
    <div className="bg-purple-900/20 border border-purple-600 rounded-2xl p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-purple-300 flex items-center">
          🎙️ Voice Assistant
        </h3>
        <div className="flex items-center space-x-2">
          {listening ? (
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm text-green-400 font-semibold">
                Active
              </span>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-gray-500 rounded-full" />
              <span className="text-sm text-gray-400">Inactive</span>
            </div>
          )}
        </div>
      </div>

      <p className="text-purple-200 mb-3">{status}</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
        <div className="bg-gray-700 p-2 rounded-lg text-center">
          <span className="font-semibold text-gray-200">"Option A"</span>
        </div>
        <div className="bg-gray-700 p-2 rounded-lg text-center">
          <span className="font-semibold text-gray-200">"Next"</span>
        </div>
        <div className="bg-gray-700 p-2 rounded-lg text-center">
          <span className="font-semibold text-gray-200">"Previous"</span>
        </div>
        <div className="bg-gray-700 p-2 rounded-lg text-center">
          <span className="font-semibold text-gray-200">"Submit"</span>
        </div>
      </div>

      <div className="flex justify-center mt-4">
        {!listening ? (
          <button
            onClick={onStart}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105"
            disabled={!browserSupportsSpeechRecognition}
          >
            Start Voice Commands
          </button>
        ) : (
          <button
            onClick={onStop}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105"
          >
            Stop Voice Commands
          </button>
        )}
      </div>
    </div>
  );
}

// =============================
// Page
// =============================
export default function ExamPage({
  params,
}: {
  params: { cid: string } | Promise<{ cid: string }>;
}) {
  const router = useRouter();
  const { isFullscreen, enterFullscreen, exitFullscreen } = useFullscreen();
  const { data: allExamsData, isLoading: isLoadingExams } = useGetAllExams();
  const {
    mutate: sendTransaction,
    isPending,
    error: transactionError,
  } = useSendTransaction();

  // core state
  const [cid, setCid] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [examData, setExamData] = useState<ExamData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<number, string>
  >({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [examSubmitted, setExamSubmitted] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [submissionStatus, setSubmissionStatus] = useState<string | null>(null);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [examIdUpdated, setExamIdUpdated] = useState(false);
  const [showWarning, setShowWarning] = useState(true);
  const [examStarted, setExamStarted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [transactionHash, setTransactionHash] = useState<string | null>(null);

  // speech
  const {
    transcript,
    resetTranscript,
    listening,
    browserSupportsSpeechRecognition,
    isMicrophoneAvailable,
  } = useSpeechRecognition({ commands: [] });
  const [voiceStatus, setVoiceStatus] = useState(
    "Voice recognition initializing..."
  );
  const [lastProcessedTranscript, setLastProcessedTranscript] = useState("");
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // initialize cid
  useEffect(() => {
    const initializeCid = async () => {
      try {
        const resolved = await Promise.resolve(params);
        setCid(resolved.cid);
      } catch (e) {
        console.error("Error initializing CID:", e);
        setError("Failed to initialize exam data");
      }
    };
    initializeCid();
  }, [params]);

  // proctor check (best-effort)
  useEffect(() => {
    const url = `${process.env.PROCTOR_URL}/check-screen`;
    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        if (data.status === "flagged")
          alert("⚠ Suspicious activity detected: " + data.reason);
      })
      .catch(() => {});
  }, []);

  const handleAnswerSelect = useCallback(
    (questionIndex: number, answer: string) => {
      setSelectedAnswers((prev) => ({ ...prev, [questionIndex]: answer }));
    },
    []
  );

  const navigateToQuestion = useCallback(
    (index: number) => {
      if (examData && index >= 0 && index < examData.questions.length)
        setCurrentQuestionIndex(index);
    },
    [examData]
  );

  const nextQuestion = useCallback(() => {
    if (examData && currentQuestionIndex < examData.questions.length - 1)
      setCurrentQuestionIndex((p) => p + 1);
  }, [examData, currentQuestionIndex]);

  const prevQuestion = useCallback(() => {
    if (currentQuestionIndex > 0) setCurrentQuestionIndex((p) => p - 1);
  }, [currentQuestionIndex]);

  const formatTime = useCallback((seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    if (hours > 0)
      return `${hours}:${minutes.toString().padStart(2, "0")}:${remainingSeconds
        .toString()
        .padStart(2, "0")}`;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  }, []);

  const handleSubmitExam = useCallback(async () => {
    if (!examData || !examData.examId || isSubmitting) {
      setSubmissionError(
        "Exam ID not found or submission already in progress."
      );
      return;
    }

    setIsSubmitting(true);
    setSubmissionStatus("Calculating score...");
    setSubmissionError(null);

    try {
      let correctAnswers = 0;
      const studentAnswers = examData.questions.map((q, index) => {
        const selected = selectedAnswers[index] || "";
        const isCorrect = selected === q.correctAnswer;
        if (isCorrect) correctAnswers++;
        return {
          questionIndex: index,
          question: q.question,
          options: q.options,
          correctAnswer: q.correctAnswer,
          selectedAnswer: selected,
          isCorrect,
        };
      });

      const finalScore = (correctAnswers / examData.questions.length) * 100;
      setScore(finalScore);

      setSubmissionStatus("Uploading results to IPFS...");
      const ipfsResponse = await fetch("/api/exams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          examId: examData.examId.toString(),
          examTitle: examData.examTitle,
          studentAnswers,
          score: finalScore,
          totalQuestions: examData.questions.length,
          correctAnswers,
          submittedAt: Math.floor(Date.now() / 1000),
          graceMarks: { enabled: false, questions: [], points: 0 },
        }),
      });
      if (!ipfsResponse.ok)
        throw new Error(
          `Failed to upload results: ${await ipfsResponse.text()}`
        );
      const result = await ipfsResponse.json();

      setSubmissionStatus("Please confirm the transaction in MetaMask...");
      const tx = prepareContractCall({
        contract,
        method: "function submitAnswers(uint256 examId, string answerHash)",
        params: [examData.examId, result.cid],
      });

      sendTransaction(tx, {
        onSuccess: (res) => {
          setTransactionHash(res.transactionHash);
          setSubmissionStatus(
            "Transaction confirmed! Processing completion..."
          );
          setTimeout(() => {
            setSubmissionStatus("Submission completed successfully!");
            setExamSubmitted(true);
            setIsSubmitting(false);
          }, 2000);
        },
        onError: (err) => {
          setSubmissionError(`Transaction failed: ${err.message}`);
          setSubmissionStatus("Transaction failed");
          setIsSubmitting(false);
        },
      });
    } catch (err: any) {
      setSubmissionError(`Submission failed: ${err.message || err}`);
      setSubmissionStatus("Submission failed");
      setIsSubmitting(false);
    }
  }, [examData, selectedAnswers, sendTransaction, isSubmitting]);

  // transcript processing with debounce
  const processVoiceCommand = useCallback(
    (command: string) => {
      if (!command || !examData || examSubmitted || !examStarted) return;
      if (command === lastProcessedTranscript) return;
      setLastProcessedTranscript(command);
      const lower = command.toLowerCase();
      if (lower.includes("option a") || lower.endsWith("a"))
        handleAnswerSelect(currentQuestionIndex, "A");
      else if (lower.includes("option b") || lower.endsWith("b"))
        handleAnswerSelect(currentQuestionIndex, "B");
      else if (lower.includes("option c") || lower.endsWith("c"))
        handleAnswerSelect(currentQuestionIndex, "C");
      else if (lower.includes("option d") || lower.endsWith("d"))
        handleAnswerSelect(currentQuestionIndex, "D");
      else if (lower.includes("next") || lower === "next") nextQuestion();
      else if (
        lower.includes("previous") ||
        lower === "previous" ||
        lower.includes("back")
      )
        prevQuestion();
      else if (lower.includes("submit") || lower === "submit")
        handleSubmitExam();
      else if (lower.includes("time") || lower === "time")
        if (timeRemaining !== null && timeRemaining > 0)
          setVoiceStatus(`⏱️ Time remaining: ${formatTime(timeRemaining)}`);
      setTimeout(() => resetTranscript(), 300);
    },
    [
      examData,
      examSubmitted,
      examStarted,
      lastProcessedTranscript,
      currentQuestionIndex,
      handleAnswerSelect,
      nextQuestion,
      prevQuestion,
      handleSubmitExam,
      timeRemaining,
      formatTime,
      resetTranscript,
    ]
  );

  useEffect(() => {
    if (!transcript || !listening || examSubmitted || !examStarted) return;
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(
      () => processVoiceCommand(transcript),
      500
    );
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [transcript, listening, examSubmitted, examStarted, processVoiceCommand]);

  // fetch exam data
  useEffect(() => {
    if (!cid) return;
    const fetchExam = async () => {
      try {
        const response = await fetch(`/api/exams/${cid}`);
        if (!response.ok) throw new Error("Failed to load exam");
        const data = await response.json();
        setExamData(data);
        const now = Math.floor(Date.now() / 1000);
        const end = data.startTime + data.duration;
        if (now < data.startTime) setError("This exam has not started yet");
        else if (now > end) setError("This exam has ended");
        else setTimeRemaining(end - now);
      } catch {
        setError("Failed to load exam data");
      } finally {
        setLoading(false);
      }
    };
    fetchExam();
  }, [cid]);

  // map exam title -> id from chain
  useEffect(() => {
    if (!examData || !allExamsData || isLoadingExams || examIdUpdated) return;
    try {
      const [examIds, titles] = allExamsData as BlockchainExamsData;
      const examIndex = titles.findIndex((t) => t === examData.examTitle);
      if (examIndex !== -1) {
        setExamData((prev) => ({ ...prev!, examId: examIds[examIndex] }));
        setExamIdUpdated(true);
      } else setError("Could not find exam ID for this exam");
    } catch {
      setError("Failed to retrieve exam ID");
    }
  }, [examData, allExamsData, isLoadingExams, examIdUpdated]);

  // countdown timer
  useEffect(() => {
    if (
      timeRemaining === null ||
      timeRemaining <= 0 ||
      examSubmitted ||
      !examStarted ||
      isSubmitting
    )
      return;
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(timer);
          if (!isSubmitting) handleSubmitExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [
    timeRemaining,
    examSubmitted,
    examStarted,
    handleSubmitExam,
    isSubmitting,
  ]);

  // surface transaction error
  useEffect(() => {
    if (transactionError && isSubmitting) {
      setSubmissionError(`Transaction failed: ${transactionError.message}`);
      setSubmissionStatus("Transaction failed");
      setIsSubmitting(false);
    }
  }, [transactionError, isSubmitting]);

  // voice status
  useEffect(() => {
    if (!browserSupportsSpeechRecognition)
      setVoiceStatus("❌ Voice recognition not supported");
    else if (!isMicrophoneAvailable)
      setVoiceStatus("🎤 Microphone access needed");
    else if (listening && examStarted)
      setVoiceStatus("🎙️ Listening for commands...");
    else setVoiceStatus("Voice recognition ready");
  }, [
    listening,
    browserSupportsSpeechRecognition,
    isMicrophoneAvailable,
    examStarted,
  ]);

  useEffect(() => {
    if (transcript && listening && examStarted)
      setVoiceStatus(`🎙️ Heard: "${transcript}"`);
  }, [transcript, listening, examStarted]);

  const startExam = () => {
    setShowWarning(false);
    setExamStarted(true);
    enterFullscreen();
  };

  const goToStudentDashboard = () => router.push("/student");

  // =============================
  // Render branches
  // =============================
  if (loading || isLoadingExams)
    return <LoadingScreen text="Loading your exam..." />;
  if (error || !examData)
    return (
      <ErrorScreen
        message={error || "Error loading exam"}
        onBack={() => router.push("/student")}
      />
    );

  if (submissionStatus && !examSubmitted) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center bg-gray-800 p-8 rounded-2xl border border-gray-700 max-w-md mx-4">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-yellow-500 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-white mb-4">
            Processing Submission
          </h2>
          <p className="text-lg text-gray-300 mb-4">{submissionStatus}</p>
          {submissionError && (
            <div className="text-red-400 bg-red-900/20 border border-red-800 p-3 rounded-lg mb-4">
              <p className="font-semibold">Error:</p>
              <p className="text-sm">{submissionError}</p>
              <button
                onClick={() => {
                  setSubmissionStatus(null);
                  setSubmissionError(null);
                  setIsSubmitting(false);
                }}
                className="mt-3 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-200"
              >
                Try Again
              </button>
            </div>
          )}
          {transactionHash && (
            <p className="text-sm text-gray-400 mt-2">
              Transaction Hash: {transactionHash.slice(0, 10)}...
            </p>
          )}
          {isPending && (
            <p className="text-sm text-yellow-400 mt-2 animate-pulse">
              Waiting for wallet confirmation...
            </p>
          )}
        </div>
      </div>
    );
  }

  if (examSubmitted) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-gray-800 border border-gray-700 rounded-3xl shadow-2xl p-8 max-w-lg w-full text-center">
          <div className="text-green-400 text-8xl mb-6 animate-bounce">🎉</div>
          <h1 className="text-3xl font-bold text-white mb-4">
            Exam Completed!
          </h1>
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-6 mb-6">
            <h2 className="text-xl font-semibold mb-2 text-white">
              {examData.examTitle}
            </h2>
            <div className="text-4xl font-bold mb-2 text-white">
              {score?.toFixed(1)}%
            </div>
            <p className="text-green-100">Your Final Score</p>
          </div>
          <div className="space-y-3 mb-8">
            <div className="flex justify-between items-center bg-gray-700 p-3 rounded-lg">
              <span className="text-gray-300">Total Questions:</span>
              <span className="font-semibold text-white">
                {examData.questions.length}
              </span>
            </div>
            <div className="flex justify-between items-center bg-gray-700 p-3 rounded-lg">
              <span className="text-gray-300">Correct Answers:</span>
              <span className="font-semibold text-green-400">
                {Math.round(((score || 0) * examData.questions.length) / 100)}
              </span>
            </div>
            {transactionHash && (
              <div className="flex justify-between items-center bg-gray-700 p-3 rounded-lg">
                <span className="text-gray-300">Transaction:</span>
                <span className="font-mono text-blue-400 text-sm">
                  {transactionHash.slice(0, 10)}...
                </span>
              </div>
            )}
          </div>
          <button
            onClick={goToStudentDashboard}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (showWarning) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-gray-800 border border-gray-700 rounded-3xl shadow-2xl p-8 max-w-2xl w-full">
          <div className="text-center mb-8">
            <div className="text-red-400 text-8xl mb-4">⚠️</div>
            <h1 className="text-3xl font-bold text-white mb-4">
              Exam Instructions
            </h1>
            <h2 className="text-xl text-blue-400 font-semibold">
              {examData.examTitle}
            </h2>
          </div>

          <div className="bg-red-900/20 border-l-4 border-red-500 p-6 mb-6">
            <h3 className="text-lg font-bold text-red-400 mb-3">
              ⚡ Important Warnings
            </h3>
            <ul className="space-y-2 text-red-300">
              <li className="flex items-start">
                <span className="text-red-400 mr-2">•</span> This is a proctored
                exam - your screen activity is being monitored
              </li>
              <li className="flex items-start">
                <span className="text-red-400 mr-2">•</span> Do not switch tabs,
                minimize window, or use other applications
              </li>
              <li className="flex items-start">
                <span className="text-red-400 mr-2">•</span> Your webcam and
                microphone may be accessed for monitoring
              </li>
              <li className="flex items-start">
                <span className="text-red-400 mr-2">•</span> Any suspicious
                activity will be flagged automatically
              </li>
            </ul>
          </div>

          <div className="bg-blue-900/20 border-l-4 border-blue-500 p-6 mb-6">
            <h3 className="text-lg font-bold text-blue-400 mb-3">
              📋 Exam Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-blue-300">
              <div>
                <strong>Duration:</strong> {formatTime(examData.duration)}
              </div>
              <div>
                <strong>Questions:</strong> {examData.questions.length}
              </div>
              <div>
                <strong>Voice Commands:</strong> Enabled
              </div>
              <div>
                <strong>Time Remaining:</strong>{" "}
                {timeRemaining ? formatTime(timeRemaining) : "N/A"}
              </div>
            </div>
          </div>

          <div className="bg-green-900/20 border-l-4 border-green-500 p-6 mb-8">
            <h3 className="text-lg font-bold text-green-400 mb-3">
              🎙️ Voice Commands Available
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-green-300">
              <div>"Option A/B/C/D" - Select answer</div>
              <div>"Next" - Next question</div>
              <div>"Previous" - Previous question</div>
              <div>"Submit" - Submit exam</div>
            </div>
          </div>

          <div className="flex justify-center">
            <button
              onClick={startExam}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-12 py-4 rounded-xl font-bold text-xl transition-all duration-300 transform hover:scale-105"
            >
              I Understand - Start Exam
            </button>
          </div>
        </div>
      </div>
    );
  }

  // main interface
  const currentQuestion = examData.questions[currentQuestionIndex];
  const progress =
    ((currentQuestionIndex + 1) / examData.questions.length) * 100;
  const answeredCount = Object.keys(selectedAnswers).length;

  return (
    <div className="min-h-screen bg-gray-900">
      <HeaderBar
        examTitle={examData.examTitle}
        currentIndex={currentQuestionIndex}
        total={examData.questions.length}
        progress={progress}
        timeRemaining={timeRemaining}
        formatTime={formatTime}
        isFullscreen={isFullscreen}
        enterFullscreen={enterFullscreen}
        exitFullscreen={exitFullscreen}
      />

      <main className="pt-24 pb-8 px-4">
        <div className="max-w-4xl mx-auto">
          <QuestionCard
            question={currentQuestion}
            index={currentQuestionIndex}
            selected={selectedAnswers[currentQuestionIndex]}
            onSelect={(letter) =>
              handleAnswerSelect(currentQuestionIndex, letter)
            }
            answeredCount={answeredCount}
            total={examData.questions.length}
          />

          <div className="flex justify-between items-center mb-6">
            <button
              onClick={prevQuestion}
              disabled={currentQuestionIndex === 0}
              className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                currentQuestionIndex === 0
                  ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                  : "bg-gray-600 text-gray-200 hover:bg-gray-500 transform hover:scale-105"
              }`}
            >
              ← Previous
            </button>

            <div className="flex space-x-2 max-w-md overflow-x-auto">
              {examData.questions.map((_, i) => (
                <button
                  key={i}
                  onClick={() => navigateToQuestion(i)}
                  className={`w-10 h-10 rounded-lg font-semibold text-sm transition-all duration-200 transform hover:scale-110 ${
                    i === currentQuestionIndex
                      ? "bg-blue-600 text-white shadow-lg"
                      : selectedAnswers[i]
                      ? "bg-green-600 text-white"
                      : "bg-gray-600 text-gray-300 hover:bg-gray-500"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            <button
              onClick={nextQuestion}
              disabled={currentQuestionIndex === examData.questions.length - 1}
              className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                currentQuestionIndex === examData.questions.length - 1
                  ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700 transform hover:scale-105"
              }`}
            >
              Next →
            </button>
          </div>

          <VoiceAssistant
            status={voiceStatus}
            listening={listening}
            browserSupportsSpeechRecognition={browserSupportsSpeechRecognition}
            onStart={() =>
              SpeechRecognition.startListening({ continuous: true })
            }
            onStop={() => SpeechRecognition.stopListening()}
          />

          <div className="bg-gray-800 border border-gray-700 rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="bg-green-800/50 p-3 rounded-full">
                  <span className="text-2xl">📝</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">
                    Ready to Submit?
                  </h3>
                  <p className="text-gray-400">
                    {answeredCount} of {examData.questions.length} questions
                    answered
                  </p>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setSelectedAnswers({});
                    resetTranscript();
                  }}
                  disabled={isSubmitting}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Clear All
                </button>
                <button
                  onClick={handleSubmitExam}
                  disabled={!examData.examId || isSubmitting}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-8 py-3 rounded-xl font-bold transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Submitting..." : "Submit Exam"}
                </button>
              </div>
            </div>

            {answeredCount < examData.questions.length && (
              <div className="mt-4 p-4 bg-yellow-900/20 border border-yellow-600 rounded-xl">
                <p className="text-yellow-300 text-sm">
                  ⚠️ You have {examData.questions.length - answeredCount}{" "}
                  unanswered questions. You can submit anyway, but unanswered
                  questions will be marked as incorrect.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
