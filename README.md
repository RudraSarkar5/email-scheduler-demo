# Email Scheduler Demo App

This is a minimal one-page Next.js app that lets you pick a single date-time value and schedule an AWS EventBridge Scheduler job. The scheduler triggers a Lambda function, which then calls the email API endpoint exactly in the same pattern as your curl request.

## Features

- Single page only
- 1 field for date and time
- On Schedule click, app creates an AWS EventBridge Scheduler rule for that exact datetime
- Lambda receives the schedule trigger and calls the email API
- Matches the payload pattern from your curl example

## Local development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy the example env file:
   ```bash
   cp .env.example .env.local
   ```

3. Fill in your AWS and email values in `.env.local`.

4. Start the app:
   ```bash
   npm run dev
   ```

5. Open http://localhost:3000 and choose a date/time.

## AWS setup you need

### 1) Lambda function
Create a Lambda function in AWS that accepts the EventBridge Scheduler payload and calls your email endpoint.

Example payload shape the Lambda should receive:

```json
{
  "scheduledAt": "2026-10-09T15:30:00.000Z",
  "triggerSource": "eventbridge-scheduler",
  "body": {
    "variables": {
      "username": "Rudra",
      "message": "Have to work hard.",
      "taskTitle": "Card and Checkout",
      "taskId": "PSY76W3FEE"
    },
    "locale": "en"
  },
  "to": ["rusarkar@lenovo.com"]
}
```

Then the Lambda calls this endpoint:

```bash
curl -i -X POST "https://service-email-pt.dev.cloud.motorola.net/send/demo_mail_for_email_scheduler" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -d '{"body":{"variables":{"username":"Rudra","message":"Have to work hard.","taskTitle":"Card and Checkout","taskId":"PSY76W3FEE"},"locale":"en"},"to":["rusarkar@lenovo.com"]}'
```

### 2) EventBridge Scheduler role
Create an IAM role for EventBridge Scheduler that can invoke the Lambda.

Required policy example:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "lambda:InvokeFunction"
      ],
      "Resource": "arn:aws:lambda:us-east-1:123456789012:function:your-lambda-name"
    }
  ]
}
```

### 3) Environment variables in Vercel
Add these to Vercel Project Settings > Environment Variables:

```env
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_LAMBDA_FUNCTION_ARN=arn:aws:lambda:us-east-1:123456789012:function:your-lambda-name
AWS_SCHEDULER_ROLE_ARN=arn:aws:iam::123456789012:role/EventBridgeSchedulerToLambdaRole
DEFAULT_EMAIL_TO=rusarkar@lenovo.com
EMAIL_API_URL=https://service-email-pt.dev.cloud.motorola.net
```

### 4) Vercel deployment
- Push this project to GitHub.
- Import it into Vercel.
- Set the environment variables above.
- Deploy.

### 5) Important note
The app does not directly send the email from the browser. The browser only creates the schedule. The actual email send happens when the scheduled job triggers the AWS Lambda, and the Lambda calls your email endpoint.

## Lambda example logic

Your Lambda runtime can be a Node.js 18+ function like this:

```js
const https = require('https');

exports.handler = async (event) => {
  const payload = {
    body: {
      variables: {
        username: 'Rudra',
        message: 'Have to work hard.',
        taskTitle: 'Card and Checkout',
        taskId: 'PSY76W3FEE'
      },
      locale: 'en'
    },
    to: ['rusarkar@lenovo.com']
  };

  const body = JSON.stringify(payload);

  return new Promise((resolve, reject) => {
    const req = https.request('https://service-email-pt.dev.cloud.motorola.net/send/demo_mail_for_email_scheduler', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => resolve({ statusCode: res.statusCode, body: data }));
    });

    req.on('error', reject);
    req.write(body);
    req.end();
  });
};
```

This matches the request format you already tested from the curl command.
