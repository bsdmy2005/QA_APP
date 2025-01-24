import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import Header from "@/components/header";
import { getProfileByIdAction } from "@/actions/profiles-actions";

const inter = Inter({ subsets: ["latin"] });

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();
  let isAdmin = false;

  if (userId) {
    const profileResult = await getProfileByIdAction(userId);
    isAdmin = profileResult.data?.role === 'admin';
  }

  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>
          <Header isAdmin={isAdmin} />
          <main className="pt-16">
            {children}
          </main>
        </body>
      </html>
    </ClerkProvider>
  );
}
