import { CreateScheduleCommand, SchedulerClient } from "@aws-sdk/client-scheduler";
import { NextResponse } from "next/server";

const buildPayload = () => ({
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

const buildScheduleExpression = (scheduledAt: Date) => {
  const iso = scheduledAt.toISOString();
  return `at(${iso.replace(/\.\d{3}Z$/, "")})`;
};

export async function POST(request: Request) {
  try {
    const { scheduleAt } = await request.json();

    if (!scheduleAt) {
      return NextResponse.json(
        { success: false, error: "scheduleAt is required" },
        { status: 400 }
      );
    }

    const targetDate = new Date(scheduleAt);

    if (Number.isNaN(targetDate.getTime())) {
      return NextResponse.json(
        { success: false, error: "scheduleAt must be a valid date-time value" },
        { status: 400 }
      );
    }

    const now = new Date();
    if (targetDate.getTime() <= now.getTime()) {
      return NextResponse.json(
        { success: false, error: "Please select a future date and time" },
        { status: 400 }
      );
    }

    const lambdaArn = process.env.AWS_LAMBDA_FUNCTION_ARN;
    const roleArn = process.env.AWS_SCHEDULER_ROLE_ARN;

    if (!lambdaArn || !roleArn) {
      return NextResponse.json(
        {
          success: false,
          error:
            "AWS_LAMBDA_FUNCTION_ARN and AWS_SCHEDULER_ROLE_ARN must be configured in Vercel environment variables.",
        },
        { status: 500 }
      );
    }

    const region = process.env.AWS_REGION ?? "us-east-1";
    const scheduler = new SchedulerClient({
      region,
      credentials:
        process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
          ? {
              accessKeyId: process.env.AWS_ACCESS_KEY_ID,
              secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            }
          : undefined,
    });

    const scheduleName = `demo-email-${Date.now()}`;
    const targetInput = {
      scheduledAt: targetDate.toISOString(),
      triggerSource: "eventbridge-scheduler",
      ...buildPayload(),
    };

    const command = new CreateScheduleCommand({
      Name: scheduleName,
      ScheduleExpression: buildScheduleExpression(targetDate),
      ScheduleExpressionTimezone: "UTC",
      State: "ENABLED",
      FlexibleTimeWindow: { Mode: "OFF" },
      Target: {
        Arn: lambdaArn,
        RoleArn: roleArn,
        Input: JSON.stringify(targetInput),
      },
    });

    const response = await scheduler.send(command);

    return NextResponse.json({
      success: true,
      scheduleName,
      scheduledAt: targetDate.toISOString(),
      scheduleExpression: buildScheduleExpression(targetDate),
      awsResponse: response,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
