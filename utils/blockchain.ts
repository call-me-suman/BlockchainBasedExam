// blockchain.ts
import { prepareContractCall } from "thirdweb";
import { useSendTransaction } from "thirdweb/react";
import { createThirdwebClient, getContract } from "thirdweb";
import { defineChain } from "thirdweb/chains";
import { useReadContract } from "thirdweb/react";

// Create the client with your clientId
const client = createThirdwebClient({
  clientId: "116b3c1063b8f963d72d7286daa689b2",
  // clientId: "0e1f854c4c9b1a453af2935960947936",
});

// Connect to your contract
const contract = getContract({
  client,
  chain: defineChain(11155111), // Sepolia testnet
  // address: "0x17e8FfF2395938B1B45e7e01e5a079E1996662ac",

  address: "0xC33FDB55D1812578560421613c6D58cEf8C4e801",
});

// Write Functions
export const useExamFunctions = () => {
  const { mutate: sendTransaction, error: transactionError } =
    useSendTransaction();

  const createExam = async (
    title: string,
    startTime: bigint,
    duration: bigint,
    questionsHash: string
  ) => {
    if (!title || title.trim() === "") {
      throw new Error("Title cannot be empty");
    }
    if (!startTime || startTime <= Math.floor(Date.now() / 1000)) {
      throw new Error("Start time must be in the future");
    }
    if (!duration || duration <= 0) {
      throw new Error("Duration must be positive");
    }
    if (!questionsHash || questionsHash.trim() === "") {
      throw new Error("Questions hash cannot be empty");
    }
    try {
      const transaction = await prepareContractCall({
        contract,
        method:
          "function createExamWithQuestions(string title, uint256 startTime, uint256 duration, string questionsHash)",
        params: [title, startTime, duration, questionsHash],
      });

      return sendTransaction(transaction);
    } catch (error) {
      console.error("Error creating exam:", error);
      throw error;
    }
  };

  const registerStudent = async (studentId: string) => {
    if (!studentId || studentId.trim() === "") {
      throw new Error("Student ID cannot be empty");
    }

    try {
      const transaction = await prepareContractCall({
        contract,
        method: "function registerStudent(string studentId)",
        params: [studentId],
      });

      return sendTransaction(transaction);
    } catch (error) {
      console.error("Error registering student:", error);
      throw error;
    }
  };

  const submitAnswers = async (examId: bigint, answerHash: string) => {
    if (examId < 0) {
      throw new Error("Exam ID must be a positive number");
    }
    if (!answerHash || answerHash.trim() === "") {
      throw new Error("Answer hash cannot be empty");
    }

    try {
      const transaction = await prepareContractCall({
        contract,
        method: "function submitAnswers(uint256 examId, string answerHash)",
        params: [examId, answerHash],
      });

      return sendTransaction(transaction);
    } catch (error) {
      console.error("Error submitting answers:", error);
      throw error;
    }
  };

  const updateExamStatus = async (examId: bigint, isActive: boolean) => {
    if (examId < 0) {
      throw new Error("Exam ID must be a positive number");
    }

    try {
      const transaction = await prepareContractCall({
        contract,
        method: "function updateExamStatus(uint256 examId, bool isActive)",
        params: [examId, isActive],
      });

      return sendTransaction(transaction);
    } catch (error) {
      console.error("Error updating exam status:", error);
      throw error;
    }
  };

  const verifyStudent = async (studentAddress: string) => {
    if (!studentAddress || !studentAddress.startsWith("0x")) {
      throw new Error("Invalid student address");
    }

    try {
      const transaction = await prepareContractCall({
        contract,
        method: "function verifyStudent(address student)",
        params: [studentAddress],
      });

      return sendTransaction(transaction);
    } catch (error) {
      console.error("Error verifying student:", error);
      throw error;
    }
  };

  return {
    createExam,
    registerStudent,
    submitAnswers,
    updateExamStatus,
    verifyStudent,
    transactionError,
  };
};

// Read Functions - Custom hooks
export const useGetQuestions = (examId: bigint) => {
  return useReadContract({
    contract,
    method: "function getQuestions(uint256 examId) view returns (string)",
    params: [examId],
  });
};

export const useGetAllExams = () => {
  return useReadContract({
    contract,
    method:
      "function getAllExams() view returns (uint256[] examIds, string[] titles, uint256[] startTimes, uint256[] durations, bool[] activeStatus)",
    params: [],
  });
};

export const useGetExamMeta = (examId: bigint) => {
  return useReadContract({
    contract,
    method:
      "function getExamMeta(uint256 examId) view returns (string title, uint256 startTime, uint256 duration, bool isActive)",
    params: [examId],
  });
};

export const useGetStudentSubmission = (
  examId: bigint,
  studentAddress: string
) => {
  return useReadContract({
    contract,
    method:
      "function getStudentSubmission(uint256 examId, address student) view returns (string)",
    params: [examId, studentAddress],
  });
};

export const useGetStudentsForExam = (examId: bigint) => {
  return useReadContract({
    contract,
    method:
      "function getStudentsForExam(uint256 examId) view returns (address[])",
    params: [examId],
  });
};

export const useIsExamAvailable = (examId: bigint) => {
  return useReadContract({
    contract,
    method: "function isExamAvailable(uint256 examId) view returns (bool)",
    params: [examId],
  });
};

export const useIsStudentVerified = (studentAddress: string) => {
  return useReadContract({
    contract,
    method: "function isStudentVerified(address student) view returns (bool)",
    params: [studentAddress],
  });
};
export const useIsStudentSubmitted = (
  studentAddress: string,
  examId: bigint
) => {
  return useReadContract({
    contract,
    method:
      "function hasSubmitted(uint256 examId, address student) view returns (bool)",
    params: [examId, studentAddress],
  });
};

export const useGetExamCount = () => {
  return useReadContract({
    contract,
    method: "function getExamCount() view returns (uint256)",
    params: [],
  });
};

export const useGetAllStudents = () => {
  return useReadContract({
    contract,
    method:
      "function getAllStudents() view returns (address[] studentAddresses, string[] studentIdList, bool[] verificationStatus)",
    params: [],
  });
};

export const useGetExamById = (examId: bigint) => {
  return useReadContract({
    contract,
    method:
      "function getExamById(uint256 examId) view returns (string title, uint256 startTime, uint256 duration, bool isActive, string questionsHash)",
    params: [examId],
  });
};

export const useGetAllSubmissions = (examId: bigint) => {
  return useReadContract({
    contract,
    method:
      "function getAllSubmissions(uint256 examId) view returns (address[] students, string[] submissions)",
    params: [examId],
  });
};
