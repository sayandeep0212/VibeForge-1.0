import React from 'react';

const JsonLd = () => {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "GameLiminals",
    "url": "https://vibeforge-1-0.tech",
    "logo": "https://vibeforge-1-0.tech/Logos/logo.png",
    "sameAs": [
      "https://www.facebook.com/gameliminals",
      "https://www.instagram.com/gameliminals",
      "https://www.linkedin.com/company/gameliminals/",
      "https://www.youtube.com/@GameLiminals",
      "https://github.com/gameliminals"
    ],
    "description": "The first student-led game development club at Adamas University, pushing the boundaries of creativity and innovation."
  };

  const eventSchema = {
    "@context": "https://schema.org",
    "@type": "Event",
    "name": "VibeForge 1.0",
    "description": "A 5-hour intercollege vibe coding hackathon presented by GameLiminals.",
    "startDate": "2026-08-21T09:00:00+05:30",
    "endDate": "2026-08-21T14:00:00+05:30",
    "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
    "eventStatus": "https://schema.org/EventScheduled",
    "location": {
      "@type": "Place",
      "name": "Adamas University",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Barasat - Barrackpore Rd, 24 Parganas North",
        "addressLocality": "Kolkata",
        "postalCode": "700126",
        "addressRegion": "West Bengal",
        "addressCountry": "IN"
      }
    },
    "image": [
      "https://vibeforge-1-0.tech/images/vibeforge-banner.jpg"
    ],
    "organizer": {
      "@type": "Organization",
      "name": "GameLiminals",
      "url": "https://vibeforge-1-0.tech"
    },
    "offers": {
      "@type": "Offer",
      "url": "https://vibeforge-1-0.tech/register",
      "price": "0",
      "priceCurrency": "INR",
      "availability": "https://schema.org/InStock",
      "validFrom": "2026-05-01"
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(eventSchema) }}
      />
    </>
  );
};

export default JsonLd;
