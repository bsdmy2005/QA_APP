import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { auth, currentUser } from "@clerk/nextjs/server";
import Header from "@/components/header";
import { getProfileByIdAction, createProfileAction } from "@/actions/profiles-actions";

const inter = Inter({ subsets: ["latin"] });

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();
  let isAdmin = false;

  if (userId) {
    try {
      const profileResult = await getProfileByIdAction(userId);
      
      if (profileResult.isSuccess && profileResult.data) {
        isAdmin = profileResult.data.role === 'admin';
      } else {
        // Profile doesn't exist, create one
        const user = await currentUser();
        if (user) {
          const createResult = await createProfileAction({
            userId,
            firstName: user.firstName || "",
            lastName: user.lastName || "",
            email: user.emailAddresses[0]?.emailAddress || "",
            role: "user",
            membership: "free",
          });
          
          if (createResult.isSuccess && createResult.data) {
            isAdmin = createResult.data.role === 'admin';
          }
        }
      }
    } catch (error) {
      console.error("Error handling profile:", error);
    }
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
