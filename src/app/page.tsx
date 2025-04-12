import { auth } from "@clerk/nextjs";
import LandingPage from "@/components/landing-page/LandingPage";
import QnA from "@/components/research-dashboard/QnA";
import UserInput from "@/components/research-dashboard/UserInput";
import { UserButton } from "@clerk/nextjs";
import { Brain } from "lucide-react";
import Image from "next/image";
import bg from "../../public/background.png";

export default function Home() {
  const { userId } = auth();

  if (!userId) {
    return <LandingPage />;
  }

  return (
    <main className="min-h-screen w-full flex flex-col items-center justify-start gap-8 py-16 relative text-black">
      <div className="fixed inset-0 -z-10">
        <Image
          src={bg}
          alt="Background"
          fill
          priority
          quality={100}
          className="object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-white/10"></div>
      </div>

      <header className="w-full container mx-auto px-4 py-4 absolute top-0 left-0 right-0 z-20">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Brain className="w-6 h-6 text-primary" />
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              DeepQuest
            </span>
          </div>
          <UserButton afterSignOutUrl="/" />
        </div>
      </header>

      <div className="fixed inset-0 -z-5 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-b from-purple-100 to-transparent rounded-full blur-3xl opacity-50"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-t from-indigo-100 to-transparent rounded-full blur-3xl opacity-50"></div>
      </div>

      <div className="flex flex-col items-center gap-4 mt-12">
        <h1 className="text-5xl sm:text-8xl font-bold font-dancing-script italic bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          DeepQuest
        </h1>
        <p className="text-gray-600 text-center max-w-[90vw] sm:max-w-[50vw]">
          Enter a topic and answer a few questions to generate a comprehensive research report.
        </p>
      </div>

      <div className="light w-full max-w-4xl">
        <UserInput />
        <QnA />
      </div>
    </main>
  );
}