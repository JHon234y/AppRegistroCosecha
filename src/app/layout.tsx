import type {Metadata} from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'Harvest Logger',
  description: 'Registro de Cosechas App',
  manifest: '/manifest.json', // Link to the manifest file
  themeColor: '#1a5e1a', // Primary color from your style guide
  appleWebApp: { // For iOS PWA support
    capable: true,
    statusBarStyle: 'default', // or 'black-translucent'
    title: 'Harvest Logger',
    // startupImage: [], // You can add startup images for iOS here
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        {/* Standard PWA meta tags are handled by Next.js metadata object */}
        {/* You could add more specific link tags here if needed, e.g., for specific apple-touch-icons */}
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
