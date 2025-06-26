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
import {
  UserIcon,
  FingerprintIcon,
  AlertCircle,
  ImageIcon,
} from "lucide-react";
import { toast } from "sonner";

const fetchUserFingerprints = async (userId) => {
  const response = await axios.get(`/api/fingerprint/${userId}`);
  return response.data;
};

export default function UserFingerprints() {
  const { data: session, status } = useSession();

  const {
    data: fingerprintData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["userFingerprints", session?.user?.id],
    queryFn: () => fetchUserFingerprints(session?.user?.id),
    enabled: !!session?.user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });

  // Show loading toast when fetching data
  useEffect(() => {
    if (isLoading) {
      toast.loading("Loading fingerprint data...", {
        id: "loading-fingerprints",
      });
    } else {
      toast.dismiss("loading-fingerprints");
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

  const formatFileSize = (bytes) => {
    if (!bytes) return "Unknown size";
    return (bytes / 1024 / 1024).toFixed(2) + " MB";
  };

  // Loading state while session is being fetched
  if (status === "loading") {
    return (
      <div className="w-full max-w-md space-y-4">
        <div className="space-y-2">
          <h2 className="text-xl font-bold">My Fingerprints</h2>
          <p className="text-muted-foreground text-sm">Loading session...</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!session) {
    return (
      <div className="w-full max-w-md">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please sign in to view fingerprint data.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <FingerprintIcon className="h-5 w-5" />
          My Fingerprints
        </h2>
        <p className="text-muted-foreground text-sm">
          Your registered fingerprint data
        </p>
      </div>

      {/* Error State */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load fingerprint data: {error.message}
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
      {fingerprintData?.success && fingerprintData.data ? (
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <UserIcon className="h-5 w-5" />
                {fingerprintData.data.fullName}
              </CardTitle>
              <span className="text-sm text-muted-foreground">
                ID: {fingerprintData.data.idNumber}
              </span>
            </div>
            <CardDescription>
              Registered:{" "}
              {formatDate(
                fingerprintData.data.createdAt || fingerprintData.data.timestamp
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Fingerprint Image */}
              {fingerprintData.data.imageUrl && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">
                    Fingerprint Image
                  </h4>
                  <div className="relative border rounded-lg overflow-hidden bg-muted/20">
                    <img
                      src={fingerprintData.data.imageUrl}
                      alt="Fingerprint"
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors duration-200 flex items-center justify-center opacity-0 hover:opacity-100">
                      <ImageIcon className="h-8 w-8 text-white" />
                    </div>
                  </div>
                </div>
              )}

              {/* Image Details */}
              {fingerprintData.data.imageName && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">
                    File Details
                  </h4>
                  <div className="flex items-center justify-between p-2 border rounded bg-muted/20">
                    <div className="flex items-center space-x-2">
                      <ImageIcon className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs font-medium">
                          {fingerprintData.data.imageName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(fingerprintData.data.imageSize)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Record Info */}
              <div className="pt-2 border-t text-xs text-muted-foreground">
                <div className="flex justify-between">
                  <span>Record ID:</span>
                  <span>{fingerprintData.data._id.slice(-8)}</span>
                </div>
                {fingerprintData.data.userId && (
                  <div className="flex justify-between mt-1">
                    <span>User ID:</span>
                    <span>{fingerprintData.data.userId.slice(-8)}</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        // No fingerprint data found
        !isLoading && (
          <Card className="w-full">
            <CardContent className="flex flex-col items-center justify-center py-8">
              <FingerprintIcon className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                No fingerprint data found
              </h3>
              <p className="text-muted-foreground text-center text-sm">
                You haven't registered any fingerprint data yet.
              </p>
            </CardContent>
          </Card>
        )
      )}
    </div>
  );
}
