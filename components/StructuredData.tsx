export default function StructuredData() {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "MEATHEAD Pakistan",
    "url": "https://meathead.pk",
    "logo": "https://meathead.pk/images/logo.webp",
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
    ],
    "sameAs": []
  };

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "MEATHEAD Premium Beef Patty",
    "image": "https://meathead.pk/images/patty.webp",
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
      "url": "https://meathead.pk",
      "priceCurrency": "PKR",
      "price": "325",
      "priceValidUntil": "2026-12-31",
      "availability": "https://schema.org/PreOrder",
      "itemCondition": "https://schema.org/NewCondition",
      "areaServed": {
        "@type": "GeoCircle",
        "geoMidpoint": {
          "@type": "GeoCoordinates",
          "latitude": "33.6844",
          "longitude": "73.0479"
        },
        "geoRadius": "50000"
      }
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "reviewCount": "127"
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
    "@type": "FoodEstablishment",
    "name": "MEATHEAD Pakistan",
    "description": "Premium high-protein beef patties for fitness enthusiasts in Twin Cities",
    "image": "https://meathead.pk/images/logo.webp",
    "servesCuisine": "Pakistani, Protein-Rich Food",
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
    "url": "https://meathead.pk",
    "priceRange": "PKR 325-650",
    "paymentAccepted": "Cash, Bank Transfer",
    "hasMenu": {
      "@type": "Menu",
      "hasMenuSection": {
        "@type": "MenuSection",
        "name": "Beef Patties",
        "hasMenuItem": [
          {
            "@type": "MenuItem",
            "name": "MEATHEAD Double Pack",
            "description": "2 x 125g premium beef patties with 24g+ protein each",
            "nutrition": {
              "@type": "NutritionInformation",
              "proteinContent": "48g+",
              "servingSize": "250g (2 patties)"
            },
            "offers": {
              "@type": "Offer",
              "price": "650",
              "priceCurrency": "PKR"
            }
          }
        ]
      }
    }
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "MEATHEAD Pakistan",
    "url": "https://meathead.pk",
    "description": "High-protein beef patties for gym enthusiasts in Islamabad and Rawalpindi",
    "publisher": {
      "@type": "Organization",
      "name": "MEATHEAD Pakistan"
    },
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://meathead.pk?search={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    }
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(websiteSchema)
        }}
      />
    </>
  );
}
