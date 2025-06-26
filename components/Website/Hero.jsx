import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="min-h-screen flex items-center justify-center px-4 py-16">
      <div className="max-w-4xl mx-auto text-center space-y-8">
        <h1 className="text-4xl md:text-6xl font-bold text-black leading-tight">
          Making Police Clearence Effortless with OClear
        </h1>

        <p className="text-lg md:text-xl text-gray-700 max-w-2xl mx-auto leading-relaxed">
          OClear is a cutting-edge platform designed to streamline the police
          clearance process, making it faster and more efficient for both
          applicants and law enforcement agencies. With OClear, you can say
          goodbye to long queues and paperwork hassles.
        </p>

        <div className="pt-4">
          <Link href="/auth">
            <Button
              size="lg"
              className="bg-black text-white hover:bg-gray-800 px-8 py-3 text-lg font-medium rounded-lg transition-colors"
            >
              Get Started
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
