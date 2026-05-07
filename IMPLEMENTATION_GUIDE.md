# Guia de Implementacion — rn-video-card

> Este documento es la guia paso a paso para construir el proyecto del ejercicio.
> Cada seccion incluye el "que", el "por que" y el "como".
> Leelo completo antes de escribir codigo.

---

## 1. Arquitectura del proyecto

### 1.1 Estructura de directorios

```
rn-video-card-krugalan/
├── .github/
│   └── workflows/
│       └── ci.yml                          # Pipeline de CI/CD
├── .husky/
│   └── pre-commit                          # Hook pre-commit (lint + types)
├── src/
│   ├── components/
│   │   └── VideoPlayerCard/
│   │       ├── index.tsx                   # Re-export publico del componente
│   │       ├── VideoPlayerCard.tsx          # Implementacion del componente
│   │       ├── VideoPlayerCard.test.tsx     # Tests del componente (opcional, bonus)
│   │       └── styles.ts                   # StyleSheet.create aislado
│   ├── hooks/
│   │   ├── usePlaybackProgress.ts          # Hook de logica de playback
│   │   └── __tests__/
│   │       └── usePlaybackProgress.test.ts # Tests unitarios del hook
│   └── types/
│       └── index.ts                        # Interfaces y tipos compartidos
├── App.tsx                                 # Entry point con datos de demo
├── .eslintrc.js                            # Configuracion ESLint
├── .prettierrc                             # Configuracion Prettier (opcional)
├── .gitignore                              # Ignores para React Native + Expo
├── app.json                                # Configuracion de Expo
├── babel.config.js                         # Configuracion de Babel
├── tsconfig.json                           # TypeScript strict
├── package.json                            # Dependencias y scripts
└── README.md                               # Documentacion del proyecto
```

### 1.2 Por que esta estructura

| Directorio | Justificacion |
|---|---|
| `src/components/VideoPlayerCard/` | Patron de **co-location**: componente, estilos y tests en la misma carpeta. Facilita encontrar todo lo relacionado al componente sin navegar entre carpetas distantes. |
| `src/hooks/` | Hooks separados de componentes porque son **logica reutilizable** que no depende de UI. Un hook puede usarse en multiples componentes. |
| `src/types/` | Tipos compartidos en un solo lugar. Evita duplicacion de interfaces entre archivos. |
| `styles.ts` separado | Separar estilos del JSX mejora legibilidad. `StyleSheet.create` ademas optimiza los estilos al crearlos una sola vez en el bridge nativo. |
| `index.tsx` como re-export | Permite importar como `from './VideoPlayerCard'` en lugar de `from './VideoPlayerCard/VideoPlayerCard'`. API publica limpia. |

### 1.3 Principios de arquitectura

**Separation of Concerns:**
- `usePlaybackProgress` contiene SOLO logica de calculo (porcentaje, formato de tiempo)
- `VideoPlayerCard` contiene SOLO renderizado y animaciones
- `styles.ts` contiene SOLO definiciones visuales
- `types/index.ts` contiene SOLO contratos TypeScript

**Flujo de datos unidireccional:**
```
Props (padre)
    ↓
VideoPlayerCard (componente)
    ↓ pasa durationMinutes + elapsedMinutes
usePlaybackProgress (hook)
    ↓ retorna progressPercent + timeRemainingLabel
VideoPlayerCard (renderiza con los valores calculados)
```

**Zero logica de negocio en componentes:**
El componente no calcula porcentajes ni formatea strings. Delega al hook.
Esto permite testear la logica sin montar componentes de React Native.

---

## 2. Instalacion paso a paso

### 2.1 Crear el proyecto

```bash
npx create-expo-app rn-video-card-krugalan --template blank-typescript
cd rn-video-card-krugalan
```

**Por que Expo managed workflow:**
- El ejercicio pide un componente UI con animaciones — no hay modulos nativos custom
- Expo managed da TypeScript, Metro, Jest y Babel pre-configurados
- Zero configuracion de Xcode o Android Studio para correr el proyecto
- Expo SDK 52+ incluye New Architecture (Fabric + TurboModules) por defecto

**Por que NO bare workflow o React Native CLI:**
- El ejercicio no requiere codigo nativo
- Bare workflow agrega complejidad de mantenimiento sin beneficio para este scope
- No necesitamos `react-native-video`, `vision-camera` ni ningun modulo nativo

