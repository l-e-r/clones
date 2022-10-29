import React from 'react'
import { motion } from "framer-motion";

type Props = {}

const WalletMessage = (props: Props) => {
  return (
    <motion.div
        variants={{
            hidden: {
            opacity: 0,
            },
            show: {
                opacity: 1,
                transition: {
                staggerChildren: 0.6,
                delayChildren: 0.3,
                },
            }
        }}
        initial="hidden"
        animate="show" 
        className="max-w-6xl mx-auto w-full">
        <div className="flex items-center justify-center bg-red-600 p-1">
            <p className="text-xs font-semibold">
                No Wallet Connection
            </p>
        </div>
    </motion.div>
  )
}

export default WalletMessage