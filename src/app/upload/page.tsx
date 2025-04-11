// "use client";

// import { useEffect, useState } from "react";
// import { useExamFunctions } from "../../../utils/blockchain";
// import { useRouter } from "next/navigation";
// import {
//   createThirdwebClient,
//   defineChain,
//   getContract,
//   prepareContractCall,
// } from "thirdweb";
// import { useActiveAccount, useSendTransaction } from "thirdweb/react";

// interface Question {
//   question: string;
//   options: string[];
//   correctAnswer: string;
// }

// interface ExamData {
//   examTitle: string;
//   startTime: number;
//   duration: number;
//   questions: Question[];
// }

// export default function CreateExam() {
//   const router = useRouter();
//   const [isLoading, setIsLoading] = useState(false);
//   const [cid, setCid] = useState("");
//   const [dateTimeValue, setDateTimeValue] = useState("");
//   const [publicUrl, setPublicUrl] = useState("");
//   const account = useActiveAccount();

//   const client = createThirdwebClient({
//     clientId: "f74a735820f866854c58f30896bc36a5",
//   });

//   // Connect to your contract
//   const contract = getContract({
//     client,
//     chain: defineChain(11155111), // Sepolia testnet
//     address: "0x34B9fD9b646Ade28fDd659Bf34Edd027c60445B1",
//   });

//   const { mutate: sendTransaction, isPending } = useSendTransaction();
//   const [examData, setExamData] = useState<ExamData>({
//     examTitle: "",
//     startTime: Math.floor(Date.now() / 1000) + 86400, // Default to tomorrow
//     duration: 3600, // Default to 1 hour
//     questions: [
//       {
//         question: "",
//         options: ["", "", "", ""],
//         correctAnswer: "A",
//       },
//     ],
//   });
//   useEffect(() => {
//     // Only set date value after component mounts (client-side only)
//     setDateTimeValue(
//       new Date(examData.startTime * 1000).toISOString().slice(0, 16)
//     );
//   }, [examData.startTime]);
//   const handleExamDataChange = (field: keyof ExamData, value: any) => {
//     setExamData({ ...examData, [field]: value });
//   };

//   const handleQuestionChange = (
//     index: number,
//     field: keyof Question,
//     value: any
//   ) => {
//     const updatedQuestions = [...examData.questions];
//     updatedQuestions[index] = {
//       ...updatedQuestions[index],
//       [field]: value,
//     };
//     setExamData({ ...examData, questions: updatedQuestions });
//   };

//   const handleOptionChange = (
//     questionIndex: number,
//     optionIndex: number,
//     value: string
//   ) => {
//     const updatedQuestions = [...examData.questions];
//     const options = [...updatedQuestions[questionIndex].options];
//     options[optionIndex] = value;
//     updatedQuestions[questionIndex] = {
//       ...updatedQuestions[questionIndex],
//       options,
//     };
//     setExamData({ ...examData, questions: updatedQuestions });
//   };

//   const addQuestion = () => {
//     setExamData({
//       ...examData,
//       questions: [
//         ...examData.questions,
//         {
//           question: "",
//           options: ["", "", "", ""],
//           correctAnswer: "A",
//         },
//       ],
//     });
//   };

//   const removeQuestion = (index: number) => {
//     if (examData.questions.length > 1) {
//       const updatedQuestions = [...examData.questions];
//       updatedQuestions.splice(index, 1);
//       setExamData({ ...examData, questions: updatedQuestions });
//     }
//   };

//   const uploadToIPFS = async () => {
//     try {
//       setIsLoading(true);

//       // Validate exam data
//       if (!examData.examTitle.trim()) {
//         alert("Please enter an exam title");
//         setIsLoading(false);
//         return;
//       }

//       // Upload JSON data via API route
//       const response = await fetch("/api/exams", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(examData),
//       });

//       if (!response.ok) {
//         throw new Error("Failed to upload exam");
//       }

//       const result = await response.json();
//       const transaction = prepareContractCall({
//         contract,
//         method:
//           "function createExamWithQuestions(string title, uint256 startTime, uint256 duration, string questionsHash)",
//         params: [
//           examData.examTitle,
//           BigInt(examData.startTime),
//           BigInt(examData.duration),
//           result.cid,
//         ],
//       });

//       // Send and await the transaction
//       const txResult = await sendTransaction(transaction);
//       // if (isPending) {
//       //   return <>wait</>;
//       // }
//       console.log("Transaction sent:", txResult);
//       setCid(result.cid);
//       setPublicUrl(result.url);
//       console.log("succesfullt created exam in blk");
//     } catch (error) {
//       console.error("Error uploading to IPFS:", error);
//       alert("Failed to upload exam to IPFS");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const formatDate = (timestamp: number) => {
//     return new Date(timestamp * 1000).toLocaleString();
//   };

