import { getServerSession } from "next-auth";
import { BetweenApp } from "@/components/between-app";
import { authOptions, googleConfigured } from "@/lib/auth";

export default async function Home() {
  const session = googleConfigured ? await getServerSession(authOptions) : null;
  return (
    <BetweenApp
      signedIn={Boolean(session)}
      oauthConfigured={googleConfigured}
      userName={session?.user?.name}
    />
  );
}
