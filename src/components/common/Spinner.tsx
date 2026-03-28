import { motion } from 'framer-motion';

const sizes = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-10 w-10',
};

export function Spinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  return (
    <motion.div
      className={`${sizes[size]} rounded-full border-2`}
      style={{
        borderColor: 'var(--border-color)',
        borderTopColor: 'var(--text-accent)',
      }}
      animate={{ rotate: 360 }}
      transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
      role="status"
      aria-label="Loading"
    />
  );
}