//   return (
//     <div className="min-h-screen bg-black-100 p-6">
//       <div className="max-w-4xl mx-auto bg-black rounded shadow-md p-6">
//         <h1 className="text-2xl font-bold mb-6">Create Exam</h1>

//         <div className="mb-6">
//           <label className="block text-gray-700 font-bold mb-2">
//             Exam Title
//           </label>
//           <input
//             type="text"
//             value={examData.examTitle}
//             onChange={(e) => handleExamDataChange("examTitle", e.target.value)}
//             className="w-full border rounded px-3 py-2"
//             placeholder="Enter exam title"
//           />
//         </div>

//         <div className="grid grid-cols-2 gap-4 mb-6">
//           <div>
//             <label className="block text-gray-700 font-bold mb-2">
//               Start Time
//             </label>
//             {/* <input
//               type="datetime-local"
//               value={new Date(examData.startTime * 1000)
//                 .toISOString()
//                 .slice(0, 16)}
//               onChange={(e) => {
//                 const date = new Date(e.target.value);
//                 handleExamDataChange(
//                   "startTime",
//                   Math.floor(date.getTime() / 1000)
//                 );
//               }}
//               className="w-full border rounded px-3 py-2"
//             /> */}
//             <input
//               type="datetime-local"
//               value={dateTimeValue}
//               onChange={(e) => {
//                 const date = new Date(e.target.value);
//                 setDateTimeValue(e.target.value);
//                 handleExamDataChange(
//                   "startTime",
//                   Math.floor(date.getTime() / 1000)
//                 );
//               }}
//               className="w-full border rounded px-3 py-2"
//             />
//             <p className="text-sm text-gray-500 mt-1">
//               Unix Timestamp: {examData.startTime} (
//               {formatDate(examData.startTime)})
//             </p>
//           </div>

//           <div>
//             <label className="block text-gray-700 font-bold mb-2">
//               Duration (seconds)
//             </label>
//             <input
//               type="number"
//               value={examData.duration}
//               onChange={(e) =>
//                 handleExamDataChange("duration", parseInt(e.target.value))
//               }
//               className="w-full border rounded px-3 py-2"
//             />
//             <p className="text-sm text-gray-500 mt-1">
//               {Math.floor(examData.duration / 60)} minutes
//             </p>
//           </div>
//         </div>

//         <div className="mb-6">
//           <div className="flex justify-between items-center mb-4">
//             <h2 className="text-xl font-bold">Questions</h2>
//             <button
//               onClick={addQuestion}
//               className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
//               type="button"
//             >
//               Add Question
//             </button>
//           </div>

//           {examData.questions.map((question, qIndex) => (
//             <div key={qIndex} className="mb-8 border-b pb-4">
//               <div className="flex justify-between items-start mb-2">
//                 <h3 className="font-bold">Question {qIndex + 1}</h3>
//                 {examData.questions.length > 1 && (
//                   <button
//                     onClick={() => removeQuestion(qIndex)}
//                     className="text-red-500 hover:text-red-700"
//                     type="button"
//                   >
//                     Remove
//                   </button>
//                 )}
//               </div>

//               <div className="mb-4">
//                 <label className="block text-gray-700 mb-1">
//                   Question Text
//                 </label>
//                 <textarea
//                   value={question.question}
//                   onChange={(e) =>
//                     handleQuestionChange(qIndex, "question", e.target.value)
//                   }
//                   className="w-full border rounded px-3 py-2"
//                   rows={2}
//                 />
//               </div>

//               <div className="mb-4">
//                 <label className="block text-gray-700 mb-1">Options</label>
//                 {["A", "B", "C", "D"].map((letter, oIndex) => (
//                   <div key={oIndex} className="flex mb-2">
//                     <span className="mr-2 font-bold">{letter}.</span>
//                     <input
//                       type="text"
//                       value={question.options[oIndex] || ""}
//                       onChange={(e) =>
//                         handleOptionChange(qIndex, oIndex, e.target.value)
//                       }
//                       className="flex-1 border rounded px-3 py-1"
//                     />
//                   </div>
//                 ))}
//               </div>

