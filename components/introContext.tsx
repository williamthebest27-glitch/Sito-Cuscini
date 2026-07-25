"use client";

import { createContext, useContext } from "react";

/** True once the opening logo sequence has finished. Lives in its own module
 *  so lightweight consumers (e.g. Nav on sub-pages) don't pull in the whole
 *  homepage experience (Hero video, Intro, …). */
export const IntroContext = createContext(false);
export const useIntroDone = () => useContext(IntroContext);
