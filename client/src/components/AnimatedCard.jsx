import React from "react";
import { motion } from "framer-motion";

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
        duration: 0.5,
        delay,
        ease: "easeOut",
      },
    },
  };

  const hoverVariants = hover
    ? {
        hover: {
          y: -5,
          scale: 1.02,
          boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
          transition: {
            duration: 0.3,
            ease: "easeInOut",
          },
        },
      }
    : {};

  return (
    <motion.div
      className={`stat-card ${className}`}
      variants={cardVariants}
      whileHover="hover"
      initial="hidden"
      animate="visible"
      onClick={onClick}
      style={{ cursor: onClick ? "pointer" : "default" }}
      {...hoverVariants}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default AnimatedCard;
