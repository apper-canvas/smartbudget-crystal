import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/utils/cn";

const Card = React.forwardRef(({ 
  children, 
  hover = false,
  glass = false,
  className,
  ...props 
}, ref) => {
  const baseStyles = "rounded-xl border";
  
  const variants = {
    default: "card-premium",
    glass: "glass-card",
  };

  const CardComponent = hover ? motion.div : "div";
  const hoverProps = hover ? {
    whileHover: { y: -2, scale: 1.02 },
    transition: { type: "spring", stiffness: 300, damping: 30 }
  } : {};

  return (
    <CardComponent
      ref={ref}
      className={cn(
        baseStyles,
        glass ? variants.glass : variants.default,
        className
      )}
      {...hoverProps}
      {...props}
    >
      {children}
    </CardComponent>
  );
});

Card.displayName = "Card";

export default Card;