//               <div>
//                 <label className="block text-gray-700 mb-1">
//                   Correct Answer
//                 </label>
//                 <select
//                   value={question.correctAnswer}
//                   onChange={(e) =>
//                     handleQuestionChange(
//                       qIndex,
//                       "correctAnswer",
//                       e.target.value
//                     )
//                   }
//                   className="border rounded px-3 py-2"
//                 >
//                   <option value="A">A</option>
//                   <option value="B">B</option>
//                   <option value="C">C</option>
//                   <option value="D">D</option>
//                 </select>
//               </div>
//             </div>
//           ))}
//         </div>

//         <div className="mb-6">
//           <button
//             onClick={uploadToIPFS}
//             disabled={isLoading}
//             className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:bg-gray-400"
//             type="button"
//           >
//             {isLoading ? "Uploading..." : "Upload to IPFS"}
//           </button>
//         </div>

//         {cid && (
//           <div className="p-4 bg-green-50 border border-green-200 rounded">
//             <h3 className="font-bold text-green-700 mb-2">
//               Upload Successful!
//             </h3>
//             <p className="mb-2">Content Identifier (CID):</p>
//             <div className="p-2 bg-gray-100 rounded font-mono break-all">
//               {cid}
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Spinner from "../../components/Spinner";
import {
  createThirdwebClient,
  defineChain,
  getContract,
  prepareContractCall,
} from "thirdweb";
import { useActiveAccount, useSendTransaction } from "thirdweb/react";
import axios from "axios";

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

