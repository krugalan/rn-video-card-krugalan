module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: "module",
    ecmaFeatures: {
      jsx: true,
    },
  },
  plugins: ["@typescript-eslint", "react", "react-hooks", "react-native"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
  ],
  rules: {
    // --- SEGURIDAD Y CALIDAD DE TIPOS ---

    // El ejercicio exige: "no any types allowed"
    // any desactiva el type checker — anula el proposito de TypeScript
    "@typescript-eslint/no-explicit-any": "error",

    // El ejercicio exige: "no console.log statements"
    // console.log en produccion expone datos internos y contamina logs
    "no-console": "error",

    // Variables declaradas pero no usadas son codigo muerto
    // Indica logica incompleta o imports olvidados
    "@typescript-eslint/no-unused-vars": [
      "error",
      {
        argsIgnorePattern: "^_", // Permite _params en callbacks
        varsIgnorePattern: "^_", // Permite _vars destructuradas
      },
    ],

    // --- REACT HOOKS ---

    // Asegura que las dependencias de useEffect/useMemo/useCallback sean correctas
    // Deps faltantes causan bugs de stale closures — difíciles de debuggear
    "react-hooks/exhaustive-deps": "warn",

    // Asegura que los hooks se llamen en el mismo orden siempre
    // Hooks condicionales rompen el state interno de React
    "react-hooks/rules-of-hooks": "error",

    // --- REACT ---

    // React 17+ con JSX transform no requiere import React
    // Evita warnings innecesarios
    "react/react-in-jsx-scope": "off",

    // Prop types no se necesitan con TypeScript — las interfaces cubren esto
    "react/prop-types": "off",

    // --- REACT NATIVE ---

    // Detecta estilos definidos en StyleSheet que no se usan en el JSX
    "react-native/no-unused-styles": "warn",

    // Evita estilos inline — StyleSheet.create es mas performante
    // porque los estilos se envian al bridge nativo una sola vez
    "react-native/no-inline-styles": "warn",

    // Detecta colores hardcodeados fuera de StyleSheet
    // Promueve consistencia visual y facilita temas dark/light
    "react-native/no-color-literals": "warn",
  },
  settings: {
    react: {
      version: "detect",
    },
  },
  // Ignora archivos generados por Expo y dependencias
  ignorePatterns: [
    "node_modules/",
    ".expo/",
    "babel.config.js",
    "metro.config.js",
  ],
};
