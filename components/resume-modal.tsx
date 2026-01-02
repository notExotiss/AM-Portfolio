'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Download, Briefcase, GraduationCap, Award, Code, X } from 'lucide-react'
import Tilt from 'react-parallax-tilt'
import Image from 'next/image'
import * as Dialog from '@radix-ui/react-dialog'

// Tech stack with local SVG paths
const techStack = [
  { name: 'Python', icon: '/python.svg' },
  { name: 'TypeScript', icon: '/typescript.svg' },
  { name: 'JavaScript', icon: '/javascript.svg' },
  { name: 'React', icon: '/react.svg' },
  { name: 'Next.js', icon: '/nextjs.svg' },
  { name: 'HTML', icon: '/html.svg' },
  { name: 'CSS', icon: '/css.svg' },
  { name: 'Tailwind', icon: '/tailwind.svg' },
  { name: 'Java', icon: '/java.svg' },
  { name: 'Firebase', icon: '/firebase.svg' },
  { name: 'Git', icon: '/git.svg' },
  { name: 'Shadcn', icon: '/shadcn.svg' },
  { name: 'Three.js', icon: '/threejs.svg' },
]

export function ResumeModal({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/95 backdrop-blur-md z-50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl max-h-[95vh] glass-card rounded-3xl z-50 overflow-y-auto shadow-2xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="relative p-8"
          >
            {/* Close Button */}
            <Dialog.Close asChild>
              <motion.button
                className="absolute top-6 right-6 p-3 rounded-full glass-card hover:border-primary transition-all group z-10 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                aria-label="Close resume modal"
              >
                <X size={20} className="group-hover:text-primary transition-colors" aria-hidden="true" />
              </motion.button>
            </Dialog.Close>

            {/* Header */}
            <div className="flex items-center justify-between mb-8 gap-4 pr-12">
              <motion.h2
                className="text-4xl md:text-5xl font-bold font-[var(--font-titillium)] tracking-tight"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                style={{
                  backgroundImage: 'linear-gradient(135deg, #3b82f6, #ef4444, #8b5cf6, #f59e0b)',
                  backgroundSize: '300%',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  animation: 'gradient-shift 5s ease infinite',
                }}
              >
                Resume
              </motion.h2>
            </div>

            {/* Download Button - Moved below header */}
            <motion.div
              className="mb-12"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <motion.a
                href="/Aarit Malhotra - Resume.pdf"
                download
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-all group glass-card font-[var(--font-space-grotesk)] font-medium"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Download size={18} className="group-hover:scale-110 transition-transform" />
                Download PDF
              </motion.a>
            </motion.div>

            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="mb-12"
            >
              <Tilt tiltMaxAngleX={3} tiltMaxAngleY={3} scale={1.01}>
                <div className="p-6 md:p-8 glass-card rounded-3xl hover:border-primary/50 transition-all relative overflow-hidden group">
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  />
                  <div className="relative z-10">
                    <h3 className="text-2xl md:text-3xl font-bold mb-4 font-[var(--font-titillium)] tracking-tight">Aarit Malhotra</h3>
                    <p className="text-muted-foreground/80 mb-3 font-[var(--font-space-grotesk)]">Fullstack Developer and Student</p>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground/70 font-[var(--font-space-grotesk)]">
                      <span>John P. Stevens High School</span>
                      <span>•</span>
                      <span>(848) 209-0996</span>
                      <span>•</span>
                      <a href="mailto:3017942@edison.k12.nj.us" className="hover:text-primary transition-colors">
                        3017942@edison.k12.nj.us
                      </a>
                      <span>•</span>
                      <a href="mailto:iamaaritmalhotra@gmail.com" className="hover:text-primary transition-colors">
                        iamaaritmalhotra@gmail.com
                      </a>
                    </div>
                  </div>
                </div>
              </Tilt>
            </motion.div>

            {/* Education */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="mb-12"
            >
              <div className="flex items-center gap-3 mb-6">
                <GraduationCap className="w-6 h-6 text-primary" />
                <h3 className="text-3xl md:text-4xl font-bold font-[var(--font-titillium)] tracking-tight">Education</h3>
              </div>
              <Tilt tiltMaxAngleX={3} tiltMaxAngleY={3} scale={1.01}>
                <div className="p-6 md:p-8 glass-card rounded-3xl hover:border-primary/50 transition-all relative overflow-hidden group">
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  />
                  <div className="relative z-10">
                    <h4 className="text-xl md:text-2xl font-bold mb-3 font-[var(--font-titillium)] tracking-tight">John P. Stevens High School</h4>
                    <p className="text-muted-foreground/80 mb-2 font-[var(--font-space-grotesk)]">Edison, NJ | Class of 2028</p>
                    <p className="mb-3 font-[var(--font-space-grotesk)] font-medium">Unweighted GPA: 4.0</p>
                    <p className="text-muted-foreground/70 font-[var(--font-space-grotesk)] leading-relaxed">
                      Honors/AP: English 2-H, Pre-Calculus H, AP US History, AP Biology, 
                      AP Chemistry, AP CSP, AP CSA
                    </p>
                  </div>
                </div>
              </Tilt>
            </motion.div>

            {/* Experience */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="mb-12"
            >
              <div className="flex items-center gap-3 mb-6">
                <Briefcase className="w-6 h-6 text-primary" />
                <h3 className="text-3xl md:text-4xl font-bold font-[var(--font-titillium)] tracking-tight">Experience</h3>
              </div>
                  <div className="space-y-6">
                <Tilt tiltMaxAngleX={3} tiltMaxAngleY={3} scale={1.01}>
                  <motion.div
                    className="p-6 md:p-8 glass-card rounded-3xl hover:border-primary/50 transition-all relative overflow-hidden group"
                    whileHover={{ y: -5 }}
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    />
                    <div className="relative z-10">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="text-xl md:text-2xl font-bold font-[var(--font-titillium)] tracking-tight">WWMC (Woodrow Wilson Math Competition)</h4>
                          <p className="text-primary font-[var(--font-space-grotesk)] font-medium">Co-Founder</p>
                        </div>
                        <span className="text-sm text-muted-foreground/60 font-[var(--font-space-grotesk)]">June 2023 - Present</span>
                      </div>
                      <p className="text-muted-foreground/70 font-[var(--font-space-grotesk)] leading-relaxed">
                        Founded first-ever district wide math competition for Edison, NJ. 
                        Attracted over 400+ participants and led 70+ volunteers. 
                        Raised $4000+ for local charities.
                      </p>
                    </div>
                  </motion.div>
                </Tilt>

                <Tilt tiltMaxAngleX={3} tiltMaxAngleY={3} scale={1.01}>
                  <motion.div
                    className="p-6 glass-card rounded-2xl hover:border-primary/50 transition-all relative overflow-hidden group"
                    whileHover={{ y: -5 }}
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    />
                    <div className="relative z-10">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="text-xl md:text-2xl font-bold font-[var(--font-titillium)] tracking-tight">JPS Robotics Programming Member</h4>
                        </div>
                        <span className="text-sm text-muted-foreground/60 font-[var(--font-space-grotesk)]">2023 - Present</span>
                      </div>
                      <p className="text-muted-foreground/70 font-[var(--font-space-grotesk)] leading-relaxed">
                        Programmed semi-autonomous robots using JAVA for regional competitions, 
                        focusing on precision control and sensor integration.
                      </p>
                    </div>
                  </motion.div>
                </Tilt>
              </div>
            </motion.div>

            {/* Technical Skills */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="mb-12"
            >
              <div className="flex items-center gap-3 mb-6">
                <Code className="w-6 h-6 text-primary" />
                <h3 className="text-3xl md:text-4xl font-bold font-[var(--font-titillium)] tracking-tight">Technical Skills</h3>
              </div>
              <Tilt tiltMaxAngleX={3} tiltMaxAngleY={3} scale={1.01}>
                <div className="p-6 md:p-8 glass-card rounded-3xl hover:border-primary/50 transition-all relative overflow-hidden group">
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  />
                  <div className="relative z-10 grid grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 md:gap-3">
                    {techStack.map((skill, index) => (
                      <motion.div
                        key={skill.name}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 + index * 0.03 }}
                        className="aspect-square p-1.5 md:p-3 glass-card rounded-lg border border-border/30 hover:border-primary/50 transition-all group relative overflow-hidden flex flex-col items-center justify-center gap-1 md:gap-2"
                      >
                        <div className="relative z-10 flex flex-col items-center justify-center gap-1 md:gap-2 h-full">
                          <div className="relative w-6 h-6 md:w-10 md:h-10 flex items-center justify-center">
                            <Image
                              src={skill.icon}
                              alt={skill.name}
                              width={40}
                              height={40}
                              className="w-full h-full object-contain"
                            />
                          </div>
                          <p className="font-medium font-[var(--font-space-grotesk)] text-center text-[10px] md:text-xs leading-tight">{skill.name}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </Tilt>
            </motion.div>

            {/* Achievements */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <Award className="w-6 h-6 text-primary" />
                <h3 className="text-3xl md:text-4xl font-bold font-[var(--font-titillium)] tracking-tight">Academic Competitions & Awards</h3>
              </div>
              <div className="space-y-4">
                {[
                  { title: 'USA Computing Olympiad', desc: 'Top 10% Scorer', gradient: 'from-yellow-500/10 to-orange-500/10' },
                  { title: 'FBLA Nationals', desc: '5th place in FBLA Nationals \'23 for Exploring Technology and 2nd place in FBLA Nationals \'24 for Video Game Challenge', gradient: 'from-blue-500/10 to-purple-500/10' },
                  { title: 'AMC 10 / AIME Qualification', desc: 'Top 7% Scorer', gradient: 'from-green-500/10 to-emerald-500/10' },
                ].map((achievement, index) => (
                  <Tilt key={achievement.title} tiltMaxAngleX={3} tiltMaxAngleY={3} scale={1.01}>
                    <motion.div
                      className="p-6 md:p-8 glass-card rounded-3xl hover:border-primary/50 transition-all relative overflow-hidden group"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.7 + index * 0.1 }}
                      whileHover={{ y: -5 }}
                    >
                      <motion.div
                        className={`absolute inset-0 bg-gradient-to-br ${achievement.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                      />
                      <div className="relative z-10">
                        <h4 className="text-lg md:text-xl font-bold mb-2 font-[var(--font-titillium)] tracking-tight">{achievement.title}</h4>
                        <p className="text-muted-foreground/70 font-[var(--font-space-grotesk)] leading-relaxed">{achievement.desc}</p>
                      </div>
                    </motion.div>
                  </Tilt>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

