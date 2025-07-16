import React from 'react';
import { motion } from 'framer-motion';

const LoadingSpinner = ({ size = 'medium', color = 'primary'}) => {
    const sizeClasses = {
        small: 'w-4 h-4',
        medium: 'w-8 h-8',
        large: 'w-12 h-12'
    };

    const colorClasses = {
      primary: "border-primary",
      secondary: "border-secondary",
      accent: "border-accent",
    };

    return (
        <div className="flex items-center justify-center">
        <motion.div
            className={`${sizeClasses[size]} border-2 ${colorClasses[color]} border-t-transparent rounded-full`}
            animate={{ rotate: 360 }}
            transition={{
            duration: 1,
            repeat: Infinity,
            ease: "linear"
            }}
        />
        </div>
    );
};

export default LoadingSpinner;