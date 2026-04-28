/* Theme + font preferences, ported from
 * ~/webapps/ichrisbirch/frontend/src/composables/useTheme.ts
 * Vue reactivity replaced with localStorage; theme/font data lives in
 * global.css as [data-theme="..."] / [data-font="..."] rules so apply
 * is a single attribute toggle (FOUC-free via inline init script). */

export interface ThemeDefinition {
	id: string;
	name: string;
	type: 'color' | 'named';
	swatch: string;
}

export interface FontDefinition {
	id: string;
	name: string;
	family: string;
	category: 'monospace' | 'sans-serif';
	source: 'google' | 'self-hosted';
}

export const STORAGE_KEY_THEME = 'chris-birch:theme';
export const STORAGE_KEY_FONT = 'chris-birch:font';
export const STORAGE_KEY_ACCENT_HUE = 'chris-birch:accent-hue';

export const themes: ThemeDefinition[] = [
	{ id: 'turquoise', name: 'Turquoise', type: 'color', swatch: '#00363f' },
	{ id: 'blue', name: 'Blue', type: 'color', swatch: '#17263e' },
	{ id: 'green', name: 'Green', type: 'color', swatch: '#0e2d1b' },
	{ id: 'orange', name: 'Orange', type: 'color', swatch: '#372009' },
	{ id: 'red', name: 'Red', type: 'color', swatch: '#3b1b18' },
	{ id: 'purple', name: 'Purple', type: 'color', swatch: '#2b1f3a' },
	{ id: 'yellow', name: 'Yellow', type: 'color', swatch: '#2a2705' },
	{ id: 'pink', name: 'Pink', type: 'color', swatch: '#381b29' },
	{ id: 'charcoal-ember', name: 'Charcoal Ember', type: 'named', swatch: '#1d1f21' },
	{ id: 'kanagawa', name: 'Kanagawa', type: 'named', swatch: '#1f1f28' },
	{ id: 'rose-pine', name: 'Rose Pine', type: 'named', swatch: '#191724' },
	{ id: 'gruvbox', name: 'Gruvbox', type: 'named', swatch: '#1d2021' },
	{ id: 'nord', name: 'Nordic', type: 'named', swatch: '#242933' },
	{ id: 'nightfox', name: 'Nightfox', type: 'named', swatch: '#192330' },
	{ id: 'everforest', name: 'Everforest', type: 'named', swatch: '#1e2326' },
	{ id: 'solarized-osaka', name: 'Solarized Osaka', type: 'named', swatch: '#001419' },
	{ id: 'terafox', name: 'Terafox', type: 'named', swatch: '#152528' },
	{ id: 'oceanic-next', name: 'Oceanic Next', type: 'named', swatch: '#162c35' },
	{ id: 'flexoki', name: 'Flexoki Moon', type: 'named', swatch: '#100f0f' },
	{ id: 'retrobox', name: 'Retrobox', type: 'named', swatch: '#1c1c1c' },
];

export const fonts: FontDefinition[] = [
	{
		id: 'ubuntu-mono',
		name: 'Ubuntu Mono',
		family: '"Ubuntu Mono", monospace',
		category: 'monospace',
		source: 'google',
	},
	{
		id: 'fira-code',
		name: 'Fira Code',
		family: '"Fira Code", monospace',
		category: 'monospace',
		source: 'google',
	},
	{
		id: 'jetbrains-mono',
		name: 'JetBrains Mono',
		family: '"JetBrains Mono", monospace',
		category: 'monospace',
		source: 'google',
	},
	{
		id: 'roboto-mono',
		name: 'Roboto Mono',
		family: '"Roboto Mono", monospace',
		category: 'monospace',
		source: 'google',
	},
	{ id: 'inter', name: 'Inter', family: '"Inter", sans-serif', category: 'sans-serif', source: 'google' },
	{
		id: 'space-grotesk',
		name: 'Space Grotesk',
		family: '"Space Grotesk", sans-serif',
		category: 'sans-serif',
		source: 'google',
	},
	{ id: 'hack', name: 'Hack', family: '"Hack", monospace', category: 'monospace', source: 'self-hosted' },
	{
		id: 'commit-mono',
		name: 'Commit Mono',
		family: '"CommitMono", monospace',
		category: 'monospace',
		source: 'self-hosted',
	},
	{
		id: 'comic-mono',
		name: 'Comic Mono',
		family: '"Comic Mono", monospace',
		category: 'monospace',
		source: 'self-hosted',
	},
	{
		id: 'iosevka',
		name: 'Iosevka',
		family: '"Iosevka", monospace',
		category: 'monospace',
		source: 'self-hosted',
	},
	{
		id: 'meslo',
		name: 'Meslo LG M',
		family: '"Meslo LG M", monospace',
		category: 'monospace',
		source: 'self-hosted',
	},
	{
		id: 'monaspace-neon',
		name: 'Monaspace Neon',
		family: '"Monaspace Neon", monospace',
		category: 'monospace',
		source: 'self-hosted',
	},
	{
		id: 'serious-shanns',
		name: 'Serious Shanns',
		family: '"Serious Shanns", monospace',
		category: 'monospace',
		source: 'self-hosted',
	},
	{
		id: 'comic-shanns',
		name: 'Comic Shanns',
		family: '"Comic Shanns", monospace',
		category: 'monospace',
		source: 'self-hosted',
	},
];

