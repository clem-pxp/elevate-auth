// Components/auth/Plan/PlanCard.tsx
'use client';

import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';

interface PlanCardProps {
  id: string;
  title: string;
  price: string;
  discount: string | null;
  description: string;
  variant: 'green' | 'pink' | 'gray';
  isSelected: boolean;
  isOpen: boolean;
  onSelect: () => void;
}

const variantClasses = {
  green: 'bg-brand shadow-green',
  pink: 'bg-pink shadow-pink',
  gray: 'bg-[#b2b8b2] shadow-gray',
};

const planIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" width="100%" viewBox="0 0 16 18" fill="none">
    <path d="M6.48477 16.9854C3.81844 16.9854 2.60337 12.9635 3.66208 8.35605L3.89745 7.45824H15.9866V7.4541C16.0606 6.10077 15.8294 4.74329 15.2664 3.50923C14.7765 2.43583 13.9972 1.31689 12.7705 0.701514C12.1975 0.414117 11.1529 0 9.89627 0C9.23011 0 8.56311 0.077854 7.89694 0.195463C4.25007 0.936732 1.38747 3.90429 0.328756 7.96512C-0.886313 12.8459 1.30929 18 6.21032 18C8.87665 18 11.2286 16.9067 13.346 12.5726H11.7775C10.5616 14.798 8.95482 16.9846 6.48477 16.9846V16.9854ZM8.0533 1.1322C8.52402 0.936732 9.03383 0.858878 9.62182 0.858878C11.6212 0.858878 12.798 3.1622 12.8371 6.24737H4.25007C5.07343 3.70966 6.24941 1.83537 8.0533 1.1322Z" fill="white"/>
  </svg>
);

export function PlanCard({
  title,
  price,
  discount,
  description,
  variant,
  isSelected,
  isOpen,
  onSelect,
}: PlanCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      className={cn(
        "rounded-2xl w-full p-3 cursor-pointer shadow-card transition-colors transition-background relative",
        isSelected ? "bg-brand text-white ring-1 ring-violet-500/20" : "bg-white text-brand"
      )}
      onClick={onSelect}
    >
      {/* Toggle */}
      <div className="flex md:flex-row flex-col w-full justify-between items-center gap-4">
        {/* Left: Icon + Title */}
        <div className="flex items-center gap-3 md:w-auto w-full">
          <div
            className={cn(
              'flex justify-center items-center w-7 h-7 min-w-7 min-h-7 rounded-[10px]',
              variantClasses[variant]
            )}
          >
            <div className="w-4 h-4 text-white">{planIcon}</div>
          </div>
          <div className="font-medium">{title}</div>
        </div>

        {/* Right: Price + Discount + Chevron */}
        <div className="flex items-center gap-2 md:w-auto w-full justify-between">
          <div className="font-semibold">{price}</div>
          {discount && (
            <div className="inline-flex items-center rounded-full shadow-pink bg-pink px-3 py-1">
              <div className="font-medium text-xs text-white">{discount}</div>
            </div>
          )}
        </div>
      </div>

      {/* Dropdown Content */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="pt-4">
              <div className="text-sm opacity-70">
                {description}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}