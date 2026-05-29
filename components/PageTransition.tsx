"use client";
/**
 * PageTransition — clean slide-up fade between pages.
 * Simple, smooth, works perfectly on all devices.
 */
import { motion } from "framer-motion";
import type { ReactNode, CSSProperties } from "react";

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}

export default function PageTransition({ children, className, style }: PageTransitionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      style={style}
      className={className}
    >
      {children}
    </motion.div>
  );
}
