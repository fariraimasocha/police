"use client";
import {
  Home,
  Siren,
  FileOutput,
  Fingerprint,
  Angry,
  BadgeAlert,
} from "lucide-react";
import Link from "next/link";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useSession } from "next-auth/react";
import { Separator } from "./ui/separator";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "./ui/button";
import { AvatarImage } from "@radix-ui/react-avatar";
import { signOut } from "next-auth/react";

const items = [
  {
    title: "My Dashboard",
    url: "/dashboard",
    icon: Home,
  },
  {
    title: "My Clearence",
    url: "/dashboard/clearence",
    icon: FileOutput,
  },
  {
    title: "My Fingerprints",
    url: "/dashboard/fingerprints",
    icon: Fingerprint,
  },
  {
    title: "All Offences",
    url: "/dashboard/offences",
    icon: Angry,
  },
  {
    title: "My Offences",
    url: "/dashboard/my-offences",
    icon: BadgeAlert,
  },
];

export function AppSidebar() {
  const { data: session } = useSession();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/auth");
  };

  const getInitials = () => {
    if (!session?.user?.name) return "U";
    return session.user.name.charAt(0).toUpperCase();
  };
  return (
    <Sidebar>
      <SidebarHeader className="border-b">
        <div className="flex items-center gap-2 px-2 py-1">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Siren className="size-5" />
          </div>
          <div className="flex flex-col gap-0.5">
            <h1 className="font-semibold tracking-tight">OClear</h1>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <Separator />
        <div className="">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-auto w-full justify-start gap-3 px-3"
              >
                <Avatar className="size-8">
                  <AvatarImage
                    src={
                      session?.user?.image ||
                      "https://github.com/evilrabbit.png"
                    }
                  />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-start gap-0.5">
                  <span className="text-xs text-muted-foreground">
                    {session?.user?.name}
                  </span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              className="w-[--radix-popper-anchor-width]"
            >
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
