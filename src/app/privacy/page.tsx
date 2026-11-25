import { pageMetadata } from "@/lib/site-metadata";

export const metadata = pageMetadata("/privacy", "Privacy policy", "How SkyInfoLine handles website requests, search URLs, and browser storage for its map.");

export default function PrivacyPage() {
  return (
    <article className="frame message-page policy-page">
      <h1>Privacy policy</h1>
      <p>SkyInfoLine is a public architectural atlas. You can read building pages, search, and use the map without creating an account.</p>

      <section aria-labelledby="privacy-requests">
        <h2 id="privacy-requests">Website requests</h2>
        <p>When you search or filter the atlas, those values go in the page URL so you can return to your results or share them. Vercel hosts the site and processes web requests to serve pages, protect the service, and troubleshoot problems. Request information may include your IP address and the URL requested.</p>
        <p><a href="https://vercel.com/legal/privacy-notice">Vercel privacy notice</a></p>
      </section>

      <section aria-labelledby="privacy-map">
        <h2 id="privacy-map">Interactive map</h2>
        <p>The map requests its styles, map tiles, and map fonts from OpenFreeMap. OpenFreeMap handles those requests under its own privacy policy. SkyInfoLine also saves your last map position in your browser’s session storage so you can return to the same view while browsing in that tab.</p>
        <p><a href="https://openfreemap.org/privacy/">OpenFreeMap privacy policy</a></p>
      </section>

      <section aria-labelledby="privacy-external">
        <h2 id="privacy-external">External links</h2>
        <p>Building citations and photo credits link to archives and other websites. Those websites apply their own privacy policies when you visit them.</p>
      </section>

      <section aria-labelledby="privacy-contact">
        <h2 id="privacy-contact">Questions</h2>
        <p>For privacy questions, <a href="https://github.com/jakedcl/skyinfoline/issues/new">contact the project through GitHub</a>. Issues are public, so keep personal information out of your post.</p>
      </section>
    </article>
  );
}
