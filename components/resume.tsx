'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { Download, Briefcase, GraduationCap, Award, Code } from 'lucide-react'
import Tilt from 'react-parallax-tilt'

export default function Resume() {
  const { ref, inView } = useInView({ threshold: 0.1, triggerOnce: true })
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  })

  const parallaxY = useTransform(scrollYProgress, [0, 1], [-50, 50])
  const parallaxY2 = useTransform(scrollYProgress, [0, 1], [50, -50])

  return (
    <section
      id="resume"
      ref={containerRef}
      className="relative min-h-screen py-24"
    >
      {/* Enhanced Background Effects with Parallax */}
      <div className="absolute inset-0 -z-10">
        <motion.div
          className="absolute top-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl"
          style={{ y: parallaxY }}
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 30, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl"
          style={{ y: parallaxY2 }}
          animate={{
            scale: [1, 1.3, 1],
            x: [0, -30, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <div className="pattern-grid opacity-10" />
      </div>

      <div ref={ref} className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto"
        >
          <div className="flex items-center justify-between mb-12 gap-4">
            <motion.h2
              className="text-5xl md:text-6xl font-bold font-[var(--font-titillium)]"
              initial={{ opacity: 0, x: -50 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6 }}
              style={{
                backgroundImage: 'linear-gradient(135deg, #3b82f6, #ef4444, #8b5cf6, #f59e0b)',
                backgroundSize: '300%',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                animation: 'gradient-shift 5s ease infinite',
                y: parallaxY,
              }}
            >
              Resume
            </motion.h2>
            <motion.a
              href="/Aarit Malhotra - Resume.pdf"
              download
              className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all group glass-card shrink-0"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, x: 50 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 }}
              style={{ y: parallaxY }}
            >
              <Download size={20} className="group-hover:scale-110 transition-transform" />
              Download PDF
            </motion.a>
          </div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-12"
            style={{ y: parallaxY }}
          >
            <Tilt tiltMaxAngleX={3} tiltMaxAngleY={3} scale={1.01}>
              <div className="p-6 glass-card rounded-2xl hover:border-primary/50 transition-all relative overflow-hidden group">
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                />
                <div className="relative z-10">
                  <h3 className="text-2xl font-bold mb-4 font-[var(--font-titillium)] font-semibold">Aarit Malhotra</h3>
                  <p className="text-muted-foreground mb-2 font-[var(--font-ubuntu)] font-normal">Fullstack Developer and Student</p>
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground font-[var(--font-dm-mono)] font-medium">
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
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mb-12"
          >
            <div className="flex items-center gap-3 mb-6">
              <GraduationCap className="w-6 h-6 text-primary" />
              <h3 className="text-3xl font-bold font-[var(--font-titillium)] font-semibold">Education</h3>
            </div>
            <Tilt tiltMaxAngleX={3} tiltMaxAngleY={3} scale={1.01}>
              <div className="p-6 glass-card rounded-2xl hover:border-primary/50 transition-all relative overflow-hidden group">
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                />
                <div className="relative z-10">
                  <h4 className="text-xl font-bold mb-2 font-[var(--font-titillium)] font-semibold">John P. Stevens High School</h4>
                  <p className="text-muted-foreground mb-2 font-[var(--font-ubuntu)] font-normal">Edison, NJ | Class of 2028</p>
                  <p className="mb-2 font-[var(--font-ubuntu)] font-medium">Unweighted GPA: 4.0</p>
                  <p className="text-muted-foreground font-[var(--font-ubuntu)] font-normal">
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
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mb-12"
          >
            <div className="flex items-center gap-3 mb-6">
              <Briefcase className="w-6 h-6 text-primary" />
              <h3 className="text-3xl font-bold font-[var(--font-titillium)] font-semibold">Experience</h3>
            </div>
            <div className="space-y-6">
              <Tilt tiltMaxAngleX={3} tiltMaxAngleY={3} scale={1.01}>
                <motion.div
                  className="p-6 glass-card rounded-2xl hover:border-primary/50 transition-all relative overflow-hidden group"
                  whileHover={{ y: -5 }}
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  />
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="text-xl font-bold font-[var(--font-titillium)] font-semibold">WWMC (Woodrow Wilson Math Competition)</h4>
                        <p className="text-primary font-[var(--font-ubuntu)] font-medium">Co-Founder</p>
                      </div>
                      <span className="text-sm text-muted-foreground font-[var(--font-dm-mono)] font-medium">June 2023 - Present</span>
                    </div>
                    <p className="text-muted-foreground font-[var(--font-ubuntu)] font-normal">
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
                        <h4 className="text-xl font-bold font-[var(--font-titillium)] font-semibold">JPS Robotics Programming Member</h4>
                      </div>
                      <span className="text-sm text-muted-foreground font-[var(--font-dm-mono)] font-medium">2023 - Present</span>
                    </div>
                    <p className="text-muted-foreground font-[var(--font-ubuntu)] font-normal">
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
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mb-12"
          >
            <div className="flex items-center gap-3 mb-6">
              <Code className="w-6 h-6 text-primary" />
              <h3 className="text-3xl font-bold font-[var(--font-titillium)] font-semibold">Technical Skills</h3>
            </div>
            <Tilt tiltMaxAngleX={3} tiltMaxAngleY={3} scale={1.01}>
              <div className="p-6 glass-card rounded-2xl hover:border-primary/50 transition-all relative overflow-hidden group">
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                />
                <div className="relative z-10 grid md:grid-cols-2 gap-4">
                  {[
                    { name: 'Python', years: '2021 - Present', level: 95 },
                    { name: 'TypeScript', years: '2023 - Present', level: 85 },
                    { name: 'React', years: '2023 - Present', level: 90 },
                    { name: 'Next.js', years: '2023 - Present', level: 88 },
                    { name: 'Java', years: '2022 - Present', level: 80 },
                    { name: 'HTML/CSS/JS', years: '2022 - Present', level: 92 },
                  ].map((skill, index) => (
                    <motion.div
                      key={skill.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={inView ? { opacity: 1, x: 0 } : {}}
                      transition={{ delay: 0.6 + index * 0.05 }}
                      className="p-4 glass-card rounded-lg border border-border/50 hover:border-primary/50 transition-all group relative overflow-hidden"
                    >
                      <div className="relative z-10">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-semibold font-[var(--font-titillium)] font-semibold">{skill.name}</p>
                          <span className="text-xs text-muted-foreground font-[var(--font-dm-mono)]">{skill.level}%</span>
                        </div>
                        <p className="text-sm text-muted-foreground font-[var(--font-ubuntu)] font-normal mb-2">{skill.years}</p>
                        <div className="h-1.5 bg-secondary/50 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-gradient-to-r from-primary to-accent"
                            initial={{ width: 0 }}
                            animate={inView ? { width: `${skill.level}%` } : {}}
                            transition={{ duration: 1, delay: 0.7 + index * 0.05 }}
                          />
                        </div>
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
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <Award className="w-6 h-6 text-primary" />
              <h3 className="text-3xl font-bold font-[var(--font-titillium)] font-semibold">Academic Competitions & Awards</h3>
            </div>
            <div className="space-y-4">
              {[
                { title: 'USA Computing Olympiad', desc: 'Top 10% Scorer', gradient: 'from-yellow-500/10 to-orange-500/10' },
                { title: 'FBLA Nationals', desc: '5th place in FBLA Nationals \'23 for Exploring Technology and 2nd place in FBLA Nationals \'24 for Video Game Challenge', gradient: 'from-blue-500/10 to-purple-500/10' },
                { title: 'AMC 10 / AIME Qualification', desc: 'Top 7% Scorer', gradient: 'from-green-500/10 to-emerald-500/10' },
              ].map((achievement, index) => (
                <Tilt key={achievement.title} tiltMaxAngleX={3} tiltMaxAngleY={3} scale={1.01}>
                    <motion.div
                      className="p-6 glass-card rounded-2xl hover:border-primary/50 transition-all relative overflow-hidden group"
                      initial={{ opacity: 0, x: -20 }}
                      animate={inView ? { opacity: 1, x: 0 } : {}}
                      transition={{ delay: 0.7 + index * 0.1 }}
                      whileHover={{ y: -5 }}
                    >
                    <motion.div
                      className={`absolute inset-0 bg-gradient-to-br ${achievement.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                    />
                    <div className="relative z-10">
                      <h4 className="text-lg font-bold mb-1 font-[var(--font-titillium)] font-semibold">{achievement.title}</h4>
                      <p className="text-muted-foreground font-[var(--font-ubuntu)] font-normal">{achievement.desc}</p>
                    </div>
                  </motion.div>
                </Tilt>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
