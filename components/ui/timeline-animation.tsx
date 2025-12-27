
"use client";

import React from 'react';
import { motion, useInView } from 'framer-motion';

interface TimelineContentProps {
  as?: string;
  animationNum: number;
  timelineRef: React.RefObject<HTMLElement>;
  customVariants: any;
  className?: string;
  // Mark children as optional to resolve issues where the TypeScript compiler 
  // fails to correctly map JSX nested content to the children prop.
  children?: React.ReactNode;
}

export const TimelineContent = ({
  as = 'div',
  animationNum,
  timelineRef,
  customVariants,
  className,
  children
}: TimelineContentProps) => {
  const isInView = useInView(timelineRef, { once: true, margin: "-100px 0px" });
  const MotionComponent = (motion as any)[as] || motion.div;

  return (
    <MotionComponent
      variants={customVariants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      custom={animationNum}
      className={className}
    >
      {children}
    </MotionComponent>
  );
};
