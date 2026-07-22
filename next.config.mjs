/** @type {import('next').NextConfig} */
const nextConfig = {
  // Keep the WASM-based PDF renderer out of the webpack bundle so its .wasm
  // asset loads correctly in the serverless function.
  experimental: {
    serverComponentsExternalPackages: ["mupdf"],
    // Make sure the .wasm binary is traced into the serverless function.
    outputFileTracingIncludes: {
      "/api/extract-text": ["./node_modules/mupdf/dist/*.wasm"],
    },
  },
};

export default nextConfig;
