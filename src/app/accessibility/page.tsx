import Link from "next/link";
import { pageMetadata } from "@/lib/site-metadata";

export const metadata = pageMetadata("/accessibility", "Accessibility statement", "Accessible ways to explore SkyInfoLine and how to report an accessibility barrier.");

export default function AccessibilityPage() {
  return (
    <article className="frame message-page policy-page">
      <h1>Accessibility statement</h1>
      <p>SkyInfoLine aims to make its building catalog usable with a keyboard, a screen reader, and a range of screen sizes.</p>

      <section aria-labelledby="accessibility-explore">
        <h2 id="accessibility-explore">Ways to explore</h2>
        <p>Use <strong>Skip to content</strong> to move past the header. The <Link href="/explore">Explore list</Link> lets you search and filter buildings and open their pages. It provides text navigation for anyone who prefers it to the interactive map.</p>
        <p>Building pages use headings and labeled facts. Photographs have text alternatives, with captions and credits next to the image.</p>
      </section>

      <section aria-labelledby="accessibility-report">
        <h2 id="accessibility-report">Report a barrier</h2>
        <p>If a page or feature is difficult to use, <a href="https://github.com/jakedcl/skyinfoline/issues/new">report an accessibility issue on GitHub</a>. Include the page address, what you were trying to do, and any browser or assistive technology details you’re comfortable sharing. Issues are public.</p>
      </section>
    </article>
  );
}
