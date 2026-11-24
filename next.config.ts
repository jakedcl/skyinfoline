import type { NextConfig } from "next";

const config: NextConfig = {
  outputFileTracingIncludes: { "/*": ["./atlas/*.jsonl"] },
};

export default config;