export default function CreateExam() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [cid, setCid] = useState("");
  const [dateTimeValue, setDateTimeValue] = useState("");
  const [publicUrl, setPublicUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [extractError, setExtractError] = useState("");
  const account = useActiveAccount();

  const client = createThirdwebClient({
    clientId: "f74a735820f866854c58f30896bc36a5",
  });

  // Connect to your contract
  const contract = getContract({
    client,
    chain: defineChain(11155111), // Sepolia testnet
    address: "0x34B9fD9b646Ade28fDd659Bf34Edd027c60445B1",
  });

  const { mutate: sendTransaction, isPending } = useSendTransaction();
  const [examData, setExamData] = useState<ExamData>({
    examTitle: "",
    startTime: Math.floor(Date.now() / 1000) + 86400, // Default to tomorrow
    duration: 3600, // Default to 1 hour
    questions: [
      {
        question: "",
        options: ["", "", "", ""],
        correctAnswer: "A",
      },
    ],
  });

  useEffect(() => {
    // Only set date value after component mounts (client-side only)
    setDateTimeValue(
      new Date(examData.startTime * 1000).toISOString().slice(0, 16)
    );
  }, [examData.startTime]);

  const handleExamDataChange = (field: keyof ExamData, value: any) => {
    setExamData({ ...examData, [field]: value });
  };

  const handleQuestionChange = (
    index: number,
    field: keyof Question,
    value: any
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

  // Text extraction functionality from MCQ Extractor
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const extractTextFromDocument = async () => {
    if (!file) {
      setExtractError("Please select a file first");
      return;
    }

    setIsExtracting(true);
    setExtractError("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post(
        "http://localhost:5000/extract",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // Process extracted questions and convert to exam format
      if (response.data && Array.isArray(response.data)) {
        const convertedQuestions: Question[] = response.data.map(
          (item: ExtractedQuestion) => {
            // Ensure we have exactly 4 options
            const options = [...item.options];
            while (options.length < 4) options.push("");

            // Convert numerical correctAnswer to letter (A, B, C, D)
            let correctAnswerLetter = "A";
            if (
              item.answer_index !== null &&
              item.answer_index >= 0 &&
              item.answer_index < 4
            ) {
              correctAnswerLetter = String.fromCharCode(65 + item.answer_index); // 65 = 'A'
            }

            return {
              question: item.question,
              options: options.slice(0, 4), // Take only first 4 options
              correctAnswer: correctAnswerLetter,
            };
          }
        );

        // Update examData with the converted questions
        setExamData({
          ...examData,
          questions:
            convertedQuestions.length > 0
              ? convertedQuestions
              : examData.questions,
        });
      }
    } catch (err: any) {
      setExtractError(
        `Failed to extract text: ${err.response?.data?.error || err.message}`
      );
      console.error(err);
    } finally {
      setIsExtracting(false);
    }
  };

  const uploadToIPFS = async () => {
    try {
      setIsLoading(true);
      setCid(""); // Reset CID state to clear any previous success message

      // Validate exam data
      if (!examData.examTitle.trim()) {
        alert("Please enter an exam title");
        setIsLoading(false);
        return;
      }

      // Upload JSON data via API route
      const response = await fetch("/api/exams", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(examData),
      });

      if (!response.ok) {
        throw new Error("Failed to upload exam");
      }

      const result = await response.json();
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

      // Send and await the transaction
      const txResult = await sendTransaction(transaction);
      console.log("Transaction sent:", txResult);
      console.log("successfully created exam in blockchain");

      // Now set the CID to display the success message
      setCid(result.cid);
      setPublicUrl(result.url);
    } catch (error) {
      console.error("Error uploading to IPFS:", error);
      alert("Failed to upload exam to IPFS");
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString();
  };

  return (
    <div className="min-h-screen bg-black-100 p-6">
      <div className="max-w-4xl mx-auto bg-black rounded shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6">Create Exam</h1>

        <div className="mb-6">
          <label className="block text-gray-700 font-bold mb-2">
            Exam Title
          </label>
          <input
            type="text"
            value={examData.examTitle}
            onChange={(e) => handleExamDataChange("examTitle", e.target.value)}
            className="w-full border rounded px-3 py-2"
            placeholder="Enter exam title"
          />
        </div>

        {/* Document extraction section */}
        <div className="mb-6 p-4 bg-gray-50 rounded border">
          <h2 className="text-xl font-bold mb-3">
            Import Questions from Document
          </h2>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">
              Upload document (image or PDF)
            </label>
            <input
              type="file"
              accept="image/*,.pdf"
              onChange={handleFileChange}
              className="w-full border p-2 rounded"
            />
          </div>

          <button
            onClick={extractTextFromDocument}
            disabled={isExtracting || !file}
            className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:bg-gray-400"
            type="button"
          >
            {isExtracting ? "Extracting..." : "Extract Questions"}
          </button>

          {extractError && (
            <div className="mt-4 p-3 bg-red-100 text-red-700 rounded">
              {extractError}
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-gray-700 font-bold mb-2">
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
              className="w-full border rounded px-3 py-2"
            />
            <p className="text-sm text-gray-500 mt-1">
              Unix Timestamp: {examData.startTime} (
              {formatDate(examData.startTime)})
            </p>
          </div>

          <div>
            <label className="block text-gray-700 font-bold mb-2">
              Duration (seconds)
            </label>
            <input
              type="number"
              value={examData.duration}
              onChange={(e) =>
                handleExamDataChange("duration", parseInt(e.target.value))
              }
              className="w-full border rounded px-3 py-2"
            />
            <p className="text-sm text-gray-500 mt-1">
              {Math.floor(examData.duration / 60)} minutes
            </p>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Questions</h2>
            <button
              onClick={addQuestion}
              className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
              type="button"
            >
              Add Question
            </button>
          </div>

          {examData.questions.map((question, qIndex) => (
            <div key={qIndex} className="mb-8 border-b pb-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold">Question {qIndex + 1}</h3>
                {examData.questions.length > 1 && (
                  <button
                    onClick={() => removeQuestion(qIndex)}
                    className="text-red-500 hover:text-red-700"
                    type="button"
                  >
                    Remove
                  </button>
                )}
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 mb-1">
                  Question Text
                </label>
                <textarea
                  value={question.question}
                  onChange={(e) =>
                    handleQuestionChange(qIndex, "question", e.target.value)
                  }
                  className="w-full border rounded px-3 py-2"
                  rows={2}
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 mb-1">Options</label>
                {["A", "B", "C", "D"].map((letter, oIndex) => (
                  <div key={oIndex} className="flex mb-2">
                    <span className="mr-2 font-bold">{letter}.</span>
                    <input
                      type="text"
                      value={question.options[oIndex] || ""}
                      onChange={(e) =>
                        handleOptionChange(qIndex, oIndex, e.target.value)
                      }
                      className="flex-1 border rounded px-3 py-1"
                    />
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-gray-700 mb-1">
                  Correct Answer
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
                  className="border rounded px-3 py-2"
                >
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                  <option value="D">D</option>
                </select>
              </div>
            </div>
          ))}
        </div>

        <div className="mb-6">
          <button
            onClick={uploadToIPFS}
            disabled={isLoading}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:bg-gray-400"
            type="button"
          >
            {isLoading ? "Uploading..." : "Upload to IPFS"}
          </button>
        </div>

        {isPending ? (
          <Spinner />
        ) : (
          <div>
            {cid && (
              <div className="p-4 bg-green-50 border border-green-200 rounded">
                <h3 className="font-bold text-green-700 mb-2">
                  Upload Successful!
                </h3>
                <p className="mb-2">Content Identifier (CID):</p>
                <div className="p-2 bg-gray-100 rounded font-mono break-all">
                  {cid}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
