import techGuru from './tech-guru.json';
import philosopher from './philosopher.json';
import optimist from './optimist.json';
import skeptic from './skeptic.json';
import storyteller from './storyteller.json';

export interface BotConfig {
  id: string;
  name: string;
  avatar: string;
  personality: string;
  speaking_style: string;
  expertise: string[];
  trigger_keywords: string[];
}

export const bots: BotConfig[] = [
  techGuru,
  philosopher,
  optimist,
  skeptic,
  storyteller,
];

export const botMap: Record<string, BotConfig> = Object.fromEntries(
  bots.map((bot) => [bot.id, bot])
);

export { techGuru, philosopher, optimist, skeptic, storyteller };
