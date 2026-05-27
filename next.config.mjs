/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        // Allow next/image to load photos from Supabase Storage
        protocol: "https",
        hostname: "zqwfrhxmlwdwskkdcgwz.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
