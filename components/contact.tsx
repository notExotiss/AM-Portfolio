'use client'

import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { Mail, Linkedin, Instagram, Github, MapPin, Phone } from 'lucide-react'
import Tilt from 'react-parallax-tilt'

export default function Contact() {
  const { ref, inView } = useInView({ threshold: 0.1, triggerOnce: true })
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  })

  const parallaxY = useTransform(scrollYProgress, [0, 1], [-30, 30])

  return (
    <section
      id="contact"
      ref={containerRef}
      className="relative min-h-screen py-32 md:py-24 flex items-center"
      aria-label="Contact section"
    >
      {/* Enhanced Background Effects */}
      <div className="absolute inset-0 -z-10">
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            rotate: [0, 90, 0],
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
          className=""
          style={{ y: parallaxY }}
        >
            <motion.h2
              className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 md:mb-8 text-left font-[var(--font-titillium)] tracking-tight"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={inView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.6 }}
              style={{
                backgroundImage: 'linear-gradient(135deg, #3b82f6, #ef4444)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Get In Touch
            </motion.h2>
          <p className="text-left text-base md:text-lg text-muted-foreground/80 mb-12 md:mb-16 max-w-2xl font-[var(--font-space-grotesk)] leading-relaxed">
            Let&#39;s connect and discuss opportunities or collaborations
          </p>

          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="space-y-6"
            >
              <Tilt tiltMaxAngleX={5} tiltMaxAngleY={5} scale={1.02}>
                <motion.div
                  className="p-6 md:p-8 bg-card/50 backdrop-blur-sm border border-border/50 rounded-3xl hover:border-primary transition-all relative overflow-hidden group"
                  whileHover={{ y: -5 }}
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  />
                  <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-2">
                      <Mail className="w-6 h-6 text-primary" />
                      <h3 className="text-xl font-bold font-[var(--font-titillium)] tracking-tight">Email</h3>
                    </div>
                    <a
                      href="mailto:iamaaritmalhotra@gmail.com"
                      className="text-muted-foreground/80 hover:text-primary transition-colors block mb-1 font-[var(--font-space-grotesk)]"
                    >
                      iamaaritmalhotra@gmail.com
                    </a>
                    <a
                      href="mailto:3017942@edison.k12.nj.us"
                      className="text-muted-foreground hover:text-primary transition-colors block font-[var(--font-ubuntu)] font-normal"
                    >
                      3017942@edison.k12.nj.us
                    </a>
                  </div>
                </motion.div>
              </Tilt>

              <Tilt tiltMaxAngleX={5} tiltMaxAngleY={5} scale={1.02}>
                <motion.div
                  className="p-6 md:p-8 bg-card/50 backdrop-blur-sm border border-border/50 rounded-3xl hover:border-primary transition-all relative overflow-hidden group"
                  whileHover={{ y: -5 }}
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  />
                  <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-2">
                      <Phone className="w-6 h-6 text-primary" />
                      <h3 className="text-xl font-bold font-[var(--font-titillium)] tracking-tight">Phone</h3>
                    </div>
                    <a
                      href="tel:18482090996"
                      className="text-muted-foreground/80 hover:text-primary transition-colors font-[var(--font-space-grotesk)]"
                    >
                      (848) 209-0996
                    </a>
                  </div>
                </motion.div>
              </Tilt>

              <Tilt tiltMaxAngleX={5} tiltMaxAngleY={5} scale={1.02}>
                <motion.div
                  className="p-6 md:p-8 bg-card/50 backdrop-blur-sm border border-border/50 rounded-3xl hover:border-primary transition-all relative overflow-hidden group"
                  whileHover={{ y: -5 }}
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  />
                  <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-2">
                      <MapPin className="w-6 h-6 text-primary" />
                      <h3 className="text-xl font-bold font-[var(--font-titillium)] tracking-tight">Location</h3>
                    </div>
                    <p className="text-muted-foreground/80 font-[var(--font-space-grotesk)]">
                      Edison, New Jersey
                    </p>
                  </div>
                </motion.div>
              </Tilt>
            </motion.div>

            {/* Social Links */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="space-y-6"
            >
              <div className="p-6 md:p-8 glass-card rounded-3xl">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-1 h-8 bg-gradient-to-b from-primary to-accent rounded-full" />
                  <h3 className="text-xl md:text-2xl font-bold font-[var(--font-titillium)] tracking-tight">Connect With Me</h3>
                </div>
                <div className="grid grid-cols-2 gap-5">
                  {[
                    { icon: Linkedin, href: 'https://www.linkedin.com/in/aarit-malhotra-b5198b171/', label: 'LinkedIn', desc: 'Professional Network', gradient: 'from-blue-500/20 to-blue-600/20', color: 'text-blue-400' },
                    { icon: Instagram, href: 'http://instagram.com/aaritmalhotra09', label: 'Instagram', desc: '@aaritmalhotra09', gradient: 'from-pink-500/20 to-purple-500/20', color: 'text-pink-400' },
                    { icon: Github, href: 'https://github.com/notExotiss/', label: 'GitHub', desc: 'Code & Projects', gradient: 'from-gray-500/20 to-gray-600/20', color: 'text-gray-400' },
                    { icon: Mail, href: 'mailto:iamaaritmalhotra@gmail.com', label: 'Email', desc: 'Direct Message', gradient: 'from-red-500/20 to-orange-500/20', color: 'text-red-400' },
                  ].map((social, index) => (
                    <Tilt key={social.label} tiltMaxAngleX={10} tiltMaxAngleY={10} scale={1.05}>
                      <motion.a
                        href={social.href}
                        target={social.href.startsWith('http') ? '_blank' : undefined}
                        rel={social.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                        className="p-6 glass-card rounded-2xl hover:border-primary/50 transition-all group relative overflow-hidden block focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
                        whileHover={{ y: -5, scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={inView ? { opacity: 1, y: 0 } : {}}
                        transition={{ delay: 0.6 + index * 0.1 }}
                        aria-label={`Visit ${social.label}${social.desc ? ` - ${social.desc}` : ''}`}
                      >
                        <motion.div
                          className={`absolute inset-0 bg-gradient-to-br ${social.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                          aria-hidden="true"
                        />
                        <div className="relative z-10">
                          <div className="mb-3">
                            <social.icon className={`w-8 h-8 ${social.color} group-hover:scale-110 transition-transform`} aria-hidden="true" />
                          </div>
                          <div className="font-medium font-[var(--font-space-grotesk)] mb-1">{social.label}</div>
                          <div className="text-sm text-muted-foreground/70 font-[var(--font-space-grotesk)]">{social.desc}</div>
                          <div className="mt-3 h-0.5 w-0 bg-primary group-hover:w-full transition-all duration-300" aria-hidden="true" />
                        </div>
                      </motion.a>
                    </Tilt>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}