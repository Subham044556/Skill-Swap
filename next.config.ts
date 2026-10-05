import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
<<<<<<< HEAD
        hostname: "api.dicebear.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com", // Recommended: For Google OAuth user avatars
=======
        hostname: "lh3.googleusercontent.com",
>>>>>>> 6fca2efe2925b1c104dd98e724099178d71bc842
      },
    ],
  },
};

export default nextConfig;