"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axios from "axios";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, FileText, AlertTriangle } from "lucide-react";
import { UploadButton } from "@/utils/uploadThing";

const clearenceSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  idNumber: z.string().min(5, "ID number must be at least 5 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  imageUrl: z.string().min(1, "Image is required"),
  imageSize: z.number().optional(),
  imageName: z.string().optional(),
});

export default function Clearence() {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [verificationStatus, setVerificationStatus] = useState({
    imageMatch: null,
    hasOffences: null,
    isEligible: null,
  });
  const [userFingerprint, setUserFingerprint] = useState(null);
  const [userOffences, setUserOffences] = useState([]);

  const form = useForm({
    resolver: zodResolver(clearenceSchema),
    defaultValues: {
      fullName: "",
      idNumber: "",
      description: "",
      imageUrl: "",
      imageSize: 0,
      imageName: "",
    },
  });

  // Fetch user's fingerprint data when component mounts
  useEffect(() => {
    if (session?.user?.id) {
      fetchUserFingerprint();
      fetchUserOffences();
    }
  }, [session]);

  const fetchUserFingerprint = async () => {
    try {
      const response = await axios.get(`/api/fingerprint/${session.user.id}`);
      if (response.data.success) {
        setUserFingerprint(response.data.data);
      }
    } catch (error) {
      console.log("No fingerprint found for user");
      setUserFingerprint(null);
    }
  };

  const fetchUserOffences = async () => {
    try {
      const response = await axios.get(`/api/offence/${session.user.id}`);
      if (response.data.success) {
        setUserOffences(response.data.data);
      }
    } catch (error) {
      console.log("No offences found for user");
      setUserOffences([]);
    }
  };

  // Verify eligibility when image is uploaded
  const verifyEligibility = async (imageName, imageSize) => {
    if (!userFingerprint) {
      setVerificationStatus({
        imageMatch: false,
        hasOffences: null,
        isEligible: false,
      });
      toast.error(
        "No fingerprint record found. Please register your fingerprint first."
      );
      return;
    }

    // Check if uploaded image matches user's fingerprint image
    const imageMatch =
      userFingerprint.imageName === imageName &&
      userFingerprint.imageSize === imageSize;

    // Check if user has any offences
    const hasOffences = userOffences.length > 0;

    // User is eligible if image matches and has no offences
    const isEligible = imageMatch && !hasOffences;

    setVerificationStatus({
      imageMatch,
      hasOffences,
      isEligible,
    });

    if (imageMatch && !hasOffences) {
      toast.success("Verification successful! You are eligible for clearance.");
    } else if (!imageMatch) {
      toast.error(
        "Image verification failed. Uploaded image doesn't match your fingerprint record."
      );
    } else if (hasOffences) {
      toast.error(
        "Clearance denied. You have pending offences that must be resolved first."
      );
    }
  };

  const handleImageUpload = (res) => {
    if (res && res[0]) {
      const { url, size, name } = res[0];
      setUploadedImage({ url, size, name });
      form.setValue("imageUrl", url);
      form.setValue("imageSize", size);
      form.setValue("imageName", name);

      // Verify eligibility when image is uploaded
      verifyEligibility(name, size);

      toast.success("Image uploaded successfully!");
    }
  };

  const handleImageError = (error) => {
    console.error("Upload error:", error);
    toast.error("Failed to upload image");
  };

  const onSubmit = async (data) => {
    if (!verificationStatus.isEligible) {
      toast.error(
        "You are not eligible for clearance. Please resolve any issues first."
      );
      return;
    }

    setIsLoading(true);
    try {
      const formData = {
        ...data,
        userId: session.user.id,
      };

      const response = await axios.post("/api/clearence", formData);

      if (response.data.message) {
        toast.success("Clearance certificate created successfully!");
        form.reset();
        setUploadedImage(null);
        setVerificationStatus({
          imageMatch: null,
          hasOffences: null,
          isEligible: null,
        });
      } else {
        toast.error("Failed to create clearance certificate");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error(error.response?.data?.error || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  if (!session) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Please sign in to apply for clearance.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Clearance Application</h1>
        <p className="text-muted-foreground">
          Apply for a police clearance certificate. Your identity will be
          verified against your fingerprint record.
        </p>
      </div>

      {/* Verification Details */}
      {uploadedImage && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Verification Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span>Image Match:</span>
              {verificationStatus.imageMatch ? (
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-green-600">Verified</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-red-600" />
                  <span className="text-red-600">Failed</span>
                </div>
              )}
            </div>
            <div className="flex items-center justify-between">
              <span>Criminal Record:</span>
              {!verificationStatus.hasOffences ? (
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-green-600">Clean</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-red-600" />
                  <span className="text-red-600">Has Offences</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Application Form */}
      <Card>
        <CardHeader>
          <CardTitle>Application Form</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your full name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="idNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ID Number</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your ID number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Purpose of Clearance</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe why you need this clearance certificate..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-4">
                <FormLabel>Identity Verification Image</FormLabel>
                <div className="space-y-4">
                  {uploadedImage ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/50">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                            <svg
                              className="w-5 h-5 text-primary"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 002 2z"
                              />
                            </svg>
                          </div>
                          <div>
                            <p className="text-sm font-medium">
                              {uploadedImage.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {(uploadedImage.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setUploadedImage(null);
                            form.setValue("imageUrl", "");
                            form.setValue("imageSize", 0);
                            form.setValue("imageName", "");
                          }}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <UploadButton
                      endpoint="imageUploader"
                      onClientUploadComplete={handleImageUpload}
                      onUploadError={handleImageError}
                      appearance={{
                        container:
                          "border-2 border-dashed border-primary/20 rounded-xl p-12 hover:border-primary/40 transition-all duration-300 bg-gradient-to-br from-primary/5 to-primary/10 hover:from-primary/10 hover:to-primary/15 group",
                        uploadIcon:
                          "text-primary w-12 h-12 transition-transform duration-300 group-hover:scale-110",
                        label: "text-primary font-semibold text-lg mb-2",
                        allowedContent:
                          "text-muted-foreground/70 text-sm font-medium",
                        button:
                          "bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300 text-white font-semibold px-8 py-3 mt-6 rounded-lg border-0 hover:scale-105",
                      }}
                      content={{
                        uploadIcon: (
                          <div className="relative">
                            <svg
                              className="w-12 h-12 text-primary"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                              />
                            </svg>
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary/20 rounded-full flex items-center justify-center">
                              <svg
                                className="w-2 h-2 text-primary"
                                fill="currentColor"
                                viewBox="0 0 8 8"
                              >
                                <path d="M4 0l1.5 3h2.5l-2 2 .5 3-2-1.5-2 1.5.5-3-2-2h2.5z" />
                              </svg>
                            </div>
                          </div>
                        ),
                        label: (
                          <div className="text-center">
                            <div className="text-primary font-semibold text-lg mb-1">
                              Upload Verification Image
                            </div>
                            <div className="text-primary/70 text-sm">
                              Drag and drop or click to browse
                            </div>
                          </div>
                        ),
                        allowedContent: (
                          <div className="flex items-center justify-center space-x-2 text-muted-foreground/70 text-sm">
                            <svg
                              className="w-4 h-4"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                                clipRule="evenodd"
                              />
                            </svg>
                            <span>
                              PNG, JPG up to 4MB • High resolution recommended
                            </span>
                          </div>
                        ),
                      }}
                    />
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  Upload an image for identity verification that matches your
                  fingerprint record.
                </p>
              </div>

              <Button
                type="submit"
                disabled={isLoading || !verificationStatus.isEligible}
                className="w-full"
              >
                {isLoading ? "Processing..." : "Submit Clearance Application"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
