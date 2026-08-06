import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/leads-dashboard"],
    },
    sitemap: "https://fledgy.guide/sitemap.xml",
  };
}
