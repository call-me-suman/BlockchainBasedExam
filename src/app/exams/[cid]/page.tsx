// "use client";

// import { useState, useEffect } from "react";
// import { useRouter } from "next/navigation";
// import { contract } from "../../../../utils/contract";
// import { prepareContractCall } from "thirdweb";

// import {
//   useActiveAccount,
//   useSendTransaction,
//   useReadContract,
// } from "thirdweb/react";

// interface Question {
//   question: string;
//   options: string[];
//   correctAnswer: string;
// }

// interface ExamData {
//   examTitle: string;
//   examId?: bigint; // Made examId optional
//   startTime: number;
//   duration: number;
//   questions: Question[];
// }

// // Define the type for the data returned from the blockchain
// type BlockchainExamsData = [
//   bigint[], // examIds
//   string[], // titles
//   bigint[], // startTimes
//   bigint[], // durations
//   boolean[] // activeStatus
// ];

// // Initialize Thirdweb client outside the component

// // Function to get all exams with proper type annotations
// export const useGetAllExams = () => {
//   return useReadContract({
//     contract,
//     method:
//       "function getAllExams() view returns (uint256[] examIds, string[] titles, uint256[] startTimes, uint256[] durations, bool[] activeStatus)",
//     params: [],
//   });
// };

// export default function ExamPage({
//   params,
// }: {
//   params: { cid: string } | Promise<{ cid: string }>;
// }) {
//   const router = useRouter();

//   // Use the hook inside the component

//   // Use the hook to get all exams
//   const { data: allExamsData, isLoading: isLoadingExams } = useGetAllExams();

//   const [cid, setCid] = useState<string | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [examData, setExamData] = useState<ExamData | null>(null);
//   const [error, setError] = useState<string | null>(null);
//   const [selectedAnswers, setSelectedAnswers] = useState<{
//     [key: number]: string;
//   }>({});
//   const [examSubmitted, setExamSubmitted] = useState(false);
//   const [score, setScore] = useState<number | null>(null);
//   const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
//   const [submissionStatus, setSubmissionStatus] = useState<string | null>(null);
//   const [submissionError, setSubmissionError] = useState<string | null>(null);
//   const account = useActiveAccount();

//   // Add this flag to prevent infinite loop
//   const [examIdUpdated, setExamIdUpdated] = useState(false);

//   // Get the sendTransaction hook
//   const { mutate: sendTransaction, isPending } = useSendTransaction();

//   // Handle async params
//   useEffect(() => {
//     const resolveParams = async () => {
//       try {
//         const resolvedParams = await Promise.resolve(params);
//         setCid(resolvedParams.cid);
//       } catch (err) {
//         console.error("Error resolving params:", err);
//         setError("Failed to load exam parameters");
//         setLoading(false);
//       }
//     };

//     resolveParams();
//   }, [params]);

//   // Fetch exam data when cid is available
//   useEffect(() => {
//     if (!cid) return;

//     const fetchExam = async () => {
//       try {
//         const response = await fetch(`/api/exams/${cid}`);
//         if (!response.ok) {
//           throw new Error("Failed to load exam");
//         }

//         const data = await response.json();
//         console.log("Fetched exam data:", data);

//         // Set the exam data initially without examId
//         setExamData(data);

//         // Calculate time remaining
//         const currentTime = Math.floor(Date.now() / 1000);
//         const examEndTime = data.startTime + data.duration;

//         if (currentTime < data.startTime) {
//           setError("This exam has not started yet");
//         } else if (currentTime > examEndTime) {
//           setError("This exam has ended");
//         } else {
//           setTimeRemaining(examEndTime - currentTime);
//         }
//       } catch (err) {
//         console.error("Error fetching exam:", err);
//         setError("Failed to load exam data");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchExam();
//   }, [cid]);

//   // Find the exam ID by title once we have both exam data and all exams data
//   // Add a flag to prevent infinite loop
//   useEffect(() => {
//     if (!examData || !allExamsData || isLoadingExams || examIdUpdated) return;

//     try {
//       console.log("All exams data:", allExamsData);

//       // Cast the returned data to the array of arrays format
//       const examsArrays = allExamsData as unknown as BlockchainExamsData;

//       // Extract the arrays we need
//       const [examIds, titles] = examsArrays;
//       const examTitle = examData.examTitle;
//       console.log("Looking for exam title:", examTitle);
//       console.log("Available titles:", titles);

