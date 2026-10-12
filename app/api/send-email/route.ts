import { NextResponse } from "next/server";

const EMAIL_URL =
  "https://service-email-pt.dev.cloud.motorola.net/send/demo_mail_for_email_scheduler";

const PAYLOAD = {
  body: {
    variables: {
      username: "Rudra",
      message: "Have to work hard.",
      taskTitle: "Card and Checkout",
      taskId: "PSY76W3FEE",
    },
    locale: "en",
  },
  to: ["rusarkar@lenovo.com"],
};



export async function POST() {
  // Real email sending is disabled for now (the email service is only
  // reachable from the company network, not from Vercel).
  console.log("send-email called (mock): mail not actually sent");

  return NextResponse.json(
    { success: true, message: "Mail sent successfully" },
    { status: 200 }
  );
}

// export async function POST() {
//   try {
//     const response = await fetch(EMAIL_URL, {
//       method: "POST",
//       headers: {
//         Accept: "application/json",
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify(PAYLOAD),
//     });

//     const text = await response.text();
//     console.log("Email service status:", response.status, text);

//     let remoteResponse: unknown = text;
//     try {
//       remoteResponse = JSON.parse(text);
//     } catch {
//       // keep raw text
//     }

//     return NextResponse.json(
//       { success: response.ok, status: response.status, remoteResponse },
//       { status: response.ok ? 200 : response.status }
//     );
//   } catch (error) {
//     console.error("send-email failed:", error);
//     const message = error instanceof Error ? error.message : "Unknown error";
//     const cause =
//       error instanceof Error && error.cause ? String(error.cause) : undefined;
//     return NextResponse.json(
//       { success: false, error: message, cause },
//       { status: 500 }
//     );
//   }
// }