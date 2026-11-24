import { defineConfig, globalIgnores } from "eslint/config";
import nextCore from "eslint-config-next/core-web-vitals";
import nextTypes from "eslint-config-next/typescript";

export default defineConfig([
  ...nextCore,
  ...nextTypes,
  globalIgnores([".next/**", "next-env.d.ts"]),
]);