//       // Find the index of the exam with matching title
//       const examIndex = titles.findIndex((title) => title === examTitle);

//       if (examIndex !== -1) {
//         const foundExamId = examIds[examIndex];
//         console.log(`Found exam ID for "${examTitle}": ${foundExamId}`);

//         // Update examData with the found examId
//         setExamData((prevData) => ({
//           ...prevData!,
//           examId: foundExamId,
//         }));

//         // Set flag to prevent this effect from running again
//         setExamIdUpdated(true);
//       } else {
//         console.error(
//           `Exam with title "${examTitle}" not found in the blockchain data`
//         );
//         setError("Could not find exam ID for this exam");
//       }
//     } catch (err) {
//       console.error("Error finding exam ID:", err);
//       setError("Failed to retrieve exam ID");
//     }
//   }, [examData, allExamsData, isLoadingExams, examIdUpdated]);

//   // Timer for exam duration
//   useEffect(() => {
//     if (timeRemaining === null || timeRemaining <= 0 || examSubmitted) return;

//     const timer = setInterval(() => {
//       setTimeRemaining((prev) => {
//         if (prev === null || prev <= 1) {
//           clearInterval(timer);
//           handleSubmitExam();
//           return 0;
//         }
//         return prev - 1;
//       });
//     }, 1000);

//     return () => clearInterval(timer);
//   }, [timeRemaining, examSubmitted]);

//   const handleAnswerSelect = (questionIndex: number, answer: string) => {
//     setSelectedAnswers((prev) => ({
//       ...prev,
//       [questionIndex]: answer,
//     }));
//   };

//   const handleSubmitExam = async () => {
//     if (!examData) return;

//     // Check if we have a valid examId
//     if (!examData.examId) {
//       setSubmissionError(
//         "Exam ID not found. Please wait for exam data to load fully."
//       );
//       setSubmissionStatus("Submission failed");
//       return;
//     }

//     setSubmissionStatus("Processing submission...");

//     try {
//       // Calculate score and prepare results
//       let correctAnswers = 0;
//       const studentAnswers = examData.questions.map((question, index) => {
//         const selectedAnswer = selectedAnswers[index] || "";
//         const isCorrect = selectedAnswer === question.correctAnswer;

//         if (isCorrect) {
//           correctAnswers++;
//         }

//         return {
//           questionIndex: index,
//           question: question.question,
//           options: question.options,
//           correctAnswer: question.correctAnswer,
//           selectedAnswer: selectedAnswer,
//           isCorrect: isCorrect,
//         };
//       });

//       const finalScore = (correctAnswers / examData.questions.length) * 100;
//       setScore(finalScore);

//       // Create the exam result JSON
//       // Convert BigInt to string to make it serializable
//       const examResult = {
//         examId: examData.examId.toString(), // Convert BigInt to string
//         examTitle: examData.examTitle,
//         studentAnswers: studentAnswers,
//         score: finalScore,
//         totalQuestions: examData.questions.length,
//         correctAnswers: correctAnswers,
//         submittedAt: Math.floor(Date.now() / 1000),
//         graceMarks: {
//           enabled: false,
//           questions: [],
//           points: 0,
//         },
//       };

//       // Upload exam result to IPFS
//       setSubmissionStatus("Uploading results to IPFS...");
//       const ipfsResponse = await fetch("/api/exams", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(examResult),
//       });

//       if (!ipfsResponse.ok) {
//         throw new Error("Failed to upload results to IPFS");
//       }

//       const result = await ipfsResponse.json();

//       // Submit the CID to blockchain
//       setSubmissionStatus("Recording results on blockchain...");

//       console.log(
//         "Preparing to send transaction with examId:",
//         examData.examId,
//         "and CID:",
//         result.cid
//       );

//       const transaction = prepareContractCall({
//         contract,
//         method: "function submitAnswers(uint256 examId, string answerHash)",
//         params: [examData.examId, result.cid],
//       });

//       await sendTransaction(transaction);
//       setSubmissionStatus("Please confirm the transaction in MetaMask...");
//     } catch (err) {
//       console.error("Error submitting exam:", err);
//       setSubmissionError(
//         `Failed to submit exam: ${
//           err instanceof Error ? err.message : "Unknown error"
//         }`
//       );
//       setSubmissionStatus("Submission failed");
//     }
//   };

