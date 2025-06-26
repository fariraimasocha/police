"use client";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Github, Chrome } from "lucide-react";
import SignIn from "next-auth/react";

export default function Auth() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center pb-6">
          <CardTitle className="text-2xl font-bold text-black">
            Welcome Back
          </CardTitle>
          <p className="text-gray-600 mt-2">
            Sign in to continue to your dashboard
          </p>
        </CardHeader>

        <CardContent className="space-y-4">
          <Button
            variant="outline"
            className="w-full h-12 text-black border-gray-300 hover:bg-gray-50"
            onClick={() =>
              SignIn.signIn("google", { callbackUrl: "/dashboard" })
            }
          >
            <Chrome className="mr-3 h-5 w-5" />
            Continue with Google
          </Button>

          <Button
            variant="outline"
            className="w-full h-12 text-black border-gray-300 hover:bg-gray-50"
            onClick={() =>
              SignIn.signIn("github", { callbackUrl: "/dashboard" })
            }
          >
            <Github className="mr-3 h-5 w-5" />
            Continue with GitHub
          </Button>
        </CardContent>

        <CardFooter className="text-center pt-6">
          <p className="text-sm text-gray-500">Changing the way we chat</p>
        </CardFooter>
      </Card>
    </div>
  );
}
