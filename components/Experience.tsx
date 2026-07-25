"use client";

import { createContext, useContext, useState } from "react";
import SmoothScroll from "./SmoothScroll";
import Intro from "./Intro";
import Nav from "./Nav";
import Hero from "./Hero";
import CollectionTeaser from "./CollectionTeaser";
import WhyDifferent from "./WhyDifferent";
import ProductComparison from "./ProductComparison";
import Guarantees from "./Guarantees";

/** True once the opening logo sequence has finished. */
const IntroContext = createContext(false);
export const useIntroDone = () => useContext(IntroContext);

export default function Experience() {
  const [introDone, setIntroDone] = useState(false);

  return (
    <SmoothScroll>
      <IntroContext.Provider value={introDone}>
        <Intro onComplete={() => setIntroDone(true)} />
        <Nav />
        <main>
          <Hero />
          <CollectionTeaser />
          <WhyDifferent />
          <ProductComparison />
          <Guarantees />
        </main>
      </IntroContext.Provider>
    </SmoothScroll>
  );
}
