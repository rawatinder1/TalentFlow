"use client";

import { motion } from "motion/react";
import React, { useState } from "react";
//@ts-ignore
import { HelpCircle, Users, ArrowRight, Trash2 } from "lucide-react";

const HelpModal: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={openModal}
        className="p-2 rounded-full border-2 transition-all duration-300 bg-white/80 border-gray-300 text-gray-500 hover:bg-blue-50 hover:border-blue-400 hover:text-blue-600 shadow-md"
      >
        <HelpCircle className="w-5 h-5" />
      </motion.button>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={closeModal}
          />
          
          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="relative w-full max-w-md rounded-2xl border backdrop-blur-xl shadow-2xl bg-white/95 border-gray-300/60"
          >
            <div className="absolute inset-0 overflow-hidden rounded-2xl">
              <motion.div
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 0.3 }}
                transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
                className="absolute top-2 left-2 w-16 h-16 rounded-full bg-blue-500/5 blur-xl"
              />
              <motion.div
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 0.2 }}
                transition={{ duration: 3, repeat: Infinity, repeatType: "reverse", delay: 1 }}
                className="absolute bottom-2 right-2 w-12 h-12 rounded-full bg-purple-500/5 blur-xl"
              />
            </div>

            

            <div className="p-6 relative z-10">
              {/* Header */}
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.5 }}
                className="mb-6 text-center"
              >
                <motion.div 
                  animate={{ 
                    rotate: [0, 5, -5, 0],
                    scale: [1, 1.05, 1]
                  }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="mb-3 p-3 rounded-2xl border inline-block bg-blue-50 border-blue-200"
                >
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2H9a2 2 0 00-2 2v10z" />
                  </svg>
                </motion.div>
                <h2 className="text-xl font-bold mb-1 text-gray-900">
                  Candidate Pipeline
                </h2>
                <p className="text-sm text-gray-600">
                  Manage your recruitment process efficiently
                </p>
              </motion.div>

              {/* Steps */}
              <div className="space-y-3">
                {[
                  {
                    title: "Drag & Drop Candidates",
                    description: "Move candidates between stages by dragging cards across columns.",
                    icon: ArrowRight
                  },
                  {
                    title: "Track Progress",
                    description: "Monitor candidate count in each stage with the pipeline overview.",
                    icon: Users
                  },
                  {
                    title: "Remove Candidates", 
                    description: "Click the × button on any card to remove candidates from the pipeline.",
                    icon: Trash2
                  }
                ].map((step, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + index * 0.1, duration: 0.4 }}
                    className="flex gap-3 p-3 rounded-xl border transition-all duration-300 hover:scale-[1.02] bg-gray-50/80 border-gray-200/50 hover:bg-gray-100/80"
                  >
                    <motion.div 
                      animate={{ 
                        scale: [1, 1.1, 1],
                        rotate: [0, 5, -5, 0]
                      }}
                      transition={{ 
                        duration: 3, 
                        repeat: Infinity,
                        delay: index * 0.5
                      }}
                      className="flex-shrink-0 w-8 h-8 rounded-full border flex items-center justify-center bg-blue-100 text-blue-600 border-blue-200"
                    >
                      <step.icon className="w-4 h-4" />
                    </motion.div>
                    <div>
                      <motion.h3 
                        className="font-medium text-sm mb-0.5 text-gray-900"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 + index * 0.1 }}
                      >
                        {step.title}
                      </motion.h3>
                      <motion.p 
                        className="text-xs leading-relaxed text-gray-600"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 + index * 0.1 }}
                      >
                        {step.description}
                      </motion.p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Pro Tip */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                className="mt-4 p-3 rounded-xl border bg-emerald-50 border-emerald-200"
              >
                <div className="flex items-start gap-2">
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="mt-0.5"
                  >
                    💡
                  </motion.div>
                  <div>
                    <h4 className="font-medium text-xs text-emerald-700">
                      Pro Tip
                    </h4>
                    <p className="text-xs text-emerald-600">
                      Scroll horizontally while dragging to access all pipeline stages.
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* CTA */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.5 }}
                className="mt-4 text-center"
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={closeModal}
                  className="px-6 py-2 rounded-xl text-xs font-medium transition-all duration-200 bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/25"
                >
                  Got it!
                </motion.button>
              </motion.div>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
};

export default HelpModal