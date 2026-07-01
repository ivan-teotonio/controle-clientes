import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        // Substitua pelo nome do seu bucket se não estiver usando a variável de ambiente aqui
        hostname: `${process.env.NEXT_PUBLIC_AWS_BUCKET_NAME}.s3.amazonaws.com`,
      },
    ],
  },
};

export default nextConfig;