### 2.2 Inicializar Git y crear feature branch

```bash
git init
git add .
git commit -m "chore: initialize expo project with blank typescript template"
git checkout -b feature/video-player-card
```

**Por que feature branch desde el inicio:**
- El ejercicio exige que el trabajo se entregue como PR de feature branch a main
- Conventional commits desde el primer commit (`chore:`, `feat:`, `ci:`, `docs:`)
- Esto demuestra disciplina de git flow en el historial

### 2.3 Instalar dependencias de desarrollo

```bash
npm install --save-dev \
  eslint \
  @typescript-eslint/eslint-plugin \
  @typescript-eslint/parser \
  eslint-plugin-react \
  eslint-plugin-react-hooks \
  eslint-plugin-react-native \
  husky \
  lint-staged
```

**Justificacion de cada paquete:**

| Paquete | Para que | Por que es necesario |
|---|---|---|
| `eslint` | Linter base | El ejercicio exige que `npm run lint` pase con 0 errores |
| `@typescript-eslint/eslint-plugin` | Reglas de lint para TypeScript | Detecta `any` implicitos, variables no usadas, tipos incorrectos |
| `@typescript-eslint/parser` | Parser de TypeScript para ESLint | ESLint no entiende TypeScript por defecto — necesita este parser |
| `eslint-plugin-react` | Reglas especificas de React | Detecta hooks fuera de orden, keys faltantes, props mal tipadas |
| `eslint-plugin-react-hooks` | Reglas de hooks | Asegura que las rules of hooks se cumplan (no hooks condicionales, deps correctas) |
| `eslint-plugin-react-native` | Reglas de React Native | Detecta estilos no usados, `StyleSheet` sin usar, y practicas RN especificas |
| `husky` | Git hooks | Ejecuta lint automaticamente antes de cada commit |
| `lint-staged` | Lint solo en archivos staged | No lintea todo el proyecto en cada commit — solo lo que cambio |

**Que NO se instala y por que:**

| Paquete omitido | Razon |
|---|---|
| `react-native-reanimated` | Las 2 animaciones del ejercicio son simples. `Animated` nativo es suficiente. Reanimated agrega ~200KB al bundle y requiere plugin de Babel. |
| `react-native-video` | No hay video real — es un "mock now playing card" |
| `styled-components` / `nativewind` | `StyleSheet.create` es idiomatico de RN, zero dependencias extra |
| `@testing-library/react-native` | Para testear el hook solo necesitamos Jest puro — es logica sin UI |
| `prettier` | Opcional. Si lo agregas, configuralo antes del primer commit para no tener diffs de formato mezclados con diffs de logica |

### 2.4 Scripts de package.json

```json
{
  "scripts": {
    "start": "expo start",
    "android": "expo run:android",
    "ios": "expo run:ios",
    "test": "jest",
    "test:watch": "jest --watch",
    "lint": "eslint 'src/**/*.{ts,tsx}' 'App.tsx'",
    "type-check": "tsc --noEmit",
    "prepare": "husky"
  }
}
```

**Justificacion de cada script:**

| Script | Uso | Contexto |
|---|---|---|
| `test` | Corre todos los tests con Jest | CI lo ejecuta — si falla, el pipeline falla |
| `test:watch` | Tests en modo watch para desarrollo | Solo uso local — no se usa en CI |
| `lint` | Ejecuta ESLint en todos los archivos TS/TSX | CI lo ejecuta — si hay errores, el pipeline falla |
| `type-check` | Compila TypeScript sin emitir archivos | Detecta errores de tipo que ESLint no cubre |
| `prepare` | Instala hooks de Husky automaticamente | Se ejecuta despues de `npm install` — configura pre-commit |

---

## 3. Configuracion de ESLint

### 3.1 Archivo `.eslintrc.js`

