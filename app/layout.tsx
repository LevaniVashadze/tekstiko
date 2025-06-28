import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { Providers } from "@/components/providers";

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-inter",
});

// Add metadata for SEO
export const metadata: Metadata = {
  title:
    "ტექსტიკო - ქართული გრამატიკის სასწავლო პლატფორმა | Georgian Grammar Learning Platform",
  description:
    "ქართული გრამატიკის უფასო სასწავლო პლატფორმა. ისწავლეთ და გაიუმჯობესეთ ქართული ენის ცოდნა ინტერაქტიული ვარჯიშებით. Free Georgian grammar learning platform with interactive exercises.",
  keywords:
    "ქართული გრამატიკა, georgian grammar, ქართული ენა, georgian language, სწავლება, learning, განათლება, education, ტექსტიკო, ქართული ენის სწავლება, georgian language learning, text correction, ტექსტის შესწორება",
  authors: [{ name: "ლევანი ვაშაძე (Levani Vashadze)" }],
  robots: "index, follow",
  viewport: "width=device-width, initial-scale=1.0",
  alternates: {
    canonical: "https://tekstiko.vercel.app",
    languages: {
      ka: "https://tekstiko.vercel.app",
      en: "https://tekstiko.vercel.app",
    },
  },
  openGraph: {
    title: "ტექსტიკო - ქართული გრამატიკის სასწავლო პლატფორმა",
    description:
      "ქართული გრამატიკის უფასო სასწავლო პლატფორმა ინტერაქტიული ვარჯიშებით. გააუმჯობესეთ ქართული ენის ცოდნა პრაქტიკული ვარჯიშებით.",
    type: "website",
    url: "https://tekstiko.vercel.app",
    siteName: "ტექსტიკო",
    locale: "ka_GE",
    alternateLocale: "en_US",
    images: [
      {
        url: "https://tekstiko.vercel.app/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "ტექსტიკო - ქართული გრამატიკის სასწავლო პლატფორმა",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ტექსტიკო - ქართული გრამატიკის სასწავლო პლატფორმა",
    description:
      "ქართული გრამატიკის უფასო სასწავლო პლატფორმა ინტერაქტიული ვარჯიშებით",
    images: ["https://tekstiko.vercel.app/twitter-image.jpg"],
  },
  other: {
    "Content-Language": "ka, en",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ka">
      <head>
        {/* Structured Data - JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "ტექსტიკო",
              alternateName: "Tekstiko",
              description:
                "ქართული გრამატიკის უფასო სასწავლო პლატფორმა ინტერაქტიული ვარჯიშებით",
              url: "https://tekstiko.vercel.app",
              applicationCategory: "EducationalApplication",
              operatingSystem: "Web Browser",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "USD",
              },
              creator: {
                "@type": "Person",
                name: "ლევანი ვაშაძე",
                alternateName: "Levani Vashadze",
              },
              inLanguage: ["ka", "en"],
              about: {
                "@type": "Thing",
                name: "Georgian Grammar Learning",
              },
              educationalUse: "practice",
              learningResourceType: "interactive exercise",
              audience: {
                "@type": "EducationalAudience",
                educationalRole: "student",
              },
            }),
          }}
        />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
