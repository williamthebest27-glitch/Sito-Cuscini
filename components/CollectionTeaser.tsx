"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const ITEMS = [
  { i: "01", name: "Cervicale", desc: "Sostegno mirato per la curva del collo." },
  { i: "02", name: "Classico", desc: "Morbidezza avvolgente, notte dopo notte." },
  { i: "03", name: "Viaggio", desc: "Il tuo comfort, ovunque tu vada." },
];

const ease = [0.16, 1, 0.3, 1] as const;

export default function CollectionTeaser() {
  return (
    <section id="collezione" className="teaser" aria-label="La collezione">
      <div className="teaser__head">
        <motion.h2
          className="teaser__title"
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-15%" }}
          transition={{ duration: 0.9, ease }}
        >
          La Collezione
        </motion.h2>
        <motion.p
          className="teaser__note"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-15%" }}
          transition={{ duration: 0.9, ease, delay: 0.1 }}
        >
          Tre forme, un solo principio: accompagnare il corpo senza forzarlo.
          Puro lattice naturale, traspirante e duraturo.
        </motion.p>
      </div>

      <div className="teaser__grid">
        {ITEMS.map((item, idx) => (
          <motion.article
            key={item.i}
            className="card"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 0.9, ease, delay: idx * 0.1 }}
          >
            <span className="card__index">{item.i}</span>
            <h3 className="card__name">{item.name}</h3>
            <p className="card__desc">{item.desc}</p>
          </motion.article>
        ))}
      </div>

      <motion.div
        className="teaser__cta"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-10%" }}
        transition={{ duration: 0.9, ease, delay: 0.15 }}
      >
        <Link href="/collezione" className="teaser__cta-link">
          Vedi tutta la collezione
          <span aria-hidden="true">→</span>
        </Link>
      </motion.div>
    </section>
  );
}
