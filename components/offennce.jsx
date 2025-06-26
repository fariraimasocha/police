"use client";
import React, { useState, useEffect } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const offenceSchema = z.object({
  userId: z.string().min(1, "User selection is required"),
  offenceDetails: z
    .string()
    .min(10, "Offence details must be at least 10 characters"),
  offenceDate: z.string().min(1, "Offence date is required"),
});

export default function Offennce() {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserList, setShowUserList] = useState(false);

  const form = useForm({
    resolver: zodResolver(offenceSchema),
    defaultValues: {
      userId: "",
      offenceDetails: "",
      offenceDate: "",
    },
  });

  // Fetch all users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  // Filter users based on search query
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredUsers([]);
      setShowUserList(false);
    } else {
      const filtered = users.filter(
        (user) =>
          user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredUsers(filtered);
      setShowUserList(true);
    }
  }, [searchQuery, users]);

  const fetchUsers = async () => {
    try {
      const response = await axios.get("/api/users");
      if (response.data.success) {
        setUsers(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to fetch users");
    }
  };

  const handleUserSelect = (user) => {
    setSelectedUser(user);
    setSearchQuery(user.name);
    setShowUserList(false);
    form.setValue("userId", user._id);
  };

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const response = await axios.post("/api/offence", data);

      if (response.data.success) {
        toast.success("Offence record created successfully!");
        form.reset();
        setSelectedUser(null);
        setSearchQuery("");
      } else {
        toast.error("Failed to create offence record");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error(error.response?.data?.error || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Offence Registration</h1>
        <p className="text-muted-foreground">
          Select a user and enter offence details to create a new record.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* User Search and Selection */}
          <FormField
            control={form.control}
            name="userId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Select User</FormLabel>
                <FormControl>
                  <div className="relative space-y-4">
                    <Input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search by name or email..."
                    />

                    {/* User Search Results */}
                    {showUserList && filteredUsers.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                        {filteredUsers.map((user) => (
                          <div
                            key={user._id}
                            onClick={() => handleUserSelect(user)}
                            className="px-3 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-200 last:border-b-0"
                          >
                            <div className="font-medium">{user.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {user.email}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Selected User Display */}
                    {selectedUser && (
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
                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                              />
                            </svg>
                          </div>
                          <div>
                            <p className="text-sm font-medium">
                              {selectedUser.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {selectedUser.email}
                            </p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedUser(null);
                            setSearchQuery("");
                            form.setValue("userId", "");
                          }}
                        >
                          Remove
                        </Button>
                      </div>
                    )}
                  </div>
                </FormControl>
                <FormDescription>
                  Search and select the user for this offence record.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="offenceDetails"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Offence Details</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter detailed description of the offence..."
                    rows={4}
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Provide a comprehensive description of the offence committed.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="offenceDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Offence Date & Time</FormLabel>
                <FormControl>
                  <Input type="datetime-local" {...field} />
                </FormControl>
                <FormDescription>
                  Select the date and time when the offence occurred.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Creating Record..." : "Create Offence Record"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
