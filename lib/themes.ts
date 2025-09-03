export interface Theme {
  id: string
  name: string
  category: 'anime' | 'os' | 'gaming' | 'nature' | 'minimalist' | 'retro'
  preview: string
  background: string
  description: string
  accent?: string
  textColor?: string
}

export const THEMES: Theme[] = [
  // Anime Themes
  {
    id: 'dbz-orange',
    name: 'Dragon Ball Z',
    category: 'anime',
    preview: '🐉',
    background: 'linear-gradient(135deg, #ff6b35 0%, #f7931e 25%, #ff4500 50%, #ff8c00 75%, #ffa500 100%)',
    description: 'Inspired by Goku\'s orange gi and Dragon Ball energy',
    accent: '#ff6b35',
    textColor: '#2c1810'
  },
  {
    id: 'naruto-leaf',
    name: 'Hidden Leaf Village',
    category: 'anime',
    preview: '🍃',
    background: 'linear-gradient(135deg, #228b22 0%, #32cd32 25%, #90ee90 50%, #98fb98 75%, #f0fff0 100%)',
    description: 'Green tones inspired by Konoha village',
    accent: '#228b22',
    textColor: '#0f2e0f'
  },
  {
    id: 'onepiece-ocean',
    name: 'Grand Line Ocean',
    category: 'anime',
    preview: '⚓',
    background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 25%, #4682b4 50%, #87ceeb 75%, #e0f6ff 100%)',
    description: 'Ocean blues inspired by One Piece adventures',
    accent: '#1e3c72',
    textColor: '#0f1a36'
  },
  {
    id: 'aot-survey',
    name: 'Survey Corps',
    category: 'anime',
    preview: '⚔️',
    background: 'linear-gradient(135deg, #2f4f4f 0%, #696969 25%, #a0a0a0 50%, #d3d3d3 75%, #f5f5f5 100%)',
    description: 'Military grays inspired by Attack on Titan',
    accent: '#2f4f4f',
    textColor: '#1a1a1a'
  },
  {
    id: 'ghibli-forest',
    name: 'Studio Ghibli Forest',
    category: 'anime',
    preview: '🌲',
    background: 'linear-gradient(135deg, #2d5a27 0%, #3d7c47 25%, #4a9d4f 50%, #7bc967 75%, #a8e6a3 100%)',
    description: 'Magical forest greens from Ghibli films',
    accent: '#2d5a27',
    textColor: '#1a301a'
  },

  // OS Inspired Themes
  {
    id: 'windows-xp',
    name: 'Windows XP Bliss',
    category: 'os',
    preview: '🌾',
    background: 'linear-gradient(135deg, #4a90e2 0%, #7bb3f0 25%, #87ceeb 50%, #98fb98 75%, #90ee90 100%)',
    description: 'Classic Windows XP default wallpaper vibes',
    accent: '#4a90e2',
    textColor: '#2c4a70'
  },
  {
    id: 'macos-bigsur',
    name: 'macOS Big Sur',
    category: 'os',
    preview: '🏔️',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #f5576c 75%, #4facfe 100%)',
    description: 'Modern macOS gradient inspired design',
    accent: '#667eea',
    textColor: '#2d3748'
  },
  {
    id: 'ubuntu-orange',
    name: 'Ubuntu',
    category: 'os',
    preview: '🐧',
    background: 'linear-gradient(135deg, #e95420 0%, #ff6b35 25%, #f7931e 50%, #ffa500 75%, #77216f 100%)',
    description: 'Ubuntu\'s signature orange and purple',
    accent: '#e95420',
    textColor: '#2c1810'
  },
  {
    id: 'windows95-teal',
    name: 'Windows 95 Retro',
    category: 'os',
    preview: '💾',
    background: 'linear-gradient(135deg, #008b8b 0%, #20b2aa 25%, #48d1cc 50%, #afeeee 75%, #e0ffff 100%)',
    description: 'Nostalgic Windows 95 teal vibes',
    accent: '#008b8b',
    textColor: '#004444'
  },

  // Gaming Themes
  {
    id: 'minecraft-grass',
    name: 'Minecraft World',
    category: 'gaming',
    preview: '⛏️',
    background: 'linear-gradient(135deg, #228b22 0%, #32cd32 25%, #7cfc00 50%, #adff2f 75%, #f0fff0 100%)',
    description: 'Blocky green world of Minecraft',
    accent: '#228b22',
    textColor: '#0f2e0f'
  },
  {
    id: 'cyberpunk-neon',
    name: 'Cyberpunk Night',
    category: 'gaming',
    preview: '🌃',
    background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 25%, #16213e 50%, #e94560 75%, #f39c12 100%)',
    description: 'Neon-lit cyberpunk cityscape',
    accent: '#e94560',
    textColor: '#f8f8f2'
  },
  {
    id: 'vaporwave-retro',
    name: 'Vaporwave',
    category: 'gaming',
    preview: '🌴',
    background: 'linear-gradient(135deg, #ff00ff 0%, #00ffff 25%, #ff1493 50%, #9400d3 75%, #4b0082 100%)',
    description: 'Retro 80s vaporwave aesthetic',
    accent: '#ff00ff',
    textColor: '#2a0033'
  },

  // Nature Themes
  {
    id: 'ocean-waves',
    name: 'Ocean Waves',
    category: 'nature',
    preview: '🌊',
    background: 'linear-gradient(135deg, #0077be 0%, #00a8cc 25%, #87ceeb 50%, #e0f6ff 75%, #f0f8ff 100%)',
    description: 'Calming ocean blue gradients',
    accent: '#0077be',
    textColor: '#003d5c'
  },
  {
    id: 'sunset-mountain',
    name: 'Mountain Sunset',
    category: 'nature',
    preview: '🏔️',
    background: 'linear-gradient(135deg, #ff4500 0%, #ff6347 25%, #ffa500 50%, #ffd700 75%, #fffaf0 100%)',
    description: 'Warm sunset over mountain peaks',
    accent: '#ff4500',
    textColor: '#2c1810'
  },
  {
    id: 'galaxy-space',
    name: 'Galaxy Space',
    category: 'nature',
    preview: '🌌',
    background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 25%, #16213e 50%, #4a00e0 75%, #8e2de2 100%)',
    description: 'Deep space and cosmic colors',
    accent: '#4a00e0',
    textColor: '#e6e6fa'
  },

  // Minimalist Themes
  {
    id: 'clean-white',
    name: 'Clean White',
    category: 'minimalist',
    preview: '⚪',
    background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 25%, #e9ecef 50%, #dee2e6 75%, #ced4da 100%)',
    description: 'Clean, minimal white design',
    accent: '#6c757d',
    textColor: '#212529'
  },
  {
    id: 'dark-mode',
    name: 'Dark Mode',
    category: 'minimalist',
    preview: '⚫',
    background: 'linear-gradient(135deg, #121212 0%, #1e1e1e 25%, #2d2d2d 50%, #3c3c3c 75%, #4a4a4a 100%)',
    description: 'Sleek dark theme for night owls',
    accent: '#bb86fc',
    textColor: '#ffffff'
  },
  {
    id: 'pastel-rainbow',
    name: 'Pastel Rainbow',
    category: 'minimalist',
    preview: '🌈',
    background: 'linear-gradient(135deg, #ffeaa7 0%, #fab1a0 25%, #fd79a8 50%, #a29bfe 75%, #74b9ff 100%)',
    description: 'Soft pastel rainbow gradient',
    accent: '#a29bfe',
    textColor: '#2d3436'
  }
]

export const getThemeById = (themeId: string): Theme => {
  return THEMES.find(theme => theme.id === themeId) || THEMES[0]
}

export const getThemesByCategory = (category: Theme['category']): Theme[] => {
  return THEMES.filter(theme => theme.category === category)
}

export const getDefaultTheme = (): Theme => {
  return THEMES.find(theme => theme.id === 'clean-white') || THEMES[0]
}