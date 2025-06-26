"use client";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import axios from "axios";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UploadButton } from "@/utils/uploadThing";
import { toast } from "sonner";
import UserFingerprints from "./userFingerprints";

const fingerprintSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  idNumber: z.string().min(1, "ID number is required"),
  imageUrl: z.string().min(1, "Fingerprint image is required"),
  imageSize: z.number().optional(),
  imageName: z.string().optional(),
});

export default function Fingerprint() {
  const { data: session } = useSession();
  console.log("User session", session);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedImage, setUploadedImage] = useState(null);

  const form = useForm({
    resolver: zodResolver(fingerprintSchema),
    defaultValues: {
      fullName: "",
      idNumber: "",
      imageUrl: "",
      imageSize: 0,
      imageName: "",
    },
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const formData = {
        ...data,
        userId: session.user.id,
      };

      const response = await axios.post("/api/fingerprint", formData);

      if (response.data.success) {
        toast.success("Fingerprint data saved successfully!");
        form.reset();
        setUploadedImage(null);
      } else {
        toast.error("Failed to save fingerprint data");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error(error.response?.data?.error || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = (res) => {
    if (res && res[0]) {
      const { url, size, name } = res[0];
      setUploadedImage({ url, size, name });
      form.setValue("imageUrl", url);
      form.setValue("imageSize", size);
      form.setValue("imageName", name);
      toast.success("Image uploaded successfully!");
    }
  };

  const handleImageError = (error) => {
    console.error("Upload error:", error);
    toast.error("Failed to upload image");
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Left side - Registration Form */}
        <div className="lg:col-span-3">
          <div className="space-y-6">
            <div className="space-y-2">
              <h1 className="text-2xl font-bold">Fingerprint Registration</h1>
              <p className="text-muted-foreground">
                Enter the required information and upload a fingerprint image.
              </p>
            </div>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter full name" {...field} />
                      </FormControl>
                      <FormDescription>
                        The complete name of the person.
                      </FormDescription>
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
                        <Input placeholder="Enter ID number" {...field} />
                      </FormControl>
                      <FormDescription>
                        The official identification number.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fingerprint Image</FormLabel>
                      <FormControl>
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
                                      {(
                                        uploadedImage.size /
                                        1024 /
                                        1024
                                      ).toFixed(2)}{" "}
                                      MB
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
                                label:
                                  "text-primary font-semibold text-lg mb-2",
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
                                      Upload Fingerprint Image
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
                                      PNG, JPG up to 4MB • High resolution
                                      recommended
                                    </span>
                                  </div>
                                ),
                              }}
                            />
                          )}
                        </div>
                      </FormControl>
                      <FormDescription>
                        Upload a clear fingerprint image for identification.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Saving..." : "Save Fingerprint Data"}
                </Button>
              </form>
            </Form>
          </div>
        </div>

        {/* Right side - User Fingerprints */}
        <div className="lg:col-span-2">
          <UserFingerprints />
        </div>
      </div>
    </div>
  );
}
