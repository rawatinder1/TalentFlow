'use client'

import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation"
//@ts-ignore
import { Plus, Zap, LayoutDashboard, BarChart3, Users, Settings , FileText} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button"
import Image from "next/image";

export function AppSidebar() {
    const pathname = usePathname();
    const [isExpanded, setIsExpanded] = useState(false);
    const [jobCount, setJobCount] = useState(0);

    useEffect(() => {
        const fetchJobCount = async () => {
            try {
                const response = await fetch('/api/jobs/count');
                const data = await response.json();
                setJobCount(data.count || 0);
            } catch (error) {
                console.error('Failed to fetch job count:', error);
                // Try to get count from main jobs endpoint as fallback
                try {
                    const response = await fetch('/jobs?limit=1');
                    const data = await response.json();
                    setJobCount(data.pagination?.total || 0);
                } catch (fallbackError) {
                    console.error('Fallback also failed:', fallbackError);
                    setJobCount(0);
                }
            }
        };

        fetchJobCount();
    }, []);

    const navigationItems = [
        {
            title: "Dashboard",
            url: "/dashboard",
            icon: LayoutDashboard,
        },
        {
            title: "Jobs",
            url: "/jobs",
            icon: Zap,
            badge: `${jobCount}`, // Always show badge, even if 0
        },
        {
            title: "Assessments",
            url: "/assessments",
            icon: FileText, 
        },
        {
            title: "Candidates",
            url: "/candidates",
            icon: Users,
        },
        {
            title: "Settings",
            url: "/settings",
            icon: Settings,
        },
    ];

    return (
        <motion.div
            className={cn(
                "relative h-screen border-r transition-all duration-300 ease-in-out",
                "bg-zinc-800 border-zinc-700",
                "shadow-2xl shadow-zinc-900/50"
            )}
            animate={{
                width: isExpanded ? 280 : 80,
            }}
            transition={{
                duration: 0.15,
                ease: "easeOut",
            }}
            onMouseEnter={() => setIsExpanded(true)}
            onMouseLeave={() => setIsExpanded(false)}
        >
            {/* Metallic gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-zinc-700/30 via-zinc-800 to-zinc-900 opacity-90" />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-zinc-600/5 to-transparent" />
            
            {/* Subtle metallic shine effect */}
            <div className="absolute inset-0 bg-gradient-to-bl from-zinc-500/10 via-transparent to-zinc-700/20" />
            
            <div className="relative z-10 flex flex-col h-full">
                {/* Header with Logo */}
                <div className="flex items-center p-6 border-b border-zinc-700/50">
                    <motion.div
                        className="flex items-center space-x-3"
                        animate={{
                            justifyContent: isExpanded ? "flex-start" : "center",
                        }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="w-10 h-10 rounded-lg bg-zinc-700 border border-zinc-600 flex items-center justify-center shadow-lg p-1">
                            {/* Replace with your SVG */}
                            <Image 
                                src="/logo.svg" 
                                alt="Logo" 
                                width={32} 
                                height={32}
                                className="w-full h-full object-contain"
                            />
                        </div>
                        <motion.span
                            className="font-bold text-lg text-green-100 tracking-tight"
                            animate={{
                                opacity: isExpanded ? 1 : 0,
                                width: isExpanded ? "auto" : 0,
                            }}
                            transition={{ duration: 0.1, delay: isExpanded ? 0.05 : 0 }}
                            style={{ 
                                display: isExpanded ? "block" : "none" 
                            }}
                        >
                            Talent Flow
                        </motion.span>
                    </motion.div>
                </div>

                {/* Create Button */}
                <div className="p-4 border-b border-zinc-700/30">
                    <motion.div
                        animate={{
                            scale: isExpanded ? 1 : 0.9,
                        }}
                        transition={{ duration: 0.1 }}
                    >
                        <Link href="/create">
                            <Button 
                                className={cn(
                                    "bg-green-600 hover:bg-green-500 text-white rounded-md border border-green-500/50 shadow-lg transition-all duration-200",
                                    "hover:shadow-green-500/25 hover:shadow-lg",
                                    isExpanded ? "w-full justify-start gap-2" : "w-full h-10 p-0"
                                )}
                            >
                                <Plus className="h-4 w-4" />
                                <motion.span
                                    animate={{
                                        opacity: isExpanded ? 1 : 0,
                                        width: isExpanded ? "auto" : 0,
                                    }}
                                    transition={{ duration: 0.2 }}
                                    style={{ 
                                        display: isExpanded ? "inline" : "none" 
                                    }}
                                >
                                    Create Chain
                                </motion.span>
                            </Button>
                        </Link>
                    </motion.div>
                </div>

                {/* Navigation */}
                <div className="flex-1 overflow-y-auto px-4 py-6">
                    <div className="space-y-2">
                        <motion.div
                            className="text-xs font-semibold tracking-wider uppercase text-zinc-500 mb-4"
                            animate={{
                                textAlign: isExpanded ? "left" : "center",
                                paddingLeft: isExpanded ? "12px" : "0px",
                            }}
                        >
                            <motion.span
                                animate={{
                                    opacity: isExpanded ? 1 : 0,
                                }}
                                transition={{ duration: 0.2 }}
                            >
                                {isExpanded ? "Navigation" : "•"}
                            </motion.span>
                        </motion.div>
                        
                        {navigationItems.map((item, index) => {
                            const isActive = pathname === item.url;
                            return (
                                <Link key={item.title} href={item.url}>
                                    <motion.div 
                                        className={cn(
                                            "group relative flex items-center gap-3 px-3 py-3 rounded-md cursor-pointer transition-all duration-200",
                                            "border border-transparent",
                                            isActive 
                                                ? "bg-zinc-700 text-zinc-100 border-zinc-600 shadow-lg shadow-zinc-900/20" 
                                                : "text-zinc-400 hover:bg-zinc-700/50 hover:text-zinc-200 hover:border-zinc-600/50",
                                            !isExpanded && "justify-center"
                                        )}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.3, delay: index * 0.05 }}
                                        whileHover={{ x: isExpanded ? 2 : 0, scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        {/* Active indicator */}
                                        {isActive && (
                                            <motion.div
                                                className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 rounded-r-full bg-zinc-400"
                                                layoutId="activeIndicator"
                                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                            />
                                        )}
                                        
                                        <div className="relative">
                                            <item.icon className="h-5 w-5 shrink-0" />
                                            {isActive && (
                                                <motion.div
                                                    className="absolute inset-0 rounded-lg bg-zinc-400/10 blur-sm"
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    transition={{ delay: 0.1 }}
                                                />
                                            )}
                                        </div>
                                        
                                        <motion.div 
                                            className="flex items-center justify-between flex-1"
                                            animate={{
                                                opacity: isExpanded ? 1 : 0,
                                                width: isExpanded ? "auto" : 0,
                                            }}
                                            transition={{ duration: 0.1, delay: isExpanded ? 0.05 : 0 }}
                                            style={{ 
                                                display: isExpanded ? "flex" : "none" 
                                            }}
                                        >
                                            <span className="font-medium truncate">{item.title}</span>
                                            {item.badge && (
                                                <span className="bg-zinc-600 text-zinc-300 text-xs px-2 py-1 rounded-full font-semibold border border-zinc-500">
                                                    {item.badge}
                                                </span>
                                            )}
                                        </motion.div>

                                        {/* Badge indicator when collapsed */}
                                        {!isExpanded && item.badge && (
                                            <div className="absolute -top-1 -right-1 h-2 w-2 bg-zinc-500 rounded-full border border-zinc-600" />
                                        )}
                                    </motion.div>
                                </Link>
                            )
                        })}
                    </div>
                </div>

                {/* User Profile */}
                <div className="p-4 border-t border-zinc-700/50">
                    <motion.div
                        className={cn(
                            "group flex items-center gap-3 px-3 py-3 rounded-md cursor-pointer transition-all duration-200",
                            "text-zinc-400 hover:bg-zinc-700/50 hover:text-zinc-200 border border-transparent hover:border-zinc-600/50",
                            !isExpanded && "justify-center"
                        )}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-zinc-600 to-zinc-700 border border-zinc-500 flex items-center justify-center shrink-0 shadow-lg">
                            <span className="text-xs font-bold text-zinc-200">JD</span>
                        </div>
                        <motion.div
                            className="flex-1 min-w-0"
                            animate={{
                                opacity: isExpanded ? 1 : 0,
                                width: isExpanded ? "auto" : 0,
                            }}
                            transition={{ duration: 0.2, delay: isExpanded ? 0.001 : 0 }}
                            style={{ 
                                display: isExpanded ? "block" : "none" 
                            }}
                        >
                            <p className="text-sm font-semibold truncate text-zinc-200">John Doe</p>
                            <p className="text-xs text-zinc-500 truncate">john@example.com</p>
                        </motion.div>
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
}