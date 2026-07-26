"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
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

// Mobile overlay: links cascade in
const menuList = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.12 } },
};
const menuItem = {
  hidden: { opacity: 0, y: 26 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease } },
};

/**
 * @param revealed  Force the nav visible immediately (sub-pages without the
 *                  opening intro). On the homepage it follows the intro.
 */
export default function Nav({ revealed }: { revealed?: boolean }) {
  const introDone = useIntroDone();
  const show = revealed ?? introDone;

  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const wasOpen = useRef(false);

  // Lock scrolling (and pause Lenis) while the overlay is open; manage focus.
  useEffect(() => {
    const lenis = (window as unknown as { lenis?: { start: () => void; stop: () => void } }).lenis;
    if (open) {
      lenis?.stop();
      document.documentElement.classList.add("menu-open");
      closeRef.current?.focus();
      wasOpen.current = true;
    } else {
      lenis?.start();
      document.documentElement.classList.remove("menu-open");
      if (wasOpen.current) toggleRef.current?.focus();
      wasOpen.current = false;
    }
    return () => {
      lenis?.start();
      document.documentElement.classList.remove("menu-open");
    };
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
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

        <motion.button
          ref={toggleRef}
          variants={item}
          type="button"
          className="nav__toggle"
          aria-label="Apri il menu"
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen(true)}
        >
          <span className="nav__toggle-line" />
          <span className="nav__toggle-line" />
        </motion.button>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            className="menu"
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45, ease }}
          >
            <div className="menu__bar">
              <Link href="/" className="nav__brand" aria-label="The Double Twenty — home" onClick={() => setOpen(false)}>
                <span className="nav__brand-the">The</span>
                <span className="nav__brand-name">Double Twenty</span>
              </Link>
              <button
                ref={closeRef}
                type="button"
                className="menu__close"
                aria-label="Chiudi il menu"
                onClick={() => setOpen(false)}
              >
                <span className="menu__close-x" aria-hidden="true" />
              </button>
            </div>

            <motion.ul className="menu__list" variants={menuList} initial="hidden" animate="show">
              {LINKS.map((l, i) => (
                <motion.li key={l.href} className="menu__item" variants={menuItem}>
                  <Link href={l.href} className="menu__link" onClick={() => setOpen(false)}>
                    <span className="menu__index">{String(i + 1).padStart(2, "0")}</span>
                    <span className="menu__label">{l.label}</span>
                    <span className="menu__chevron" aria-hidden="true">→</span>
                  </Link>
                </motion.li>
              ))}
            </motion.ul>

            <motion.div
              className="menu__foot"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease, delay: 0.12 + LINKS.length * 0.08 }}
            >
              <Link href="/collezione" className="menu__cta" onClick={() => setOpen(false)}>
                Acquista
                <span aria-hidden="true">→</span>
              </Link>
              <span className="menu__tag">Cuscini ergonomici in puro lattice</span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