```javascript
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  plugins: [
    '@typescript-eslint',
    'react',
    'react-hooks',
    'react-native',
  ],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
  ],
  rules: {
    // --- SEGURIDAD Y CALIDAD DE TIPOS ---

    // El ejercicio exige: "no any types allowed"
    // any desactiva el type checker — anula el proposito de TypeScript
    '@typescript-eslint/no-explicit-any': 'error',

    // El ejercicio exige: "no console.log statements"
    // console.log en produccion expone datos internos y contamina logs
    'no-console': 'error',

    // Variables declaradas pero no usadas son codigo muerto
    // Indica logica incompleta o imports olvidados
    '@typescript-eslint/no-unused-vars': ['error', {
      argsIgnorePattern: '^_',        // Permite _params en callbacks
      varsIgnorePattern: '^_',        // Permite _vars destructuradas
    }],

    // --- REACT HOOKS ---

    // Asegura que las dependencias de useEffect/useMemo/useCallback sean correctas
    // Deps faltantes causan bugs de stale closures — difíciles de debuggear
    'react-hooks/exhaustive-deps': 'warn',

    // Asegura que los hooks se llamen en el mismo orden siempre
    // Hooks condicionales rompen el state interno de React
    'react-hooks/rules-of-hooks': 'error',

    // --- REACT ---

    // React 17+ con JSX transform no requiere import React
    // Evita warnings innecesarios
    'react/react-in-jsx-scope': 'off',

    // Prop types no se necesitan con TypeScript — las interfaces cubren esto
    'react/prop-types': 'off',

    // --- REACT NATIVE ---

    // Detecta estilos definidos en StyleSheet que no se usan en el JSX
    'react-native/no-unused-styles': 'warn',

    // Evita estilos inline — StyleSheet.create es mas performante
    // porque los estilos se envian al bridge nativo una sola vez
    'react-native/no-inline-styles': 'warn',

    // Detecta colores hardcodeados fuera de StyleSheet
    // Promueve consistencia visual y facilita temas dark/light
    'react-native/no-color-literals': 'warn',
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  // Ignora archivos generados por Expo y dependencias
  ignorePatterns: [
    'node_modules/',
    '.expo/',
    'babel.config.js',
    'metro.config.js',
  ],
};
```

### 3.2 Que hace cada seccion de reglas

**Seguridad y calidad de tipos:**
- `no-explicit-any` bloquea el uso de `any` que elimina todas las garantias del type system
- `no-console` previene logs que pueden exponer datos sensibles en produccion
- `no-unused-vars` detecta codigo muerto que debe limpiarse

**React Hooks:**
- `rules-of-hooks` previene bugs criticos donde React pierde track del state
- `exhaustive-deps` previene stale closures (uno de los bugs mas comunes en React)

**React Native:**
- `no-unused-styles` mantiene los StyleSheets limpios
- `no-inline-styles` promueve performance (StyleSheet.create solo cruza el bridge una vez)
- `no-color-literals` promueve un sistema de colores consistente

### 3.3 Como resolver errores comunes de ESLint

| Error | Causa | Solucion |
|---|---|---|
| `@typescript-eslint/no-explicit-any` | Usaste `: any` | Define una interface o usa `unknown` si no conoces el tipo |
| `no-console` | `console.log()` en el codigo | Elimina el log, o usa `__DEV__ &&` solo para desarrollo |
| `react-hooks/exhaustive-deps` | Falta dependencia en useEffect | Agrega la dependencia o memoiza con useCallback/useMemo |
| `react-native/no-inline-styles` | `style={{ color: 'red' }}` en JSX | Mueve el estilo a `styles.ts` con StyleSheet.create |

---

## 4. Configuracion de TypeScript

### 4.1 tsconfig.json

```json
{
  "compilerOptions": {
    "strict": true,
    "noEmit": true,
    "target": "ESNext",
    "module": "commonjs",
    "moduleResolution": "node",
    "jsx": "react-jsx",
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules"]
}
```

### 4.2 Flags de seguridad y calidad

| Flag | Que hace | Por que importa |
|---|---|---|
| `strict: true` | Activa ALL strict checks (noImplicitAny, strictNullChecks, etc.) | Es el minimo para un proyecto TypeScript serio. Sin esto, TypeScript permite `null` donde no deberia y no detecta `any` implicitos. |
| `noUnusedLocals` | Error en variables locales no usadas | Codigo muerto es deuda tecnica — detectalo al compilar, no en code review |
| `noUnusedParameters` | Error en parametros no usados | Mismo principio. Usa `_param` si necesitas ignorar uno intencionalmente |
| `noImplicitReturns` | Error si una funcion no retorna en todas las ramas | Previene que una funcion retorne `undefined` por accidente en un `if` sin `else` |
| `noFallthroughCasesInSwitch` | Error en switch sin break/return | Previene bugs silenciosos donde un case cae al siguiente |
| `forceConsistentCasingInFileNames` | Error si importas con casing diferente al archivo real | macOS es case-insensitive pero Linux (CI) es case-sensitive — esto previene fallos que solo aparecen en CI |

