import { NextResponse } from "next/server";

const buildDefaultRequest = () => ({
  body: {
    variables: {
      username: "Rudra",
      message: "Have to work hard.",
      taskTitle: "Card and Checkout",
      taskId: "PSY76W3FEE",
    },
    locale: "en",
  },
  to: [process.env.DEFAULT_EMAIL_TO ?? "rusarkar@lenovo.com"],
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const payload = body && typeof body === "object" ? body : buildDefaultRequest();

    const emailApiUrl = process.env.EMAIL_API_URL ?? "https://service-email-pt.dev.cloud.motorola.net";
    const response = await fetch(`${emailApiUrl}/send/demo_mail_for_email_scheduler`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const responseText = await response.text();
    let parsedBody: unknown = responseText;

    try {
      parsedBody = JSON.parse(responseText);
    } catch {
      // swallow parse errors and keep raw text
    }

    return NextResponse.json(
      {
        success: response.ok,
        status: response.status,
        remoteResponse: parsedBody,
      },
      { status: response.ok ? 200 : response.status }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
