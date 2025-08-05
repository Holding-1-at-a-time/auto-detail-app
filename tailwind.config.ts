// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./pages/**/*.{ts,tsx}",
        "./components/**/*.{ts,tsx}",
        "./app/**/*.{ts,tsx}",
        "./src/**/*.{ts,tsx}",
    ],
    theme: {
        // All theme extensions are now in globals.css via @theme
        // This keeps the config file clean and focused on content paths.
    },
    plugins: [],
};

export default config;