import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: '#f9fafb',
				foreground: 'hsl(var(--foreground))',
				primary: '#2563eb',
				secondary: '#f59e42',
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: '#10b981',
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				surface: '#ffffff',
				text: '#1e293b',
				// DemoBidPro custom colors (adjusted to match construction cloud graphic)
				"bidgenius": {
					50: "#f0f7ff",
					100: "#e0effe",
					200: "#bae0fd",
					300: "#7cc8fb",
					400: "#36aaf7", 
					500: "#0e89d0", // Adjusted mid blue to match graphic
					600: "#0074b5", // Adjusted darker blue to match graphic
					700: "#005a90",
					800: "#004c7e", // Adjusted deep blue to match graphic
					900: "#003e68",
					950: "#002a45",
				},
				"bidgenius-accent": {
					50: "#fff8ed",
					100: "#ffefd4",
					200: "#ffdba8",
					300: "#ffc070",
					400: "#ff9b37",
					500: "#ff7d10", // Orange from image
					600: "#ff6400", // Brighter orange from image
					700: "#cc4402",
					800: "#9f360b",
					900: "#7c2e0d",
					950: "#431505",
				},
			},
			borderRadius: {
				lg: '1rem',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)',
				xl: '1.5rem',
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out'
			},
			fontFamily: {
				sans: ['Inter', 'sans-serif'],
			},
		}
	},
	plugins: [
		require('@tailwindcss/typography'),
		require('tailwindcss-animate'),
	],
} satisfies Config;
