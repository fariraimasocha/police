"use client";
import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import {
  User,
  Fingerprint,
  Shield,
  TrendingUp,
  AlertTriangle,
  FileText,
} from "lucide-react";
import { toast } from "sonner";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

export default function MainDahboard() {
  const { data: session } = useSession();
  const [dashboardData, setDashboardData] = useState({
    user: null,
    offences: [],
    fingerprints: null,
    clearances: [],
    totalOffences: 0,
    totalFingerprints: 0,
    totalClearances: 0,
    recentActivity: [],
    offencesByMonth: [],
    offencesByType: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user?.id) {
      fetchUserDashboardData();
    }
  }, [session]);

  const fetchUserDashboardData = async () => {
    try {
      setLoading(true);
      const userId = session.user.id;

      // Fetch user's offences
      let offencesData = [];
      try {
        const offencesResponse = await axios.get(`/api/offence/${userId}`);
        if (offencesResponse.data.success) {
          offencesData = offencesResponse.data.data;
        }
      } catch (error) {
        console.log("No offences found for user");
      }

      // Fetch user's fingerprints
      let fingerprintData = null;
      let fingerprintCount = 0;
      try {
        const fingerprintResponse = await axios.get(
          `/api/fingerprint/${userId}`
        );
        if (fingerprintResponse.data.success) {
          fingerprintData = fingerprintResponse.data.data;
          fingerprintCount = 1;
        }
      } catch (error) {
        console.log("No fingerprints found for user");
      }

      // Fetch user's clearances (if API exists)
      let clearancesData = [];
      try {
        const clearancesResponse = await axios.get(`/api/clearance/${userId}`);
        if (clearancesResponse.data.success) {
          clearancesData = clearancesResponse.data.data;
        }
      } catch (error) {
        console.log("No clearances found for user");
      }

      // Process data for charts
      const processedData = processUserDataForCharts(
        offencesData,
        fingerprintData,
        clearancesData
      );

      setDashboardData({
        user: session.user,
        offences: offencesData,
        fingerprints: fingerprintData,
        clearances: clearancesData,
        totalOffences: offencesData.length,
        totalFingerprints: fingerprintCount,
        totalClearances: clearancesData.length,
        ...processedData,
      });
    } catch (error) {
      console.error("Error fetching user dashboard data:", error);
      toast.error("Failed to fetch your dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const processUserDataForCharts = (offences, fingerprints, clearances) => {
    // Process offences by month
    const offencesByMonth = offences.reduce((acc, offence) => {
      const month = new Date(
        offence.offenceDate || offence.createdAt
      ).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      });
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, {});

    const offenceChartData = Object.entries(offencesByMonth).map(
      ([month, count]) => ({
        month,
        offences: count,
      })
    );

    // Process offences by type
    const offencesByType = offences.reduce((acc, offence) => {
      const type = offence.offenceType || "Unknown";
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});

    const offenceTypeData = Object.entries(offencesByType).map(
      ([type, count]) => ({
        type,
        count,
      })
    );

    // Recent activity for the user
    const recentActivity = [
      ...offences.slice(-5).map((offence) => ({
        type: "Offence Record",
        description: `Offence recorded: ${
          offence.offenceDetails?.substring(0, 50) || "Details not available"
        }...`,
        date: offence.timestamp || offence.createdAt || offence.offenceDate,
        icon: AlertTriangle,
      })),
      ...(fingerprints
        ? [
            {
              type: "Fingerprint",
              description: "Fingerprint data recorded",
              date: fingerprints.timestamp || fingerprints.createdAt,
              icon: Fingerprint,
            },
          ]
        : []),
      ...clearances.slice(-3).map((clearance) => ({
        type: "Clearance",
        description: `Clearance issued: ${
          clearance.type || "Police clearance"
        }`,
        date: clearance.timestamp || clearance.createdAt,
        icon: Shield,
      })),
    ]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 10);

    return {
      offencesByMonth: offenceChartData,
      offencesByType: offenceTypeData,
      recentActivity,
    };
  };

  const statsCards = [
    {
      title: "Your Offences",
      value: dashboardData.totalOffences,
      icon: AlertTriangle,
      color: "text-red-600",
      bgColor: "bg-red-100",
      description: "Total recorded offences",
    },
    {
      title: "Fingerprint Records",
      value: dashboardData.totalFingerprints,
      icon: Fingerprint,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      description: "Biometric data on file",
    },
    {
      title: "Clearances Issued",
      value: dashboardData.totalClearances,
      icon: Shield,
      color: "text-green-600",
      bgColor: "bg-green-100",
      description: "Police clearances obtained",
    },
    {
      title: "Profile Status",
      value: dashboardData.user ? "Active" : "Inactive",
      icon: User,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
      description: "Account status",
    },
  ];

  const pieChartData = [
    { name: "Offences", value: dashboardData.totalOffences },
    { name: "Fingerprints", value: dashboardData.totalFingerprints },
    { name: "Clearances", value: dashboardData.totalClearances },
  ].filter((item) => item.value > 0);

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading your dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Dashboard</h1>
          <p className="text-gray-600">
            Welcome back, {session?.user?.name || "User"}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <TrendingUp className="h-6 w-6 text-green-600" />
          <span className="text-sm text-gray-600">
            Last updated: {new Date().toLocaleTimeString()}
          </span>
        </div>
      </div>

      {/* User Profile Card */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>Your account details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <img
              src={session?.user?.image || "/default-avatar.png"}
              alt={session?.user?.name || "User"}
              className="w-16 h-16 rounded-full"
            />
            <div>
              <h3 className="text-lg font-semibold">{session?.user?.name}</h3>
              <p className="text-gray-600">{session?.user?.email}</p>
              <p className="text-sm text-gray-500">
                Member since:{" "}
                {new Date(
                  session?.user?.createdAt || Date.now()
                ).toLocaleDateString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-full ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-gray-600 mt-1">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Offences by Month Chart */}
        {dashboardData.offencesByMonth.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Your Offences by Month</CardTitle>
              <CardDescription>
                Monthly breakdown of your recorded offences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dashboardData.offencesByMonth}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="offences" fill="#ef4444" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Offences by Type Chart */}
        {dashboardData.offencesByType.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Offences by Type</CardTitle>
              <CardDescription>Breakdown of offence categories</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={dashboardData.offencesByType}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ type, count }) => `${type}: ${count}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {dashboardData.offencesByType.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Data Overview Pie Chart */}
        {pieChartData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Your Data Overview</CardTitle>
              <CardDescription>Summary of your records</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest activities</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {dashboardData.recentActivity.length > 0 ? (
              dashboardData.recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="p-2 rounded-full bg-gray-100">
                    <activity.icon className="h-4 w-4 text-gray-600" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">{activity.type}</p>
                    <p className="text-sm text-gray-600">
                      {activity.description}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(activity.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-600">No recent activity</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Detailed Records */}
      {dashboardData.offences.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Your Offence Records</CardTitle>
            <CardDescription>
              Detailed view of your recorded offences
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Date</th>
                    <th className="text-left p-2">Type</th>
                    <th className="text-left p-2">Details</th>
                    <th className="text-left p-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboardData.offences.map((offence, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="p-2">
                        {new Date(
                          offence.offenceDate || offence.createdAt
                        ).toLocaleDateString()}
                      </td>
                      <td className="p-2">
                        {offence.offenceType || "Not specified"}
                      </td>
                      <td className="p-2">
                        {offence.offenceDetails?.substring(0, 100) ||
                          "No details available"}
                        {offence.offenceDetails?.length > 100 && "..."}
                      </td>
                      <td className="p-2">
                        <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                          Recorded
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
