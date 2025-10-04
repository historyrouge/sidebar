"use strict";
"use client";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.useTheme = void 0;
exports.ThemeProvider = ThemeProvider;
const jsx_runtime_1 = require("react/jsx-runtime");
const React = __importStar(require("react"));
const next_themes_1 = require("next-themes");
const ACCENT_COLOR_KEY = 'accent-color';
const accentColors = {
    default: {
        light: '221 83% 53%',
        dark: '217 91% 65%',
    },
    rose: {
        light: '347 77% 50%',
        dark: '347 87% 60%',
    },
    orange: {
        light: '25 95% 53%',
        dark: '25 95% 58%',
    },
    green: {
        light: '142 71% 40%',
        dark: '142 71% 50%',
    },
    gray: {
        light: '0 0% 50%',
        dark: '0 0% 80%',
    }
};
function ThemeProvider({ children, ...props }) {
    const [accentColor, setAccentColor] = React.useState('gray');
    React.useEffect(() => {
        const storedAccent = localStorage.getItem(ACCENT_COLOR_KEY);
        if (storedAccent && accentColors[storedAccent]) {
            setAccentColor(storedAccent);
        }
    }, []);
    const value = {
        ...props,
        accentColor: accentColor,
        setAccentColor: (color) => {
            if (accentColors[color]) {
                setAccentColor(color);
            }
        },
    };
    return ((0, jsx_runtime_1.jsx)(next_themes_1.ThemeProvider, { ...props, children: (0, jsx_runtime_1.jsxs)(ThemeContext.Provider, { value: value, children: [(0, jsx_runtime_1.jsx)(AccentColorUpdater, { accentColor: accentColor }), children] }) }));
}
function AccentColorUpdater({ accentColor }) {
    const { resolvedTheme } = (0, next_themes_1.useTheme)();
    React.useEffect(() => {
        const root = document.documentElement;
        const mode = resolvedTheme === 'dark' ? 'dark' : 'light';
        const color = accentColors[accentColor]?.[mode] || accentColors.default[mode];
        root.style.setProperty('--primary', color);
        localStorage.setItem(ACCENT_COLOR_KEY, accentColor);
    }, [accentColor, resolvedTheme]);
    return null;
}
// Custom context to pass down accent color functions
const ThemeContext = React.createContext(undefined);
// Custom hook to use the extended theme context
const useTheme = () => {
    const context = React.useContext(ThemeContext);
    const nextThemesContext = (0, next_themes_1.useTheme)();
    if (context === undefined) {
        // Fallback for when not inside our custom provider
        return { ...nextThemesContext, accentColor: 'default', setAccentColor: () => { } };
    }
    return { ...nextThemesContext, ...context };
};
exports.useTheme = useTheme;
