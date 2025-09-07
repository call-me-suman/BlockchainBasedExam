"use client";

import { useEffect, useState } from "react";
import Spinner from "../../components/Spinner";
import { getContractInstance } from "../../../utils/contract";

import { prepareContractCall } from "thirdweb";
import { useSendTransaction } from "thirdweb/react";
import axios, { AxiosError } from "axios";
import { useRouter } from "next/navigation";

interface Question {
  question: string;
  options: string[];
  correctAnswer: string;
}

interface ExtractedQuestion {
  question: string;
  options: string[];
  answer_index: number | null;
  difficulty?: string;
  tags?: string[];
}

interface ExamData {
  examTitle: string;
  startTime: number;
  duration: number;
  questions: Question[];
}

const contract = getContractInstance();
// Add custom styles for animations
const styles = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  @keyframes slideIn {
    from { opacity: 0; transform: translateX(20px); }
    to { opacity: 1; transform: translateX(0); }
  }
  
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-5px); }
    75% { transform: translateX(5px); }
  }
  
  .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
  .animate-slideIn { animation: slideIn 0.4s ease-out; }
  .animate-shake { animation: shake 0.5s ease-in-out; }
`;

export default function CreateExam() {
  const [isLoading, setIsLoading] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [cid, setCid] = useState("");
  const [dateTimeValue, setDateTimeValue] = useState("");
  const [publicUrl, setPublicUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [extractError, setExtractError] = useState("");
  const [debugInfo, setDebugInfo] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<"document" | "text">("document");
  const [clipboardText, setClipboardText] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [redirectIn, setRedirectIn] = useState<number | null>(null);

  const router = useRouter();
  const { mutate: sendTransaction, isPending } = useSendTransaction();
  const [examData, setExamData] = useState<ExamData>({
    examTitle: "",
    startTime: 0,
    duration: 3600,
    questions: [
      {
        question: "",
        options: ["", "", "", ""],
        correctAnswer: "A",
      },
    ],
  });

  // Add debug logging function
  const addDebugLog = (message: string, data?: any) => {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}`;
    if (data) {
      console.log(logMessage, data);
      setDebugInfo((prev) => [
        ...prev.slice(-9),
        `${logMessage} ${JSON.stringify(data, null, 2)}`,
      ]);
    } else {
      console.log(logMessage);
      setDebugInfo((prev) => [...prev.slice(-9), logMessage]);
    }
  };

  useEffect(() => {
    setExamData((prevData) => ({
      ...prevData,
      startTime: Math.floor(Date.now() / 1000) + 86400,
    }));
  }, []);

  useEffect(() => {
    setDateTimeValue(
      new Date(examData.startTime * 1000).toISOString().slice(0, 16)
    );
  }, [examData.startTime]);

  const handleExamDataChange = (
    field: keyof ExamData,
    value: string | number
  ) => {
    setExamData({ ...examData, [field]: value });
  };

  const handleQuestionChange = (
    index: number,
    field: keyof Question,
    value: string
  ) => {
    const updatedQuestions = [...examData.questions];
    updatedQuestions[index] = {
      ...updatedQuestions[index],
      [field]: value,
    };
    setExamData({ ...examData, questions: updatedQuestions });
  };

  const handleOptionChange = (
    questionIndex: number,
    optionIndex: number,
    value: string
  ) => {
    const updatedQuestions = [...examData.questions];
    const options = [...updatedQuestions[questionIndex].options];
    options[optionIndex] = value;
    updatedQuestions[questionIndex] = {
      ...updatedQuestions[questionIndex],
      options,
    };
    setExamData({ ...examData, questions: updatedQuestions });
  };

  const addQuestion = () => {
    setExamData({
      ...examData,
      questions: [
        ...examData.questions,
        {
          question: "",
          options: ["", "", "", ""],
          correctAnswer: "A",
        },
      ],
    });
  };

  const removeQuestion = (index: number) => {
    if (examData.questions.length > 1) {
      const updatedQuestions = [...examData.questions];
      updatedQuestions.splice(index, 1);
      setExamData({ ...examData, questions: updatedQuestions });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      addDebugLog("File selected", {
        name: selectedFile.name,
        size: selectedFile.size,
      });
    }
  };

  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setClipboardText(text);
      addDebugLog("Text pasted from clipboard", { length: text.length });
    } catch (err) {
      addDebugLog("Failed to read from clipboard", err);
      setExtractError(
        "Failed to access clipboard. Please paste text manually."
      );
    }
  };

  const extractFromText = async () => {
    if (!clipboardText.trim()) {
      setExtractError("Please provide text to extract questions from");
      return;
    }

    setIsExtracting(true);
    setExtractError("");
    addDebugLog("Starting text extraction");

    try {
      const response = await axios.post(
        `${process.env.PROCTOR_URL}api/extract`,
        { text: clipboardText },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      addDebugLog("Text extraction response received", response.data);
      processExtractedQuestions(response.data);
    } catch (err: unknown) {
      const error = err as Error | AxiosError;
      const errorMessage = axios.isAxiosError(error)
        ? error.response?.data?.error || error.message
        : (error as Error).message;

      addDebugLog("Text extraction failed", { error: errorMessage });
      setExtractError(`Failed to extract from text: ${errorMessage}`);
    } finally {
      setIsExtracting(false);
    }
  };

  const extractTextFromDocument = async () => {
    if (!file) {
      setExtractError("Please select a file first");
      return;
    }

    setIsExtracting(true);
    setExtractError("");
    addDebugLog("Starting document extraction", { fileName: file.name });

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post(
        "http://localhost:3000/api/extract",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      addDebugLog("Document extraction response received", response.data);
      processExtractedQuestions(response.data);
    } catch (err: unknown) {
      const error = err as Error | AxiosError;
      const errorMessage = axios.isAxiosError(error)
        ? error.response?.data?.error || error.message
        : (error as Error).message;

      addDebugLog("Document extraction failed", { error: errorMessage });
      setExtractError(`Failed to extract text: ${errorMessage}`);
    } finally {
      setIsExtracting(false);
    }
  };

  const processExtractedQuestions = (data: any) => {
    if (data && Array.isArray(data)) {
      const convertedQuestions: Question[] = data.map(
        (item: ExtractedQuestion) => {
          const options = [...item.options];
          while (options.length < 4) options.push("");

          let correctAnswerLetter = "A";
          if (
            item.answer_index !== null &&
            item.answer_index >= 0 &&
            item.answer_index < 4
          ) {
            correctAnswerLetter = String.fromCharCode(65 + item.answer_index);
          }

          return {
            question: item.question,
            options: options.slice(0, 4),
            correctAnswer: correctAnswerLetter,
          };
        }
      );

      setExamData({
        ...examData,
        questions:
          convertedQuestions.length > 0
            ? convertedQuestions
            : examData.questions,
      });

      addDebugLog("Questions processed successfully", {
        count: convertedQuestions.length,
      });
    }
  };

  const uploadToIPFS = async () => {
    try {
      setIsLoading(true);
      setCid("");
      addDebugLog("Starting IPFS upload");

      if (!examData.examTitle.trim()) {
        addDebugLog("Validation failed - missing exam title");
        alert("Please enter an exam title");
        setIsLoading(false);
        return;
      }

      addDebugLog("Uploading exam data to API", examData);

      const response = await fetch("/api/exams", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(examData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        addDebugLog("API upload failed", {
          status: response.status,
          error: errorText,
        });
        throw new Error(
          `Failed to upload exam: ${response.status} ${errorText}`
        );
      }

      const result = await response.json();
      addDebugLog("API upload successful", result);

      const transaction = prepareContractCall({
        contract,
        method:
          "function createExamWithQuestions(string title, uint256 startTime, uint256 duration, string questionsHash)",
        params: [
          examData.examTitle,
          BigInt(examData.startTime),
          BigInt(examData.duration),
          result.cid,
        ],
      });

      addDebugLog("Prepared contract transaction", {
        title: examData.examTitle,
        startTime: examData.startTime,
        duration: examData.duration,
        questionsHash: result.cid,
      });

      try {
        // Await wallet signature + transaction submission
        const txResult = await sendTransaction(transaction);
        addDebugLog("Blockchain transaction successful", txResult);

        setCid(result.cid);
        setPublicUrl(result.url);
        setShowSuccess(true);

        // Start 10s redirect countdown
        setRedirectIn(10);
      } catch (txError) {
        addDebugLog("Blockchain transaction failed", txError);
        throw new Error(`Blockchain transaction failed: ${txError}`);
      }
    } catch (error) {
      addDebugLog("Upload process failed", error);
      alert(`Failed to upload exam: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Countdown and redirect handler
  useEffect(() => {
    if (redirectIn === null) return;
    if (redirectIn <= 0) {
      router.push("/student");
      return;
    }
    const t = setTimeout(() => setRedirectIn((s) => (s ? s - 1 : 0)), 1000);
    return () => clearTimeout(t);
  }, [redirectIn, router]);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  const clearDebugLogs = () => {
    setDebugInfo([]);
  };

  return (
    <>
      <style jsx>{styles}</style>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-4">
              Create Exam
            </h1>
            <p className="text-gray-400 text-lg">
              Design and deploy your exam to the blockchain
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Exam Details Card */}
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6 shadow-xl">
                <h2 className="text-2xl font-bold text-white mb-6">
                  Exam Details
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-300 font-medium mb-2">
                      Exam Title
                    </label>
                    <input
                      type="text"
                      value={examData.examTitle}
                      onChange={(e) =>
                        handleExamDataChange("examTitle", e.target.value)
                      }
                      className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all"
                      placeholder="Enter exam title"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-300 font-medium mb-2">
                        Start Time
                      </label>
                      <input
                        type="datetime-local"
                        value={dateTimeValue}
                        onChange={(e) => {
                          const date = new Date(e.target.value);
                          setDateTimeValue(e.target.value);
                          handleExamDataChange(
                            "startTime",
                            Math.floor(date.getTime() / 1000)
                          );
                        }}
                        className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all"
                      />
                      <p className="text-sm text-gray-400 mt-1">
                        {formatDate(examData.startTime)}
                      </p>
                    </div>

                    <div>
                      <label className="block text-gray-300 font-medium mb-2">
                        Duration
                      </label>
                      <input
                        type="number"
                        value={examData.duration}
                        onChange={(e) =>
                          handleExamDataChange(
                            "duration",
                            parseInt(e.target.value)
                          )
                        }
                        className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all"
                      />
                      <p className="text-sm text-gray-400 mt-1">
                        {Math.floor(examData.duration / 60)} minutes
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Question Import Card */}
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6 shadow-xl">
                <h2 className="text-2xl font-bold text-white mb-6">
                  Import Questions
                </h2>

                {/* Tab Navigation */}
                <div className="flex space-x-1 mb-6 bg-gray-700/30 p-1 rounded-lg">
                  <button
                    onClick={() => setActiveTab("document")}
                    className={`flex-1 py-2 px-4 rounded-md font-medium transition-all ${
                      activeTab === "document"
                        ? "bg-blue-500 text-white shadow-lg"
                        : "text-gray-400 hover:text-white hover:bg-gray-700/50"
                    }`}
                  >
                    📄 Document
                  </button>
                  <button
                    onClick={() => setActiveTab("text")}
                    className={`flex-1 py-2 px-4 rounded-md font-medium transition-all ${
                      activeTab === "text"
                        ? "bg-blue-500 text-white shadow-lg"
                        : "text-gray-400 hover:text-white hover:bg-gray-700/50"
                    }`}
                  >
                    📋 Text
                  </button>
                </div>

                {/* Tab Content */}
                <div className="space-y-4">
                  {activeTab === "document" ? (
                    <div className="space-y-4 animate-fadeIn">
                      <div>
                        <label className="block text-gray-300 mb-2">
                          Upload Document
                        </label>
                        <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                          <input
                            type="file"
                            accept="image/*,.pdf"
                            onChange={handleFileChange}
                            className="hidden"
                            id="file-upload"
                          />
                          <label
                            htmlFor="file-upload"
                            className="cursor-pointer"
                          >
                            <div className="text-4xl mb-2">📁</div>
                            <p className="text-gray-400">
                              Click to select or drag and drop
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                              PDF, PNG, JPG supported
                            </p>
                            {file && (
                              <p className="text-blue-400 mt-2 font-medium">
                                {file.name}
                              </p>
                            )}
                          </label>
                        </div>
                      </div>

                      <button
                        onClick={extractTextFromDocument}
                        disabled={isExtracting || !file}
                        className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 disabled:from-gray-600 disabled:to-gray-700 text-white font-medium py-3 px-6 rounded-lg transition-all transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed"
                      >
                        {isExtracting ? (
                          <span className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                            Extracting...
                          </span>
                        ) : (
                          "Extract Questions"
                        )}
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4 animate-fadeIn">
                      <div>
                        <label className="block text-gray-300 mb-2">
                          Paste Text
                        </label>
                        <div className="space-y-2">
                          <button
                            onClick={handlePasteFromClipboard}
                            className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-lg transition-colors"
                          >
                            📋 Paste from Clipboard
                          </button>
                          <textarea
                            value={clipboardText}
                            onChange={(e) => setClipboardText(e.target.value)}
                            placeholder="Or paste/type your questions here..."
                            className="w-full h-32 bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all resize-none"
                          />
                        </div>
                      </div>

                      <button
                        onClick={extractFromText}
                        disabled={isExtracting || !clipboardText.trim()}
                        className="w-full bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 disabled:from-gray-600 disabled:to-gray-700 text-white font-medium py-3 px-6 rounded-lg transition-all transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed"
                      >
                        {isExtracting ? (
                          <span className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                            Processing...
                          </span>
                        ) : (
                          "Process Text"
                        )}
                      </button>
                    </div>
                  )}
                </div>

                {extractError && (
                  <div className="mt-4 p-3 bg-red-900/50 border border-red-500/50 text-red-300 rounded-lg animate-shake">
                    {extractError}
                  </div>
                )}
              </div>

              {/* Questions Card */}
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6 shadow-xl">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-white">
                    Questions ({examData.questions.length})
                  </h2>
                  <button
                    onClick={addQuestion}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-all transform hover:scale-105 flex items-center"
                  >
                    ➕ Add Question
                  </button>
                </div>

                <div className="space-y-6">
                  {examData.questions.map((question, qIndex) => (
                    <div
                      key={qIndex}
                      className="bg-gray-700/30 rounded-lg p-4 border border-gray-600/50"
                    >
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="font-bold text-white">
                          Question {qIndex + 1}
                        </h3>
                        {examData.questions.length > 1 && (
                          <button
                            onClick={() => removeQuestion(qIndex)}
                            className="text-red-400 hover:text-red-300 p-1 rounded transition-colors"
                          >
                            🗑️
                          </button>
                        )}
                      </div>

                      <div className="space-y-4">
                        <textarea
                          value={question.question}
                          onChange={(e) =>
                            handleQuestionChange(
                              qIndex,
                              "question",
                              e.target.value
                            )
                          }
                          placeholder="Enter question text..."
                          className="w-full bg-gray-600/50 border border-gray-500 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all resize-none"
                          rows={2}
                        />

                        <div className="grid grid-cols-1 gap-2">
                          {["A", "B", "C", "D"].map((letter, oIndex) => (
                            <div
                              key={oIndex}
                              className="flex items-center space-x-2"
                            >
                              <span className="font-bold text-gray-300 w-6">
                                {letter}.
                              </span>
                              <input
                                type="text"
                                value={question.options[oIndex] || ""}
                                onChange={(e) =>
                                  handleOptionChange(
                                    qIndex,
                                    oIndex,
                                    e.target.value
                                  )
                                }
                                placeholder={`Option ${letter}`}
                                className="flex-1 bg-gray-600/50 border border-gray-500 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all"
                              />
                            </div>
                          ))}
                        </div>

                        <div className="flex items-center space-x-2">
                          <label className="text-gray-300 font-medium">
                            Correct Answer:
                          </label>
                          <select
                            value={question.correctAnswer}
                            onChange={(e) =>
                              handleQuestionChange(
                                qIndex,
                                "correctAnswer",
                                e.target.value
                              )
                            }
                            className="bg-gray-600 border border-gray-500 text-white rounded-lg px-3 py-2 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all"
                          >
                            <option value="A">A</option>
                            <option value="B">B</option>
                            <option value="C">C</option>
                            <option value="D">D</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Upload Button */}
              <div className="text-center">
                <button
                  onClick={uploadToIPFS}
                  disabled={isLoading || isPending}
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold text-lg px-8 py-4 rounded-xl transition-all transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed shadow-lg"
                >
                  {isLoading || isPending ? (
                    <span className="flex items-center">
                      <Spinner />
                      <span className="ml-2">
                        {isPending
                          ? "Confirm the transaction in your wallet..."
                          : "Uploading to IPFS..."}
                      </span>
                    </span>
                  ) : (
                    "🚀 Deploy Exam"
                  )}
                </button>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Success Message */}
              {showSuccess && cid && (
                <div className="bg-green-900/50 border border-green-500/50 rounded-xl p-6 shadow-xl animate-slideIn">
                  <h3 className="font-bold text-green-300 text-xl mb-3">
                    🎉 Success!
                  </h3>
                  <p className="text-green-200 mb-3">
                    Your exam has been deployed to the blockchain!
                  </p>
                  <div className="bg-gray-800/50 rounded-lg p-3 break-all mb-4">
                    <p className="text-xs text-gray-400 mb-1">CID:</p>
                    <p className="font-mono text-sm text-green-300">{cid}</p>
                  </div>
                  <div className="text-green-200">
                    {redirectIn !== null ? (
                      <p>
                        Redirecting to{" "}
                        <span className="font-semibold">/student</span> in{" "}
                        {redirectIn}s...{" "}
                        <button
                          onClick={() => router.push("/student")}
                          className="underline decoration-green-400 underline-offset-4 hover:text-green-300 ml-1"
                        >
                          Go now
                        </button>
                      </p>
                    ) : (
                      <button
                        onClick={() => router.push("/student")}
                        className="underline decoration-green-400 underline-offset-4 hover:text-green-300"
                      >
                        Go to student dashboard
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Debug Panel */}
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6 shadow-xl">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-white">🐛 Debug Logs</h3>
                  <button
                    onClick={clearDebugLogs}
                    className="text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 px-2 py-1 rounded transition-colors"
                  >
                    Clear
                  </button>
                </div>
                <div className="bg-gray-900/50 rounded-lg p-3 h-64 overflow-y-auto">
                  {debugInfo.length === 0 ? (
                    <p className="text-gray-500 text-sm italic">
                      No debug information yet...
                    </p>
                  ) : (
                    <div className="space-y-1">
                      {debugInfo.map((log, index) => (
                        <pre
                          key={index}
                          className="text-xs text-gray-300 whitespace-pre-wrap break-all"
                        >
                          {log}
                        </pre>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Stats Card */}
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6 shadow-xl">
                <h3 className="font-bold text-white mb-4">📊 Exam Stats</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Questions:</span>
                    <span className="text-white font-medium">
                      {examData.questions.length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Duration:</span>
                    <span className="text-white font-medium">
                      {Math.floor(examData.duration / 60)}m
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Status:</span>
                    <span
                      className={`font-medium ${
                        examData.examTitle
                          ? "text-green-400"
                          : "text-yellow-400"
                      }`}
                    >
                      {examData.examTitle ? "Ready" : "Incomplete"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
