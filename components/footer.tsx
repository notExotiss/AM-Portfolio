'use client'

import { motion } from 'framer-motion'
import { Github, Linkedin, Instagram } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="relative border-t border-border py-12">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-muted-foreground text-sm"
          >
            © {new Date().getFullYear()} Aarit Malhotra. All rights reserved.
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex gap-4"
          >
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full bg-card border border-border hover:border-primary transition-all"
            >
              <Github size={20} />
            </a>
            <a
              href="https://www.linkedin.com/in/aarit-malhotra-b5198b171/"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full bg-card border border-border hover:border-primary transition-all"
            >
              <Linkedin size={20} />
            </a>
            <a
              href="http://instagram.com/aaritmalhotra09"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full bg-card border border-border hover:border-primary transition-all"
            >
              <Instagram size={20} />
            </a>
          </motion.div>
        </div>
      </div>
    </footer>
  )
}
