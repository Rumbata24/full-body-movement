import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Skill Tracker",
    short_name: "Skill Tracker",
    description:
      "Autoregulated calisthenics skill training — check in, train, progress.",
    start_url: "/",
    display: "standalone",
    background_color: "#0f1117",
    theme_color: "#0f1117",
    orientation: "portrait",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
