"use client";

import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation"; // ✅ fixed import
import {
  Plus,
  Zap,
  LayoutDashboard,
  Users,
  Settings,
  FileText,
  //@ts-ignore
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(false);
  const [jobCount, setJobCount] = useState(0);

  useEffect(() => {
    const fetchJobCount = async () => {
      try {
        const response = await fetch("/api/jobs/count");
        const data = await response.json();
        setJobCount(data.count || 0);
      } catch (error) {
        console.error("Failed to fetch job count:", error);
        try {
          const response = await fetch("/jobs?limit=1");
          const data = await response.json();
          setJobCount(data.pagination?.total || 0);
        } catch (fallbackError) {
          console.error("Fallback also failed:", fallbackError);
          setJobCount(0);
        }
      }
    };

    fetchJobCount();
  }, []);

  const navigationItems = [
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    { title: "Jobs", url: "/jobs", icon: Zap, badge: `${jobCount}` },
    { title: "Assessments", url: "/assessments", icon: FileText },
    { title: "Candidates", url: "/candidates", icon: Users },
    { title: "Settings", url: "/settings", icon: Settings },
  ];

  return (
    <motion.div
      className={cn(
        "relative h-screen border-r transition-all duration-300 ease-in-out",
        "bg-zinc-800 border-zinc-700",
        "shadow-2xl shadow-zinc-900/50"
      )}
      animate={{ width: isExpanded ? 280 : 80 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      {/* Logo + Title */}
      <div className="flex items-center p-6 border-b border-zinc-700/50">
        <motion.div
          className="flex items-center space-x-3"
          animate={{ justifyContent: isExpanded ? "flex-start" : "center" }}
          transition={{ duration: 0.3 }}
        >
          <div className="w-10 h-10 rounded-lg bg-zinc-700 border border-zinc-600 flex items-center justify-center shadow-lg p-1">
            <Image
              src="/logo.svg"
              alt="Logo"
              width={32}
              height={32}
              className="w-full h-full object-contain"
            />
          </div>
          <motion.span
            className="font-extrabold text-xl bg-gradient-to-r from-blue-600 via-blue-10 to-blue-400 bg-clip-text text-transparent"
            initial={{ opacity: 0, scale: 0.8, letterSpacing: "-0.2em" }}
            animate={{
              opacity: isExpanded ? 1 : 0,
              scale: isExpanded ? 1 : 0.9,
              letterSpacing: isExpanded ? "0em" : "-0.2em",
            }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            style={{ overflow: "hidden", whiteSpace: "nowrap" }}
          >
            Talent Flow
          </motion.span>
        </motion.div>
      </div>

      {/* Create Button */}
      <div className="p-4 border-b border-zinc-700/30">
        <motion.div
          animate={{ scale: isExpanded ? 1 : 0.9 }}
          transition={{ duration: 0.1 }}
        >
          <Button
            className={cn(
              "bg-green-600 hover:bg-green-500 text-white rounded-md border border-green-500/50 shadow-lg transition-all duration-200",
              "hover:shadow-green-500/25 hover:shadow-lg",
              isExpanded ? "w-full justify-start gap-2" : "w-full h-10 p-0"
            )}
            onClick={() => router.push("/create")} 
          >
            <Plus className="h-4 w-4" />
            {isExpanded && (
              <motion.span
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
              >
                Create job
              </motion.span>
            )}
          </Button>
        </motion.div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="space-y-2">
          {navigationItems.map((item) => {
            const isActive = pathname === item.url;
            return (
              <Link key={item.title} href={item.url}>
                <motion.div
                  className={cn(
                    "group relative flex items-center gap-3 px-3 py-3 rounded-md cursor-pointer transition-all duration-200",
                    isActive
                      ? "bg-zinc-700 text-zinc-100 border-zinc-600 shadow-lg"
                      : "text-zinc-400 hover:bg-zinc-700/50 hover:text-zinc-200"
                  )}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <item.icon className="h-5 w-5 shrink-0" />
                  {isExpanded && (
                    <span className="font-medium truncate">{item.title}</span>
                  )}
                  {item.badge && isExpanded && (
                    <span className="ml-auto bg-zinc-600 text-zinc-300 text-xs px-2 py-1 rounded-full font-semibold border border-zinc-500">
                      {item.badge}
                    </span>
                  )}
                </motion.div>
              </Link>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
