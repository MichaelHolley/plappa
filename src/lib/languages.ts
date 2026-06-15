export interface Language {
	value: string;
	label: string;
	flag: string;
}

export const LANGUAGES: Language[] = [
	{ value: 'Spanish', label: 'Spanish', flag: '🇪🇸' },
	{ value: 'French', label: 'French', flag: '🇫🇷' },
	{ value: 'German', label: 'German', flag: '🇩🇪' },
	{ value: 'Italian', label: 'Italian', flag: '🇮🇹' },
	{ value: 'Portuguese', label: 'Portuguese', flag: '🇵🇹' }
];

export function getLanguageFlag(lang: string): string {
	return LANGUAGES.find((l) => l.value.toLowerCase() === lang.toLowerCase())?.flag ?? '🌐';
}