//   // Add this effect to watch for transaction completion
//   useEffect(() => {
//     if (
//       !isPending &&
//       submissionStatus === "Please confirm the transaction in MetaMask..."
//     ) {
//       // Transaction completed or was rejected
//       setSubmissionStatus("Submission complete!");
//       setExamSubmitted(true);
//     }
//   }, [isPending]);

//   const formatTime = (seconds: number): string => {
//     const minutes = Math.floor(seconds / 60);
//     const remainingSeconds = seconds % 60;
//     return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
//   };

//   // Show loading state for both the exam data and exam IDs
//   if (loading || isLoadingExams) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <p className="text-xl">Loading exam...</p>
//       </div>
//     );
//   }

//   if (error || !examData) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="text-center">
//           <p className="text-xl text-red-600 mb-4">
//             {error || "Error loading exam"}
//           </p>
//           <button
//             onClick={() => router.push("/")}
//             className="bg-blue-500 text-white px-4 py-2 rounded"
//           >
//             Return Home
//           </button>
//         </div>
//       </div>
//     );
//   }

//   if (submissionStatus && !examSubmitted) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="text-center">
//           <p className="text-xl mb-4">{submissionStatus}</p>
//           {submissionError && (
//             <p className="text-red-600 mb-4">{submissionError}</p>
//           )}
//         </div>
//       </div>
//     );
//   }

//   if (examSubmitted) {
//     return (
//       <div className="min-h-screen bg-gray-100 p-6">
//         <div className="max-w-2xl mx-auto bg-white rounded shadow-md p-6">
//           <h1 className="text-2xl font-bold mb-6">
//             {examData.examTitle} - Results
//           </h1>

//           <div className="mb-6 p-4 bg-blue-50 rounded">
//             <p className="text-xl mb-2">
//               Your Score:{" "}
//               <span className="font-bold">{score?.toFixed(2)}%</span>
//             </p>
//             <p>
//               Correct answers:{" "}
//               {
//                 examData.questions.filter(
//                   (_, index) =>
//                     selectedAnswers[index] ===
//                     examData.questions[index].correctAnswer
//                 ).length
//               }{" "}
//               out of {examData.questions.length}
//             </p>
//             <p className="mt-2 text-sm text-green-600">
//               Your results have been securely stored on the blockchain.
//             </p>
//           </div>

//           <h2 className="text-xl font-bold mb-4">Review</h2>

//           {examData.questions.map((question, index) => {
//             const isCorrect = selectedAnswers[index] === question.correctAnswer;

//             return (
//               <div
//                 key={index}
//                 className={`mb-6 p-4 rounded ${
//                   isCorrect ? "bg-green-50" : "bg-red-50"
//                 }`}
//               >
//                 <p className="font-bold mb-2">
//                   Question {index + 1}: {question.question}
//                 </p>

//                 <div className="mb-2">
//                   {question.options.map((option, optIndex) => {
//                     const letter = String.fromCharCode(65 + optIndex); // A, B, C, D
//                     const isSelected = selectedAnswers[index] === letter;
//                     const isCorrectAnswer = letter === question.correctAnswer;

//                     return (
//                       <div
//                         key={optIndex}
//                         className={`flex items-center p-1 ${
//                           isSelected && isCorrectAnswer
//                             ? "bg-green-200"
//                             : isSelected && !isCorrectAnswer
//                             ? "bg-red-200"
//                             : !isSelected && isCorrectAnswer
//                             ? "bg-green-100"
//                             : ""
//                         }`}
//                       >
//                         <span className="font-bold mr-2">{letter}.</span>
//                         <span>{option}</span>
//                       </div>
//                     );
//                   })}
//                 </div>

//                 {!isCorrect && (
//                   <p className="text-sm text-red-600 mt-2">
//                     Your answer: {selectedAnswers[index] || "Not answered"}
//                     <br />
//                     Correct answer: {question.correctAnswer}
//                   </p>
//                 )}
//               </div>
//             );
//           })}

//           <button
//             onClick={() => router.push("/")}
//             className="bg-blue-500 text-white px-4 py-2 rounded"
//           >
//             Return Home
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-100 p-6">
//       <div className="max-w-2xl mx-auto bg-white rounded shadow-md p-6">
//         <div className="flex justify-between items-center mb-6">
//           <h1 className="text-2xl font-bold">{examData.examTitle}</h1>
//           {timeRemaining !== null && (
//             <div className="bg-gray-100 px-4 py-2 rounded-lg">
//               <p className="font-bold">
//                 Time remaining: {formatTime(timeRemaining)}
//               </p>
//             </div>
//           )}
//         </div>

