"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useIntroDone } from "./introContext";

const MotionLink = motion.create(Link);

const LINKS = [
  { label: "Collezione", href: "/collezione" },
  { label: "Perché", href: "/#perche" },
  { label: "Materiali", href: "/#materiali" },
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

/**
 * @param revealed  Force the nav visible immediately (sub-pages without the
 *                  opening intro). On the homepage it follows the intro.
 */
export default function Nav({ revealed }: { revealed?: boolean }) {
  const introDone = useIntroDone();
  const show = revealed ?? introDone;

  return (
    <motion.header
      className="nav"
      variants={container}
      initial="hidden"
      animate={show ? "show" : "hidden"}
    >
      <MotionLink variants={item} href="/" className="nav__brand" aria-label="The Double Twenty — home">
        <span className="nav__brand-the">The</span>
        <span className="nav__brand-name">Double Twenty</span>
      </MotionLink>

      <nav className="nav__links" aria-label="Navigazione principale">
        {LINKS.map((l) => (
          <MotionLink key={l.href} variants={item} href={l.href} className="nav__link">
            {l.label}
          </MotionLink>
        ))}
      </nav>

      <MotionLink variants={item} href="/collezione" className="nav__cta">
        Acquista
      </MotionLink>
    </motion.header>
  );
}