---

## 5. Buenas practicas de React Native

### 5.1 Performance

**StyleSheet.create sobre objetos inline:**
```typescript
// MAL — crea un objeto nuevo en cada render, cruza el bridge cada vez
<View style={{ flex: 1, backgroundColor: '#fff' }} />

// BIEN — se crea una vez, se envía al bridge nativo una vez
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
});
<View style={styles.container} />
```

**React.memo para componentes que reciben las mismas props:**
```typescript
// El componente solo se re-renderiza si alguna prop cambia
// Sin memo, se re-renderiza cada vez que el padre se re-renderiza
export default React.memo(VideoPlayerCard);
```

**useCallback para funciones pasadas como props:**
```typescript
// Sin useCallback, onPress es una funcion nueva en cada render
// Esto invalida el React.memo del hijo
const handlePress = useCallback(() => {
  setExpanded(prev => !prev);
}, []);
```

**useMemo para calculos derivados:**
```typescript
// Si progressPercent se calcula de props que no cambian,
// useMemo evita recalcular en cada render
const progressPercent = useMemo(() => {
  if (durationMinutes <= 0) return 0;
  return Math.min((elapsedMinutes / durationMinutes) * 100, 100);
}, [elapsedMinutes, durationMinutes]);
```

### 5.2 Animaciones — Animated API nativo

**Por que Animated nativo y no Reanimated:**
- Solo hay 2 animaciones: progress bar (mount) y expand/collapse (tap)
- `Animated` nativo es suficiente para transiciones simples
- Reanimated agrega ~200KB, requiere plugin de Babel y workaround en web
- Demuestra criterio tecnico: elegir la herramienta proporcional al problema

**Patron de animacion con useRef:**
```typescript
// useRef en lugar de useState porque el Animated.Value no debe causar re-renders
// Es un valor mutable que el sistema de animacion lee directamente
const progressAnim = useRef(new Animated.Value(0)).current;

useEffect(() => {
  Animated.timing(progressAnim, {
    toValue: progressPercent,
    duration: 800,
    easing: Easing.out(Easing.cubic),
    // useNativeDriver: true significa que la animacion corre en el hilo nativo
    // No cruza el JS bridge en cada frame — 60fps garantizados
    // PERO: solo funciona con transform y opacity, NO con width/height/flex
    useNativeDriver: false, // width de progress bar no soporta native driver
  }).start();
}, [progressPercent]);
```

**Expand/collapse con interpolacion de altura:**
```typescript
const expandAnim = useRef(new Animated.Value(0)).current;

const toggleExpand = useCallback(() => {
  const toValue = isExpanded ? 0 : 1;
  Animated.timing(expandAnim, {
    toValue,
    duration: 300,
    easing: Easing.inOut(Easing.ease),
    useNativeDriver: false, // height no soporta native driver
  }).start();
  setExpanded(!isExpanded);
}, [isExpanded]);

// Interpolar el valor 0-1 a una altura en pixeles
const expandableHeight = expandAnim.interpolate({
  inputRange: [0, 1],
  outputRange: [0, 120], // 0px colapsado, 120px expandido
});
```

### 5.3 Accessibilidad (bonus que te diferencia)

```typescript
<Pressable
  onPress={toggleExpand}
  accessible={true}
  accessibilityRole="button"
  accessibilityLabel={`${channelName}, ${programTitle}`}
  accessibilityHint={isExpanded ? 'Tap to collapse' : 'Tap to expand details'}
  accessibilityState={{ expanded: isExpanded }}
>
```

**Por que importa:**
- React Native mapea estos props a UIAccessibility (iOS) y AccessibilityNodeInfo (Android)
- Screen readers usan `accessibilityRole` para anunciar el tipo de elemento
- `accessibilityState.expanded` anuncia "collapsed" o "expanded" automaticamente

### 5.4 Pressable sobre TouchableOpacity

```typescript
// TouchableOpacity esta soft-deprecated desde React Native 0.63
// Pressable es el reemplazo oficial con mas control
<Pressable
  onPress={handlePress}
  style={({ pressed }) => [
    styles.card,
    pressed && styles.cardPressed, // feedback visual al presionar
  ]}
>
```

---