const googleFontUrls: Record<string, string> = {
	'ubuntu-mono': 'https://fonts.googleapis.com/css2?family=Ubuntu+Mono:wght@400;700&display=swap',
	'fira-code': 'https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;700&display=swap',
	'jetbrains-mono': 'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&display=swap',
	'roboto-mono': 'https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@400;700&display=swap',
	inter: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap',
	'space-grotesk': 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;700&display=swap',
};

const loadedGoogleFonts = new Set<string>();

function loadGoogleFont(fontId: string) {
	if (loadedGoogleFonts.has(fontId)) return;
	const url = googleFontUrls[fontId];
	if (!url) return;
	const link = document.createElement('link');
	link.rel = 'stylesheet';
	link.href = url;
	document.head.appendChild(link);
	loadedGoogleFonts.add(fontId);
}

export function applyTheme(themeId: string) {
	const theme = themes.find((t) => t.id === themeId);
	if (!theme) return;
	document.documentElement.setAttribute('data-theme', themeId);
}

export function applyFont(fontId: string) {
	const font = fonts.find((f) => f.id === fontId);
	if (!font) return;
	if (font.source === 'google') loadGoogleFont(font.id);
	document.documentElement.setAttribute('data-font', fontId);
}

export function applyAccentHue(hue: number) {
	document.documentElement.style.setProperty('--accent-hue', String(hue));
}

export function setTheme(themeId: string) {
	localStorage.setItem(STORAGE_KEY_THEME, themeId);
	applyTheme(themeId);
}

export function setFont(fontId: string) {
	localStorage.setItem(STORAGE_KEY_FONT, fontId);
	applyFont(fontId);
}

export function setAccentHue(hue: number) {
	localStorage.setItem(STORAGE_KEY_ACCENT_HUE, String(hue));
	applyAccentHue(hue);
}

export function getStoredTheme(): string | null {
	return localStorage.getItem(STORAGE_KEY_THEME);
}

export function getStoredFont(): string | null {
	return localStorage.getItem(STORAGE_KEY_FONT);
}

export function getStoredAccentHue(): number | null {
	const v = localStorage.getItem(STORAGE_KEY_ACCENT_HUE);
	if (v === null) return null;
	const n = Number(v);
	return Number.isFinite(n) ? n : null;
}

/* Loads any Google Font that the inline init script set as the
 * active --ff-base. The init script can only set the data-font
 * attribute synchronously; the actual stylesheet has to be appended
 * via JS, which only runs after hydration. Safe to call on every
 * page load — loadGoogleFont dedupes. */
export function hydrateGoogleFontIfNeeded() {
	const fontId = getStoredFont();
	if (!fontId) return;
	const font = fonts.find((f) => f.id === fontId);
	if (font?.source === 'google') loadGoogleFont(font.id);
}

export function initPreferencesInteractive() {
	hydrateGoogleFontIfNeeded();
	window.addEventListener('storage', (e) => {
		if (e.key === STORAGE_KEY_THEME && e.newValue) applyTheme(e.newValue);
		if (e.key === STORAGE_KEY_FONT && e.newValue) applyFont(e.newValue);
		if (e.key === STORAGE_KEY_ACCENT_HUE && e.newValue) {
			const n = Number(e.newValue);
			if (Number.isFinite(n)) applyAccentHue(n);
		}
	});
}
