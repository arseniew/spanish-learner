// src/setupTests.ts
import '@testing-library/jest-dom';

// Mock localStorage
const localStorageMock = (() => {
  let store: { [key: string]: string } = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    key: (index: number) => Object.keys(store)[index] || null,
    get length() {
      return Object.keys(store).length;
    }
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// You can add other global setup here if needed, e.g.,
// - Mocking other browser APIs
// - Configuring testing-library (though defaults are often fine)

// Example of how to clear localStorage before each test if needed globally
// (though it's often better to do this selectively in describe/beforeEach blocks)
// beforeEach(() => {
//   localStorageMock.clear();
// });
