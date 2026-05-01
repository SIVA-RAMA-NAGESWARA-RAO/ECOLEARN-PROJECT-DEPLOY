export const TOPIC_COLORS = { energy:'tag-amber', waste:'tag-green', diet:'tag-teal', water:'tag-blue', biodiversity:'tag-green', cities:'tag-gray', other:'tag-gray' };
export const TOPIC_ICONS = { energy:'⚡', waste:'♻️', diet:'🌱', water:'💧', biodiversity:'🌳', cities:'🏙️', other:'📂' };
export const LEVEL_COLORS = { Beginner:'tag-green', Intermediate:'tag-amber', Advanced:'tag-coral' };
export const TOPICS = ['energy','waste','diet','water','biodiversity','cities','other'];
export const LEVELS = ['Beginner','Intermediate','Advanced'];

export function fmt(n) { return Number(n || 0).toLocaleString(); }

export function ago(d) {
  if (!d) return '';
  const s = (Date.now() - new Date(d)) / 1000;
  if (s < 60) return 'just now';
  if (s < 3600) return Math.floor(s / 60) + 'm ago';
  if (s < 86400) return Math.floor(s / 3600) + 'h ago';
  return Math.floor(s / 86400) + 'd ago';
}
