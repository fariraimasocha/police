"use client";
import React, { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CalendarIcon, FileTextIcon, AlertCircle } from "lucide-react";
import { toast } from "sonner";

const fetchUserOffences = async (userId) => {
  const response = await axios.get(`/api/offence/${userId}`);
  return response.data;
};

export default function MyOffences() {
  const { data: session, status } = useSession();

  const {
    data: offencesData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["userOffences", session?.user?.id],
    queryFn: () => fetchUserOffences(session?.user?.id),
    enabled: !!session?.user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });

  // Show loading toast when fetching data
  useEffect(() => {
    if (isLoading) {
      toast.loading("Loading your offences...", {
        id: "loading-offences",
      });
    } else {
      toast.dismiss("loading-offences");
    }
  }, [isLoading]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Loading state while session is being fetched
  if (status === "loading") {
    return (
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">My Offences</h1>
          <p className="text-muted-foreground">
            View all offences associated with your account.
          </p>
        </div>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading session...</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!session) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please sign in to view your offences.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">My Offences</h1>
        <p className="text-muted-foreground">
          View all offences associated with your account.
        </p>
      </div>

      {/* Error State */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load offences: {error.message}
            <button
              onClick={() => refetch()}
              className="ml-2 underline hover:no-underline"
            >
              Try again
            </button>
          </AlertDescription>
        </Alert>
      )}

      {/* Success State */}
      {offencesData?.success && (
        <>
          {/* Offences Grid */}
          {offencesData.data?.length === 0 ? (
            <Card className="w-full">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileTextIcon className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  No offences found
                </h3>
                <p className="text-muted-foreground text-center">
                  You currently have no offence records in the system.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {offencesData.data?.map((offence) => (
                <Card
                  key={offence._id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg line-clamp-2">
                        Offence Record
                      </CardTitle>
                      <span className="text-sm text-muted-foreground">
                        {new Date(
                          offence.createdAt || offence.timestamp
                        ).getFullYear()}
                      </span>
                    </div>
                    <CardDescription className="flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4" />
                      {formatDate(offence.offenceDate)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-1">
                          Details
                        </h4>
                        <p className="text-sm line-clamp-3">
                          {offence.offenceDetails}
                        </p>
                      </div>

                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Record ID: {offence._id.slice(-6)}</span>
                        <span>
                          Created:{" "}
                          {formatDate(offence.createdAt || offence.timestamp)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
