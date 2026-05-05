import React from "react";
import { motion as Motion } from "framer-motion";
import { cn } from "@/lib/utils";

const AnimatedCard = ({
  children,
  className = "",
  delay = 0,
  hover = true,
  onClick,
  ...props
}) => {
  const cardVariants = {
    hidden: {
      opacity: 0,
      y: 20,
      scale: 0.95,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.3,
        delay,
        ease: "easeOut",
      },
    },
  };

  const hoverVariants = hover
    ? {
        hover: {
          y: -4,
          scale: 1.02,
          boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
          transition: {
            duration: 0.3,
            ease: "easeInOut",
          },
        },
      }
    : {};

  return (
    <Motion.div
      className={cn(
        "bg-card rounded-lg p-4 card-shadow",
        className
      )}
      variants={cardVariants}
      whileHover={hover ? "hover" : undefined}
      initial="hidden"
      animate="visible"
      onClick={onClick}
      style={{ cursor: onClick ? "pointer" : "default" }}
      {...(hover ? { whileHover: "hover" } : {})}
      {...props}
    >
      {children}
    </Motion.div>
  );
};

export default AnimatedCard;
