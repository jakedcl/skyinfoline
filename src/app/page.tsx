import Image from "next/image";
import Link from "next/link";
import { ChevronRight, Map, Search } from "lucide-react";
import { BuildingRow } from "@/components/building-row";
import { boroughCounts, featuredBuildings } from "@/lib/catalog";
import { boroughs, explorePath } from "@/lib/presentation";

const examples = ["Jenga Building", "Original Penn Station", "30 Rock"];

export default function Home() {
  return (
    <div className="frame home">
      <section className="hero" aria-labelledby="home-title">
        <div className="hero-copy">
          <p className="eyebrow">The New York City building atlas</p>
          <h1 id="home-title">New York,<br /><em>building by building.</em></h1>
          <p className="hero-intro">
            Find the buildings you know and the ones you’ve always wondered about. Explore their architecture, history, and place in the city.
          </p>
          <form action="/explore" className="hero-search" role="search" aria-label="Search buildings">
            <label className="sr-only" htmlFor="home-query">Building name, alias, or address</label>
            <Search className="search-icon" size={20} aria-hidden="true" />
            <input id="home-query" name="q" type="search" placeholder="Building name, alias, or address" autoComplete="off" required />
            <button className="button-accent" type="submit">Search</button>
          </form>
          <div className="quick-search" aria-label="Example searches">
            {examples.map((name) => <Link key={name} href={explorePath({ q: name })}>{name}</Link>)}
          </div>
        </div>
        <figure className="hero-photo">
          <div className="hero-photo-window">
            <Image src="/nyc-skyline-from-brooklyn.jpg" alt="Early twentieth-century Lower Manhattan skyline seen across the East River from the Brooklyn waterfront" fill preload sizes="(max-width: 760px) 90vw, 46vw" />
          </div>
          <figcaption>
            <span>New York skyline from Brooklyn, 1900–1920</span>
            <a href="https://www.loc.gov/item/2016796126/">Library of Congress</a>
          </figcaption>
        </figure>
      </section>

      <section className="borough-section" aria-labelledby="borough-title">
        <div className="section-head">
          <h2 id="borough-title">Explore by borough</h2>
          <Link className="text-link" href="/explore?view=map"><Map size={17} aria-hidden="true" /> Open the map</Link>
        </div>
        <ul className="borough-list">
          {boroughs.map((borough) => (
            <li key={borough}>
              <Link href={explorePath({ borough })}>
                <span className="borough-name">{borough}</span>
                <span className="borough-count">{boroughCounts.get(borough)?.toLocaleString("en-US") ?? "0"} entries</span>
                <ChevronRight size={17} aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="featured-section" aria-labelledby="featured-title">
        <div className="section-head">
          <h2 id="featured-title">From the atlas</h2>
          <Link className="text-link" href="/explore">Browse all buildings</Link>
        </div>
        <div className="building-list">
          {featuredBuildings.map((building) => <BuildingRow key={building.id} building={building} />)}
        </div>
      </section>
    </div>
  );
}
