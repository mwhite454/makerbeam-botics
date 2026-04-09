import type { ScopeVariable } from "./scopeResolver";

/**
 * Safely evaluate a numeric/math expression with variable substitution.
 * Returns the result string or null if evaluation fails or is unsafe.
 *
 * Allowed: numbers, arithmetic operators, parentheses, variable names.
 * Disallowed: anything that looks like code injection.
 */
export function evaluateExpression(
  expr: string,
  scopeVars: ScopeVariable[],
): string | null {
  if (!expr || typeof expr !== "string") return null;
  const trimmed = expr.trim();
  if (trimmed === "") return null;

  // If it's a pure number, return it directly
  const asNum = Number(trimmed);
  if (!isNaN(asNum)) return String(asNum);

  // Substitute known variable names with their values
  let substituted = trimmed;
  for (const v of scopeVars) {
    if (v.currentValue !== undefined) {
      // Replace whole-word occurrences of the variable name with its value
      const escaped = v.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      substituted = substituted.replace(
        new RegExp(`\\b${escaped}\\b`, "g"),
        v.currentValue,
      );
    }
  }

  // Safety check: only allow math characters + whitespace after substitution
  if (!/^[0-9+\-*/%(). \t,]+$/.test(substituted)) {
    return null;
  }

  try {
    // Use Function constructor with strict arithmetic only
    const result = new Function(`"use strict"; return (${substituted});`)();
    if (typeof result === "number" && isFinite(result)) {
      // Round to avoid floating point artifacts
      return String(Math.round(result * 1e10) / 1e10);
    }
    return null;
  } catch {
    return null;
  }
}
