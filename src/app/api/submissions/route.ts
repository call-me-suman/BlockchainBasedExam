// app/api/submissions/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createThirdwebClient, getContract } from "thirdweb";
import { defineChain } from "thirdweb/chains";

// Create the client with your clientId
const client = createThirdwebClient({
  clientId: "f74a735820f866854c58f30896bc36a5",
});

// Connect to your contract
const contract = getContract({
  client,
  chain: defineChain(11155111), // Sepolia testnet
  address: "0x34B9fD9b646Ade28fDd659Bf34Edd027c60445B1",
});

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const examId = searchParams.get("examId");
    const studentAddress = searchParams.get("studentAddress");

    if (!examId || !studentAddress) {
      return NextResponse.json(
        { error: "Exam ID and student address are required" },
        { status: 400 }
      );
    }

    // Call the contract's getStudentSubmission function
    const submission = await contract.call("getStudentSubmission", [
      BigInt(examId),
      studentAddress,
    ]);

    return NextResponse.json({ submission });
  } catch (error) {
    console.error("Error fetching submission:", error);
    return NextResponse.json(
      { error: "Failed to fetch submission" },
      { status: 500 }
    );
  }
}