//         <div className="mb-4 p-2 bg-blue-50 rounded">
//           <p className="text-sm">
//             Exam ID:{" "}
//             {examData.examId ? examData.examId.toString() : "Loading..."}
//           </p>
//         </div>

//         {examData.questions.map((question, qIndex) => (
//           <div key={qIndex} className="mb-8 pb-4 border-b">
//             <p className="font-bold mb-3">
//               Question {qIndex + 1}: {question.question}
//             </p>

//             <div className="space-y-2">
//               {question.options.map((option, oIndex) => {
//                 const letter = String.fromCharCode(65 + oIndex); // A, B, C, D
//                 return (
//                   <div key={oIndex} className="flex items-center">
//                     <input
//                       type="radio"
//                       id={`q${qIndex}-${letter}`}
//                       name={`question-${qIndex}`}
//                       value={letter}
//                       checked={selectedAnswers[qIndex] === letter}
//                       onChange={() => handleAnswerSelect(qIndex, letter)}
//                       className="mr-2"
//                     />
//                     <label htmlFor={`q${qIndex}-${letter}`} className="flex-1">
//                       <span className="font-bold mr-2">{letter}.</span>
//                       {option}
//                     </label>
//                   </div>
//                 );
//               })}
//             </div>
//           </div>
//         ))}

//         <button
//           onClick={handleSubmitExam}
//           className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
//           disabled={!examData.examId}
//         >
//           Submit Exam
//         </button>
//       </div>
//     </div>
//   );
// }
"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useExamFunctions } from "../../../../utils/blockchain";
import {
  createThirdwebClient,
  defineChain,
  getContract,
  prepareContractCall,
} from "thirdweb";

import {
  useActiveAccount,
  useSendTransaction,
  useReadContract,
} from "thirdweb/react";

import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition"; // ✅ Voice support

fetch(`${process.env.PROCTOR_URL}/check-screen`)
  .then((res) => res.json())
  .then((data) => {
    if (data.status === "flagged") {
      alert("⚠ Suspicious activity detected: " + data.reason);
    }
  });

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

const client = createThirdwebClient({
  clientId: `${process.env.CLIENT_ID}`,
});