## 6. Practicas de seguridad en el codigo

### 6.1 TypeScript como primera linea de defensa

**`strict: true` previene categorias enteras de bugs:**
```typescript
// strictNullChecks previene acceso a propiedades de null/undefined
// Esto es un error de compilacion, no un crash en runtime
const name: string | undefined = getData();
name.toUpperCase(); // ERROR: Object is possibly 'undefined'
name?.toUpperCase(); // OK: optional chaining
```

**No `any` — nunca:**
```typescript
// any desactiva TODA verificacion de tipos para ese valor
// Es como tener una puerta blindada con una ventana abierta al lado

// MAL
const processData = (data: any) => data.value;

// BIEN — usa unknown + type guard
const processData = (data: unknown): string => {
  if (typeof data === 'object' && data !== null && 'value' in data) {
    return String((data as { value: unknown }).value);
  }
  return '';
};
```

### 6.2 No exponer datos en logs

```typescript
// ESLint rule: 'no-console': 'error'
// console.log en produccion puede exponer:
// - Tokens de autenticacion
// - Datos personales del usuario
// - Estado interno de la app (util para reverse engineering)
// - Stack traces con rutas de archivos

// Si necesitas logging en desarrollo:
if (__DEV__) {
  // __DEV__ es una variable global de React Native
  // Es false en builds de produccion — este bloque se elimina por el bundler
  console.log('Debug:', someValue);
}
// NOTA: aun asi, el lint va a marcar error. Para el ejercicio, elimina todos los logs.
```

### 6.3 Props como contrato — no confiar en datos externos

```typescript
// El hook debe manejar inputs invalidos defensivamente
// Porque los props pueden venir de una API, un state corrupto, o un error del dev
export function usePlaybackProgress({
  durationMinutes,
  elapsedMinutes,
}: PlaybackProgressInput): PlaybackProgressOutput {
  // Guard contra division por cero
  if (durationMinutes <= 0) {
    return { progressPercent: 0, timeRemainingLabel: '0m remaining' };
  }

  // Clamp: nunca retornar mas de 100% ni menos de 0%
  // Math.min y Math.max aseguran que el valor este en rango
  const progress = Math.min(Math.max((elapsedMinutes / durationMinutes) * 100, 0), 100);

  const remaining = Math.max(durationMinutes - elapsedMinutes, 0);
  // ...
}
```

### 6.4 Dependencias — minimas y auditadas

```bash
# Antes de instalar cualquier paquete:
# 1. Verificar que sea mantenido (ultimo commit < 6 meses)
# 2. Verificar que no tenga vulnerabilidades conocidas
npm audit

# Despues de instalar:
npm audit
```

**Principio para este ejercicio:**
Solo 3 dependencias de dev (eslint, husky, lint-staged) + sus plugins.
Zero dependencias de produccion adicionales a Expo.
Menor superficie de ataque = menor riesgo.

---

## 7. Testing

### 7.1 Estructura de tests

```
src/hooks/__tests__/usePlaybackProgress.test.ts
```

### 7.2 Los 4 test cases requeridos + edge cases

```typescript
describe('usePlaybackProgress', () => {
  // CASO 1: Progreso al 0%
  // Verifica el estado inicial cuando no ha transcurrido tiempo
  it('returns 0% progress when elapsedMinutes is 0', () => {
    const result = usePlaybackProgress({ durationMinutes: 90, elapsedMinutes: 0 });
    expect(result.progressPercent).toBe(0);
    expect(result.timeRemainingLabel).toBe('1h 30m remaining');
  });

  // CASO 2: Progreso al 100%
  // Verifica que no supere 100% cuando elapsed >= duration
  it('returns 100% progress when elapsed equals duration', () => {
    const result = usePlaybackProgress({ durationMinutes: 60, elapsedMinutes: 60 });
    expect(result.progressPercent).toBe(100);
    expect(result.timeRemainingLabel).toBe('0m remaining');
  });

  // CASO 3: Mas de 60 minutos restantes
  // Verifica formato con horas + minutos
  it('formats time with hours when remaining > 60 minutes', () => {
    const result = usePlaybackProgress({ durationMinutes: 120, elapsedMinutes: 10 });
    expect(result.timeRemainingLabel).toBe('1h 50m remaining');
  });

  // CASO 4: Menos de 60 minutos restantes
  // Verifica formato solo con minutos (sin horas)
  it('formats time without hours when remaining < 60 minutes', () => {
    const result = usePlaybackProgress({ durationMinutes: 45, elapsedMinutes: 10 });
    expect(result.timeRemainingLabel).toBe('35m remaining');
  });

  // EDGE CASE: duracion 0 (no requerido pero demuestra solidez)
  it('handles zero duration without dividing by zero', () => {
    const result = usePlaybackProgress({ durationMinutes: 0, elapsedMinutes: 0 });
    expect(result.progressPercent).toBe(0);
  });

  // EDGE CASE: elapsed mayor que duration
  it('clamps progress to 100 when elapsed exceeds duration', () => {
    const result = usePlaybackProgress({ durationMinutes: 30, elapsedMinutes: 45 });
    expect(result.progressPercent).toBe(100);
    expect(result.timeRemainingLabel).toBe('0m remaining');
  });
});
```

