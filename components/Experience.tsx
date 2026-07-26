"use client";

import { useState } from "react";
import { IntroContext, useIntroDone } from "./introContext";
import SmoothScroll from "./SmoothScroll";
import Intro from "./Intro";
import Nav from "./Nav";
import Hero from "./Hero";
import CollectionTeaser from "./CollectionTeaser";
import WhyDifferent from "./WhyDifferent";
import ProductComparison from "./ProductComparison";
import Guarantees from "./Guarantees";

/** Re-exported for backwards compatibility. */
export { useIntroDone };

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
