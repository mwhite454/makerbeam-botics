import { createContext } from "react";

export const HaltDimmedContext = createContext<Set<string>>(new Set());