### 7.3 Por que testeamos el hook como funcion pura

El hook `usePlaybackProgress` no usa `useState`, `useEffect`, ni ningun hook de React.
Es una funcion pura: mismos inputs → mismos outputs.

Esto significa que podemos testearlo como cualquier funcion de JavaScript — sin
`renderHook`, sin `@testing-library/react-hooks`, sin setup de providers.

Si en algun punto necesitas agregar `useMemo` dentro del hook para optimizar,
entonces SI necesitarias `renderHook`. Pero para este scope, funcion pura es suficiente.

---

## 8. CI/CD con GitHub Actions

### 8.1 Archivo `.github/workflows/ci.yml`

```yaml
name: CI

# Se ejecuta en push al feature branch Y en PRs a main
on:
  push:
    branches: [feature/video-player-card]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      # 1. Checkout del codigo
      - name: Checkout repository
        uses: actions/checkout@v4

      # 2. Setup Node.js con cache de npm
      # Cache acelera npm ci de ~30s a ~5s en runs subsecuentes
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      # 3. Instalacion limpia (ci = clean install)
      # npm ci es mas rapido que npm install y respeta el lockfile exacto
      # Garantiza que CI usa las mismas versiones que desarrollo local
      - name: Install dependencies
        run: npm ci

      # 4. Type checking — falla si hay errores de TypeScript
      # --noEmit porque no necesitamos archivos .js, solo verificar tipos
      - name: TypeScript type check
        run: npm run type-check

      # 5. Tests — falla si algun test no pasa
      - name: Run tests
        run: npm test

      # 6. Lint — falla si hay errores de ESLint
      - name: Run ESLint
        run: npm run lint
```

### 8.2 Badge en el README

```markdown
![CI](https://github.com/krugalan/rn-video-card-krugalan/actions/workflows/ci.yml/badge.svg?branch=feature/video-player-card)
```

Esto muestra un badge verde o rojo en el README que refleja el ultimo run del pipeline.

---

## 9. Pre-commit hooks con Husky

### 9.1 Setup

```bash
# Husky se configura automaticamente con el script "prepare"
npm run prepare

# Crear el hook de pre-commit
echo 'npx lint-staged' > .husky/pre-commit
```

### 9.2 Configuracion de lint-staged en package.json

```json
{
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "bash -c 'tsc --noEmit'"
    ]
  }
}
```

**Que hace:**
1. Al hacer `git commit`, Husky intercepta antes de crear el commit
2. `lint-staged` filtra solo los archivos `.ts`/`.tsx` que estan staged
3. Ejecuta ESLint con autofix en esos archivos
4. Ejecuta type-check en todo el proyecto (TypeScript necesita contexto completo)
5. Si alguno falla, el commit se bloquea con output del error

**Por que NO incluir tests en pre-commit:**
- Los tests pueden tardar varios segundos
- Un pre-commit lento desincentiva commits frecuentes
- Los tests corren en CI — es el lugar apropiado para esa validacion

---

## 10. Orden de implementacion — commits incrementales

Cada paso es un commit independiente. El historial de git debe contar la historia
del desarrollo de manera logica.

### Commit 1 — Scaffold
```
chore: initialize expo project with blank typescript template
```
- `npx create-expo-app`
- Crear estructura de directorios `src/`
- Configurar `tsconfig.json` con strict mode

### Commit 2 — Tipos
```
feat: add TypeScript interfaces for VideoPlayerCard props
```
- `src/types/index.ts` con `VideoPlayerCardProps` y tipos del hook
- Define el contrato antes de la implementacion

