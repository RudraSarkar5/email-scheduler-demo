"use client";

import { useState, type FormEvent } from "react";

export default function Home() {
  const [scheduleAt, setScheduleAt] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSchedule = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!scheduleAt) {
      setStatus("Please select a date and time.");
      return;
    }

    setLoading(true);
    setStatus("");

    try {
      const response = await fetch("/api/schedule", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        // FIX: convert the local time to UTC (ends with "Z") before sending
        body: JSON.stringify({ scheduleAt: new Date(scheduleAt).toISOString() }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? "Unable to schedule email.");
      }

      setStatus(
        `Scheduled successfully for ${new Date(result.scheduledAt).toLocaleString()}`
      );
      setScheduleAt("");
    } catch (error) {
      setStatus(
        error instanceof Error ? error.message : "Something went wrong while scheduling."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="page-shell">
      <section className="card">
        <p className="eyebrow">Email Scheduler Demo</p>
        <h1>Schedule email</h1>

        <form onSubmit={handleSchedule} className="scheduler-form">
          <label htmlFor="scheduleAt" className="label">
            Date &amp; time
          </label>
          <input
            id="scheduleAt"
            type="datetime-local"
            value={scheduleAt}
            onChange={(event) => setScheduleAt(event.target.value)}
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? "Scheduling..." : "Schedule"}
          </button>
        </form>

        {status ? <p className="status">{status}</p> : null}
      </section>
    </main>
  );
}