const contract = getContract({
  client,
  chain: defineChain(11155111),
  address: `${process.env.ADDRESS}`,
});

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
  const { submitAnswers } = useExamFunctions();
  const { data: allExamsData, isLoading: isLoadingExams } = useGetAllExams();
  const account = useActiveAccount();
  const { mutate: sendTransaction, isPending } = useSendTransaction();

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
  const [examIdUpdated, setExamIdUpdated] = useState(false);

  const {
    transcript,
    resetTranscript,
    listening,
    browserSupportsSpeechRecognition,
    isMicrophoneAvailable,
  } = useSpeechRecognition({
    commands: [],
  });

  // Status message for voice commands
  const [voiceStatus, setVoiceStatus] = useState<string>(
    "Voice recognition initializing..."
  );

  // Store the last processed transcript to avoid duplicate processing
  const [lastProcessedTranscript, setLastProcessedTranscript] =
    useState<string>("");

  // Debounce timer reference
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Helper function to handle answer for current question
  const handleCurrentQuestionAnswer = (option: string) => {
    if (!examData) return;

    // Find the current visible question or first unanswered question
    const visibleQuestionIndex = findVisibleQuestion();
    if (visibleQuestionIndex !== -1) {
      handleAnswerSelect(visibleQuestionIndex, option);
    }
  };

  // Helper function to find visible or first unanswered question
  const findVisibleQuestion = (): number => {
    if (!examData) return -1;

    // Try to find a question element that's currently visible in viewport
    for (let i = 0; i < examData.questions.length; i++) {
      const element = document.getElementById(`question-${i}`);
      if (element) {
        const rect = element.getBoundingClientRect();
        if (
          rect.top >= 0 &&
          rect.top <
            (window.innerHeight || document.documentElement.clientHeight) / 2
        ) {
          return i;
        }
      }
    }

    // Fallback to first unanswered question
    const unansweredIndex = examData.questions.findIndex(
      (_, index) => !selectedAnswers[index]
    );
    return unansweredIndex !== -1 ? unansweredIndex : 0;
  };

  // Navigate to next question
  const navigateToNextQuestion = () => {
    if (!examData) return;

    const currentIndex = findVisibleQuestion();
    const nextIndex = Math.min(currentIndex + 1, examData.questions.length - 1);

    const nextElement = document.getElementById(`question-${nextIndex}`);
    if (nextElement) {
      nextElement.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Navigate to previous question
  const navigateToPreviousQuestion = () => {
    if (!examData) return;

    const currentIndex = findVisibleQuestion();
    const prevIndex = Math.max(currentIndex - 1, 0);

    const prevElement = document.getElementById(`question-${prevIndex}`);
    if (prevElement) {
      prevElement.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Simple function to process voice commands with improved precision
  const processVoiceCommand = (command: string) => {
    if (!command || !examData || examSubmitted) return;

    // Avoid processing the same command multiple times
    if (command === lastProcessedTranscript) return;
    setLastProcessedTranscript(command);

    const lowerCommand = command.toLowerCase();
    console.log("Processing voice command:", lowerCommand);

    // Process option selection commands with more precise matching
    if (lowerCommand.includes("option a") || lowerCommand.endsWith("a")) {
      handleCurrentQuestionAnswer("A");
      setVoiceStatus("✅ Selected option A");
    } else if (
      lowerCommand.includes("option b") ||
      lowerCommand.endsWith("b")
    ) {
      handleCurrentQuestionAnswer("B");
      setVoiceStatus("✅ Selected option B");
    } else if (
      lowerCommand.includes("option c") ||
      lowerCommand.endsWith("c")
    ) {
      handleCurrentQuestionAnswer("C");
      setVoiceStatus("✅ Selected option C");
    } else if (
      lowerCommand.includes("option d") ||
      lowerCommand.endsWith("d")
    ) {
      handleCurrentQuestionAnswer("D");
      setVoiceStatus("✅ Selected option D");
    }
    // Process navigation commands with more precise matching
    else if (lowerCommand.includes("next") || lowerCommand === "next") {
      navigateToNextQuestion();
      setVoiceStatus("➡️ Navigated to next question");
    } else if (
      lowerCommand.includes("previous") ||
      lowerCommand === "previous" ||
      lowerCommand.includes("back")
    ) {
      navigateToPreviousQuestion();
      setVoiceStatus("⬅️ Navigated to previous question");
    }
    // Process action commands with more precise matching
    else if (lowerCommand.includes("clear") || lowerCommand === "clear") {
      setSelectedAnswers({});
      setVoiceStatus("🧹 Cleared all answers");
    } else if (
      lowerCommand.includes("submit") ||
      lowerCommand === "submit" ||
      lowerCommand.includes("finish")
    ) {
      handleSubmitExam();
      setVoiceStatus("🚀 Submitting exam");
    } else if (lowerCommand.includes("time") || lowerCommand === "time") {
      if (timeRemaining !== null && timeRemaining > 0) {
        setVoiceStatus(`⏱️ Time remaining: ${formatTime(timeRemaining)}`);
      } else {
        setVoiceStatus("⌛ Exam time has expired");
      }
    } else {
      // Only show unknown command for longer inputs to avoid noise
      if (lowerCommand.length > 3) {
        setVoiceStatus(`⚠️ Unknown command: "${command}"`);
      }
    }

    // Reset transcript after processing with a slight delay
    // This prevents the same command from being processed multiple times
    setTimeout(() => {
      resetTranscript();
    }, 300);
  };

  // Process transcript when it changes with debouncing
  useEffect(() => {
    if (!transcript || !listening || examSubmitted) return;

    // Clear any existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set a short debounce to allow the transcript to stabilize
    // This helps capture complete commands before processing
    debounceTimerRef.current = setTimeout(() => {
      processVoiceCommand(transcript);
    }, 500); // 500ms debounce

    // Cleanup on unmount
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [transcript, listening, examSubmitted]);

  const handleAnswerSelect = (questionIndex: number, answer: string) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionIndex]: answer,
    }));
  };

  const handleSubmitExam = async () => {
    if (!examData || !examData.examId) {
      setSubmissionError("Exam ID not found.");
      setSubmissionStatus("Submission failed");
      return;
    }

    setSubmissionStatus("Processing submission...");

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

      const examResult = {
        examId: examData.examId.toString(),
        examTitle: examData.examTitle,
        studentAnswers,
        score: finalScore,
        totalQuestions: examData.questions.length,
        correctAnswers,
        submittedAt: Math.floor(Date.now() / 1000),
        graceMarks: {
          enabled: false,
          questions: [],
          points: 0,
        },
      };

      setSubmissionStatus("Uploading results to IPFS...");
      const ipfsResponse = await fetch("/api/exams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(examResult),
      });

      if (!ipfsResponse.ok) throw new Error("Failed to upload results");

      const result = await ipfsResponse.json();

      setSubmissionStatus("Recording results on blockchain...");
      const transaction = prepareContractCall({
        contract,
        method: "function submitAnswers(uint256 examId, string answerHash)",
        params: [examData.examId, result.cid],
      });

      await sendTransaction(transaction);
      setSubmissionStatus("Please confirm the transaction in MetaMask...");
    } catch (err) {
      setSubmissionError(`Failed to submit exam`);
      setSubmissionStatus("Submission failed");
    }
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  // Initialize cid from params
  useEffect(() => {
    const initializeCid = async () => {
      try {
        if (params) {
          if ("cid" in params) {
            // If params is a direct object
            setCid(params.cid);
          } else if (params instanceof Promise) {
            // If params is a Promise
            const resolvedParams = await params;
            setCid(resolvedParams.cid);
          }
        }
      } catch (error) {
        console.error("Error initializing CID:", error);
        setError("Failed to initialize exam data");
      }
    };

    initializeCid();
  }, [params]);

  useEffect(() => {
    if (!cid) return;

    const fetchExam = async () => {
      try {
        const response = await fetch(`/api/exams/${cid}`);
        if (!response.ok) throw new Error("Failed to load exam");

        const data = await response.json();
        setExamData(data);

        const currentTime = Math.floor(Date.now() / 1000);
        const examEndTime = data.startTime + data.duration;

        if (currentTime < data.startTime) {
          setError("This exam has not started yet");
        } else if (currentTime > examEndTime) {
          setError("This exam has ended");
        } else {
          setTimeRemaining(examEndTime - currentTime);
        }
      } catch {
        setError("Failed to load exam data");
      } finally {
        setLoading(false);
      }
    };

    fetchExam();
  }, [cid]);

  useEffect(() => {
    if (!examData || !allExamsData || isLoadingExams || examIdUpdated) return;

    try {
      const [examIds, titles] = allExamsData as BlockchainExamsData;
      const examIndex = titles.findIndex(
        (title) => title === examData.examTitle
      );

      if (examIndex !== -1) {
        setExamData((prev) => ({
          ...prev!,
          examId: examIds[examIndex],
        }));
        setExamIdUpdated(true);
      } else {
        setError("Could not find exam ID for this exam");
      }
    } catch {
      setError("Failed to retrieve exam ID");
    }
  }, [examData, allExamsData, isLoadingExams, examIdUpdated]);

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

  useEffect(() => {
    if (
      !isPending &&
      submissionStatus === "Please confirm the transaction in MetaMask..."
    ) {
      setSubmissionStatus("Submission complete!");
      setExamSubmitted(true);
    }
  }, [isPending]);

  // Auto-start speech recognition when the exam loads
  useEffect(() => {
    if (
      browserSupportsSpeechRecognition &&
      !listening &&
      !examSubmitted &&
      examData
    ) {
      // Small delay to ensure the component is fully mounted
      const timer = setTimeout(() => {
        SpeechRecognition.startListening({ continuous: true });
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [browserSupportsSpeechRecognition, listening, examSubmitted, examData]);

  // Update voice status based on listening state
  useEffect(() => {
    if (!browserSupportsSpeechRecognition) {
      setVoiceStatus("❌ Voice recognition not supported in this browser");
    } else if (!isMicrophoneAvailable) {
      setVoiceStatus("🎤 Microphone access needed for voice commands");
    } else if (listening) {
      setVoiceStatus("🎙️ Listening for voice commands...");
    } else {
      setVoiceStatus("Voice recognition paused");
    }
  }, [listening, browserSupportsSpeechRecognition, isMicrophoneAvailable]);

  // Display recognized speech
  useEffect(() => {
    if (transcript && listening) {
      setVoiceStatus(`🎙️ Heard: "${transcript}"`);
    }
  }, [transcript, listening]);

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
          <p className="text-xl mb-2">
            Your Score: <span className="font-bold">{score?.toFixed(2)}%</span>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pb-6 pt-20">
      {/* Distinctive Header for Proctor Detection - Now fixed */}
      <header className="bg-blue-800 text-white py-4 px-6 rounded-b-lg shadow-md flex justify-between items-center proctor-header fixed top-0 left-0 right-0 z-50">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-white rounded-full mr-3 flex items-center justify-center overflow-hidden">
            <Image
              src="/logo.jpg"
              alt="Blockchain Exam Logo"
              width={40}
              height={40}
              className="object-contain"
            />
          </div>
          <h1 className="text-xl font-bold">Blockchain Exam System</h1>
        </div>
      </header>

      <div className="max-w-2xl mx-auto bg-black rounded shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl font-semibold">{examData.examTitle}</h1>
          {timeRemaining !== null && (
            <div className="bg-gray-100 px-4 py-2 rounded-lg">
              <p className="font-bold text-black">
                Time remaining: {formatTime(timeRemaining)}
              </p>
            </div>
          )}
        </div>

        {examData.questions.map((q, qIndex) => {
          const selected = selectedAnswers[qIndex];

          return (
            <div
              key={qIndex}
              id={`question-${qIndex}`}
              className="m-8 p-4  border"
            >
              <p className="font-bold mb-3">
                Question {qIndex + 1}: {q.question}
              </p>
              <div className="space-y-2">
                {q.options.map((opt, oIndex) => {
                  const letter = String.fromCharCode(65 + oIndex);
                  return (
                    <div key={oIndex} className="flex items-center">
                      <input
                        type="radio"
                        id={`q${qIndex}-${letter}`}
                        name={`question-${qIndex}`}
                        value={letter}
                        checked={selected === letter}
                        onChange={() => handleAnswerSelect(qIndex, letter)}
                        className="mr-2"
                      />
                      <label htmlFor={`q${qIndex}-${letter}`}>
                        <span className="font-bold mr-2">{letter}.</span>
                        {opt}
                      </label>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        <div className="flex flex-col gap-4 mt-6">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-4">
            <h3 className="font-bold text-blue-700 mb-2">Voice Commands</h3>
            <p className="text-blue-600 mb-1">Current status: {voiceStatus}</p>
            {listening ? (
              <p className="text-green-600">🎙️ Voice recognition active</p>
            ) : (
              <p className="text-red-600">🔇 Voice recognition inactive</p>
            )}
            <div className="mt-2 text-sm text-gray-700">
              <p className="font-semibold">Available commands:</p>
              <ul className="list-disc pl-5 mt-1">
                <li>"Option A" - Select option A</li>
                <li>"Option B" - Select option B</li>
                <li>"Option C" - Select option C</li>
                <li>"Option D" - Select option D</li>
                <li>"Next" - Navigate to next question</li>
                <li>"Previous" - Navigate to previous question</li>
                <li>"Clear" - Clear all answers</li>
                <li>"Submit" - Submit your exam</li>
                <li>"Time" - Check remaining time</li>
              </ul>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleSubmitExam}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              disabled={!examData.examId}
            >
              Submit Exam
            </button>

            <button
              onClick={() => {
                setSelectedAnswers({});
                resetTranscript();
              }}
              className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
            >
              Clear Answers
            </button>

            {!listening ? (
              <button
                onClick={() =>
                  SpeechRecognition.startListening({ continuous: true })
                }
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                disabled={!browserSupportsSpeechRecognition}
              >
                Start Voice Recognition
              </button>
            ) : (
              <button
                onClick={() => SpeechRecognition.stopListening()}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Stop Voice Recognition
              </button>
            )}
          </div>
        </div>
      </div>
      {/* Distinctive Footer for Proctor Detection */}
      <footer className="bg-blue-800 text-white py-3 px-6 mt-6 rounded-b-lg shadow-md text-center proctor-footer">
        <p className="text-sm">
          Blockchain Exam System v1.0 - Powered by Thirdweb & IPFS
        </p>
        <p className="text-xs mt-1"> 2025 Blockchain Education Initiative</p>
      </footer>
    </div>
  );
}
