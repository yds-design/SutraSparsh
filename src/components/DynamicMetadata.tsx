import React, { useEffect } from "react";

export interface DynamicMetadataProps {
  title: string;
  description: string;
  keywords?: string;
  robots?: string;
  ogType?: "website" | "article" | "book";
  canonicalUrl?: string;
  imageUrl?: string;
  imageAlt?: string;
  structuredData?: Record<string, any>;
}

/**
 * DynamicMetadata Component
 * Dynamically updates document title, meta tags (description, keywords, robots, Open Graph, Twitter),
 * image previews, and JSON-LD structured data based on the currently active view or tool to maximize
 * search engine indexing and social preview fidelity.
 */
export const DynamicMetadata: React.FC<DynamicMetadataProps> = ({
  title,
  description,
  keywords,
  robots,
  ogType = "website",
  canonicalUrl,
  imageUrl,
  imageAlt,
  structuredData,
}) => {
  useEffect(() => {
    if (typeof document === "undefined") return;

    const defaultImage = "https://sutrasparsh.com/icon-1024.png";
    const resolvedImage = imageUrl || defaultImage;
    const resolvedImageAlt = imageAlt || "SutraSparsh - Sacred Vedic Wisdom Platform";

    // 1. Update Document Title
    const formattedTitle = title.includes("SutraSparsh")
      ? title
      : `${title} | SutraSparsh`;
    document.title = formattedTitle;

    // Helper to safely upsert meta elements
    const setMetaTag = (attribute: "name" | "property", key: string, content: string) => {
      let meta = document.querySelector(`meta[${attribute}="${key}"]`) as HTMLMetaElement | null;
      if (!meta) {
        meta = document.createElement("meta");
        meta.setAttribute(attribute, key);
        document.head.appendChild(meta);
      }
      meta.setAttribute("content", content);
    };

    // 2. Standard Search Engine Meta Tags
    setMetaTag("name", "description", description);
    if (keywords) {
      setMetaTag("name", "keywords", keywords);
    }
    if (robots) {
      setMetaTag("name", "robots", robots);
    }

    // 3. Open Graph Tags (Facebook, LinkedIn, Messaging Apps)
    setMetaTag("property", "og:title", formattedTitle);
    setMetaTag("property", "og:description", description);
    setMetaTag("property", "og:type", ogType);
    setMetaTag("property", "og:site_name", "SutraSparsh");
    setMetaTag("property", "og:image", resolvedImage);
    setMetaTag("property", "og:image:secure_url", resolvedImage);
    setMetaTag("property", "og:image:alt", resolvedImageAlt);

    // 4. Twitter Card Tags
    setMetaTag("name", "twitter:card", "summary_large_image");
    setMetaTag("name", "twitter:site", "@SutraSparsh");
    setMetaTag("name", "twitter:creator", "@SutraSparsh");
    setMetaTag("name", "twitter:title", formattedTitle);
    setMetaTag("name", "twitter:description", description);
    setMetaTag("name", "twitter:image", resolvedImage);
    setMetaTag("name", "twitter:image:alt", resolvedImageAlt);

    // 5. Canonical Link
    const targetUrl =
      canonicalUrl || (typeof window !== "undefined" ? window.location.href.split("#")[0] : "https://sutrasparsh.com/");
    if (targetUrl) {
      let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
      if (!link) {
        link = document.createElement("link");
        link.setAttribute("rel", "canonical");
        document.head.appendChild(link);
      }
      link.setAttribute("href", targetUrl);
      setMetaTag("property", "og:url", targetUrl);
    }

    // 6. JSON-LD Structured Data Schema for Search Engines
    const scriptId = "sutrasparsh-dynamic-jsonld";
    let jsonLdScript = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (!jsonLdScript) {
      jsonLdScript = document.createElement("script");
      jsonLdScript.id = scriptId;
      jsonLdScript.type = "application/ld+json";
      document.head.appendChild(jsonLdScript);
    }

    const defaultSchema = {
      "@context": "https://schema.org",
      "@type": ogType === "article" || ogType === "book" ? "Article" : "WebPage",
      name: formattedTitle,
      headline: formattedTitle,
      description: description,
      image: resolvedImage,
      publisher: {
        "@type": "Organization",
        name: "SutraSparsh",
        url: typeof window !== "undefined" ? window.location.origin : "https://sutrasparsh.com",
        logo: {
          "@type": "ImageObject",
          url: "https://sutrasparsh.com/icon-1024.png",
        },
      },
      inLanguage: ["sa", "en", "hi"],
      keywords: keywords || "Sanskrit, Shloka, Bhagavad Gita, Upanishads, Yoga Sutras, Sadhana",
      ...(structuredData || {}),
    };

    jsonLdScript.textContent = JSON.stringify(defaultSchema);
  }, [title, description, keywords, ogType, canonicalUrl, imageUrl, imageAlt, structuredData]);

  return null;
};
