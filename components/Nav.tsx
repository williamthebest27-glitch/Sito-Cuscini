"use client";

import { motion } from "framer-motion";
import { useIntroDone } from "./Experience";

const LINKS = [
  { label: "Collezione", href: "#collezione" },
  { label: "Perché", href: "#perche" },
  { label: "Materiali", href: "#materiali" },
];

const ease = [0.16, 1, 0.3, 1] as const;

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};
const item = {
  hidden: { opacity: 0, y: -14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease } },
};

export default function Nav() {
  const introDone = useIntroDone();

  return (
    <motion.header
      className="nav"
      variants={container}
      initial="hidden"
      animate={introDone ? "show" : "hidden"}
    >
      <motion.a variants={item} href="#" className="nav__brand" aria-label="The Double Twenty — home">
        <span className="nav__brand-the">The</span>
        <span className="nav__brand-name">Double Twenty</span>
      </motion.a>

      <nav className="nav__links" aria-label="Navigazione principale">
        {LINKS.map((l) => (
          <motion.a key={l.href} variants={item} href={l.href} className="nav__link">
            {l.label}
          </motion.a>
        ))}
      </nav>

      <motion.a variants={item} href="#collezione" className="nav__cta">
        Acquista
      </motion.a>
    </motion.header>
  );
}
