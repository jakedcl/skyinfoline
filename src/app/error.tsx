"use client";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <div className="frame message-page">
      <h1>The atlas couldn’t load</h1>
      <p>Try loading this page again.</p>
      <button type="button" className="button-accent" onClick={reset}>Try again</button>
    </div>
  );
}
