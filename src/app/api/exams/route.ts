import { NextResponse, type NextRequest } from "next/server";
import { pinata } from "../../../../utils/config";

export async function POST(request: NextRequest) {
  try {
    const examData = await request.json();

    // Create a File object from the JSON data
    const blob = new Blob([JSON.stringify(examData)], {
      type: "application/json",
    });
    const file = new File(
      [blob],
      `exam-${examData.examTitle.replace(/\s+/g, "-").toLowerCase()}.json`
    );

    // Upload to Pinata
    const { cid } = await pinata.upload.public.file(file);

    // Get the public gateway URL
    const url = await pinata.gateways.public.convert(cid);

    return NextResponse.json({ cid, url }, { status: 200 });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to upload exam to IPFS" },
      { status: 500 }
    );
  }
}

// const JWT = "YOUR_PINATA_JWT";

// async function upload() {
//   try {
//     const formData = new FormData();

//     const file = new File(["hello"], "Testing.txt", { type: "text/plain" });

//     formData.append("file", file);

//     formData.append("network", "public");

//     const request = await fetch("https://uploads.pinata.cloud/v3/files", {
//       method: "POST",
//       headers: {
//         Authorization: `Bearer ${JWT}`,
//       },
//       body: formData,
//     });
//     const response = await request.json();
//     console.log(response);
//   } catch (error) {
//     console.log(error);
//   }
// }
