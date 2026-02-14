"use client";

export default function StructuredData() {
  const siteUrl = "https://meatheadpakistan.vercel.app";

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "MEATHEAD Pakistan",
    "url": siteUrl,
    "logo": `${siteUrl}/images/logo.webp`,
    "description": "Premium high-protein beef patties for gym enthusiasts in Islamabad and Rawalpindi",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Islamabad",
      "addressRegion": "Islamabad Capital Territory",
      "addressCountry": "PK"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": "33.6844",
      "longitude": "73.0479"
    },
    "areaServed": [
      {
        "@type": "City",
        "name": "Islamabad"
      },
      {
        "@type": "City",
        "name": "Rawalpindi"
      }
    ]
  };

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "MEATHEAD Premium Beef Patty",
    "image": `${siteUrl}/images/patty.webp`,
    "description": "High-protein pre-cooked beef patty with 24g+ protein per 125g serving. 85/15 lean-to-fat ratio. Zero fillers. Perfect for post-workout nutrition and muscle building.",
    "brand": {
      "@type": "Brand",
      "name": "MEATHEAD"
    },
    "nutrition": {
      "@type": "NutritionInformation",
      "calories": "280 calories",
      "proteinContent": "24g",
      "fatContent": "20g",
      "carbohydrateContent": "0g",
      "servingSize": "125g"
    },
    "offers": {
      "@type": "Offer",
      "url": `${siteUrl}/`,
      "priceCurrency": "PKR",
      "price": "325",
      "priceValidUntil": "2026-12-31",
      "availability": "https://schema.org/PreOrder",
      "itemCondition": "https://schema.org/NewCondition"
    },
    "category": "Food & Nutrition",
    "additionalProperty": [
      {
        "@type": "PropertyValue",
        "name": "Protein Content",
        "value": "24g+"
      },
      {
        "@type": "PropertyValue",
        "name": "Lean-to-Fat Ratio",
        "value": "85/15"
      },
      {
        "@type": "PropertyValue",
        "name": "Weight",
        "value": "125g"
      }
    ]
  };

  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "MEATHEAD Pakistan",
    "description": "Premium high-protein beef patties for fitness enthusiasts in Twin Cities",
    "image": `${siteUrl}/images/logo.webp`,
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Islamabad",
      "addressRegion": "Islamabad Capital Territory",
      "addressCountry": "PK"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": "33.6844",
      "longitude": "73.0479"
    },
    "url": siteUrl,
    "areaServed": ["Islamabad", "Rawalpindi"],
    "priceRange": "PKR 325-650",
    "paymentAccepted": "Cash, Bank Transfer"
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationSchema)
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productSchema)
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(localBusinessSchema)
        }}
      />
    </>
  );
}
