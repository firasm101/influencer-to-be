import "@testing-library/jest-dom";

// Fix React 19 + @testing-library/react + ts-jest compatibility
// In CJS environments, React.act may not be directly exported.
// Polyfill it from react-dom/test-utils for @testing-library/react.
import React from "react";
if (typeof React.act !== "function") {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const reactDomTestUtils = require("react-dom/test-utils");
    if (reactDomTestUtils && typeof reactDomTestUtils.act === "function") {
      (React as Record<string, unknown>).act = reactDomTestUtils.act;
    }
  } catch {
    // Ignore if react-dom/test-utils is not available
  }
}

// Tell React we're in a test environment
(globalThis as unknown as Record<string, boolean>).IS_REACT_ACT_ENVIRONMENT = true;
