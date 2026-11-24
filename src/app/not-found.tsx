import Link from "next/link";

export default function NotFound() {
  return (
    <div className="frame message-page">
      <h1>Building page not found</h1>
      <p>Try searching the atlas by name or address.</p>
      <Link className="button-accent" href="/explore">Explore buildings</Link>
    </div>
  );
}