### Commit 3 — Hook + Tests
```
feat: add usePlaybackProgress hook with unit tests
```
- `src/hooks/usePlaybackProgress.ts`
- `src/hooks/__tests__/usePlaybackProgress.test.ts`
- Verificar que `npm test` pasa

### Commit 4 — Componente estatico
```
feat: add VideoPlayerCard component with static layout
```
- `src/components/VideoPlayerCard/VideoPlayerCard.tsx`
- `src/components/VideoPlayerCard/styles.ts`
- `src/components/VideoPlayerCard/index.tsx`
- Sin animaciones todavia — layout correcto con props

### Commit 5 — Animaciones
```
feat: add progress bar and expand/collapse animations
```
- Animated.timing para progress bar al montar
- Animated.timing para expand/collapse al tap
- `useRef` + `useCallback` pattern

### Commit 6 — App demo
```
feat: add demo App.tsx with sample data
```
- `App.tsx` renderiza el componente con datos de ejemplo
- Verificar visualmente que todo funciona

### Commit 7 — ESLint
```
chore: configure eslint with typescript and react-native rules
```
- `.eslintrc.js` completo
- `npm run lint` pasa con 0 errores
- Corregir cualquier error que el lint detecte en codigo existente

### Commit 8 — CI/CD
```
ci: add github actions workflow for type-check, tests, and lint
```
- `.github/workflows/ci.yml`
- Push y verificar que el pipeline pasa en verde

### Commit 9 — Pre-commit hooks
```
chore: add husky pre-commit hooks with lint-staged
```
- `.husky/pre-commit`
- Configuracion `lint-staged` en package.json

### Commit 10 — JSDoc y documentacion
```
docs: add JSDoc comments and comprehensive README
```
- JSDoc en componente y hook (requerido por el ejercicio)
- README completo con todas las secciones
- Badge de CI

---

## 11. Checklist del PR

El PR description debe incluir un checklist verificable:

```markdown
## Requirements Checklist

### Component
- [ ] `VideoPlayerCard` accepts all props via `VideoPlayerCardProps` interface
- [ ] Displays: channel name, program title, description (2 lines + ellipsis),
      progress bar, time remaining, channel logo placeholder
- [ ] Progress bar animates from 0% to position on mount
- [ ] Tap toggles collapsed/expanded with animation
- [ ] Collapsed: channel name + title + progress bar
- [ ] Expanded: all fields
- [ ] No hardcoded content — all data via props

### Hook
- [ ] `usePlaybackProgress` returns `progressPercent` and `timeRemainingLabel`
- [ ] At least 4 unit test cases (0%, 100%, >60m, <60m)
- [ ] Tests pass with `npm test`

### CI/CD
- [ ] GitHub Actions runs on push to feature branch and PR to main
- [ ] Pipeline: install → type-check → test → lint
- [ ] Pipeline fails on test failures or type errors
- [ ] Status badge in README

### Code Quality
- [ ] TypeScript — no `any` types
- [ ] ESLint configured — `npm run lint` passes with 0 errors
- [ ] JSDoc comments on component and hook
- [ ] No `console.log` in submitted code
- [ ] Conventional commits in git history
```

---

## 12. Resumen de decisiones tecnicas

| Aspecto | Decision | Alternativa rechazada | Justificacion |
|---|---|---|---|
| Framework | Expo Managed SDK 52 | Bare RN / CLI | Zero config nativa, incluye New Arch, cumple requisitos |
| Animaciones | `Animated` nativo | `react-native-reanimated` | 2 animaciones simples no justifican ~200KB extra |
| Estilos | `StyleSheet.create` | styled-components / NativeWind | Idiomatico RN, zero deps, optimizado por el bridge |
| Testing | Jest puro | @testing-library/react-hooks | Hook es funcion pura — no necesita renderizar |
| Tap handler | `Pressable` | `TouchableOpacity` | `Pressable` es el reemplazo oficial desde RN 0.63 |
| Lint | ESLint + TS plugin | Solo tsc | ESLint cubre reglas que tsc no (console, hooks, RN) |
| Pre-commit | Husky + lint-staged | Solo CI | Feedback inmediato al dev — no esperar push para ver errores |
| Commits | Conventional Commits | Free-form | Historial legible, parseable por herramientas, requerido por ejercicio |
