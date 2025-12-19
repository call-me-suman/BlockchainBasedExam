import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { pinata } from "../../../../../utils/config";


// Explicitly type the params to match what Next.js expects
export async function GET(
  request: NextRequest,
  { params }: { params: { cid: string } }
) {
  try {
    // Access the cid directly from params without awaiting
    const cid = params.cid;

    if (!cid) {
      return NextResponse.json({ error: "CID is required" }, { status: 400 });
    }

    // Get the content from IPFS using the gateway
    const url = await pinata.gateways.public.convert(cid);
    const response = await fetch(
      `${url}?pinataGatewayToken=FzK7HrZ2ovtj3xUeBdSC61fmg9EufkdGutpdbdr5V8jUAvtuRV5vaKveY7rXhD7q`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch exam data: ${response.statusText}`);
    }

    const examData = await response.json();
    return NextResponse.json(examData, { status: 200 });
  } catch (error) {
    console.error("Error fetching exam data:", error);
    return NextResponse.json(
      { error: "Failed to retrieve exam data" },
      { status: 500 }
    );
  }
}
