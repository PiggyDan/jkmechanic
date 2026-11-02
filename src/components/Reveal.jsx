import { motion } from 'motion/react'

// Fades a block up the first time it scrolls into view. MotionConfig reducedMotion="user"
// turns the movement off for visitors who ask for less motion.
export default function Reveal({ as = 'div', children, ...props }) {
  const Tag = motion[as]
  return (
    <Tag
      initial={{ opacity: 0, y: 36 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -12% 0px' }}
      transition={{ duration: 0.8, ease: [0.2, 0.7, 0.2, 1] }}
      {...props}
    >
      {children}
    </Tag>
  )
}
