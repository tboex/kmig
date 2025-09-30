import { createContext, useContext, useState } from 'react';

type Language = 'en' | 'ko';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

type TranslationDict = {
  [key: string]: string;
};

const translations: Record<Language, TranslationDict> = {
  en: {
    // Navigation
    'nav.settings': 'Settings',
    'nav.home': 'Home',

    // Landing Page
    'landing.title': 'Korean Word Chain Game',
    'landing.username.placeholder': 'Enter your username',
    'landing.solo': 'Solo Game',
    'landing.multiplayer': 'Multiplayer Game',

    // Setup Page
    'setup.title': 'Game Setup',
    'setup.allowVerbs': 'Allow Verbs',
    'setup.guessCount': 'Guess Count',
    'setup.timer': 'Timer (seconds)',
    'setup.start': 'Start Game',
    'setup.back': 'Back',

    // Game Page
    'game.thinking': "I'm thinking...",
    'game.submit': 'Submit',
    'game.placeholder': 'Enter a word…',
    'game.victory': 'Victory!',
    'game.defeat': 'Defeat!',
    'game.playAgain': 'Play Again',
    'game.close': 'Close',
    'game.yourTurn': "It's your turn!",

    // Bot Failure Phrases
    'bot.failure.first.1': "Hmm... I can't think of a word",
    'bot.failure.first.2': "Ah... I don't know",
    'bot.failure.first.3': "I can't think of anything",
    'bot.failure.second.1': "Stuck again...",
    'bot.failure.second.2': "This is difficult",
    'bot.failure.second.3': "Hmm... I don't know again",
    'bot.failure.final.1': "This is my last chance...",
    'bot.failure.final.2': "This is really difficult...",
    'bot.failure.final.3': "This is really dangerous now...",

    // Settings
    'settings.title': 'Settings',
    'settings.bot.title': 'Bot Behavior',
    'settings.bot.difficulty': 'Bot Difficulty',
    'settings.bot.difficulty.desc': 'Controls how often the bot makes mistakes',
    'settings.bot.delay': 'Artificial Bot Delay',
    'settings.bot.delay.desc': 'Add a realistic thinking delay to bot responses',
    'settings.bot.delay.duration': 'Delay Duration (ms)',
    'settings.difficulty.easy': 'Easy',
    'settings.difficulty.medium': 'Medium',
    'settings.difficulty.hard': 'Hard',
    'settings.difficulty.easy.chance': '30% fail chance',
    'settings.difficulty.medium.chance': '15% fail chance',
    'settings.difficulty.hard.chance': '5% fail chance',
    'settings.language': 'English',

    // Player Status
    'player.left': 'left',
    'player.players': 'Players',
    'player.possessive_turn': '\'s turn',

    // Gameplay
    'settings.gameplay.title': 'Gameplay Settings',
    'settings.gameplay.coming-soon': 'Coming soon...',
  },
  ko: {
    // Navigation
    'nav.settings': '설정',
    'nav.home': '홈',

    // Landing Page
    'landing.title': '한국어 단어 게임',
    'landing.username.placeholder': '사용자 이름을 입력하세요',
    'landing.solo': '솔로 게임',
    'landing.multiplayer': '멀티플레이어 게임',

    // Setup Page
    'setup.title': '게임 설정',
    'setup.allowVerbs': '동사 허용',
    'setup.guessCount': '추측 횟수',
    'setup.timer': '타이머 (초)',
    'setup.start': '게임 시작',
    'setup.back': '뒤로',

    // Game Page
    'game.thinking': '지금 생각하고 있어...',
    'game.submit': '제출',
    'game.placeholder': '단어를 입력하세요…',
    'game.victory': '승리!',
    'game.defeat': '패배!',
    'game.playAgain': '다시 하기',
    'game.close': '닫기',
    'game.yourTurn': '당신의 차례입니다!',

    // Bot Failure Phrases
    'bot.failure.first.1': '음음... 단어를 생각할 수 없었어',
    'bot.failure.first.2': '아... 모르겠어',
    'bot.failure.first.3': '이번엔 패스할게',
    'bot.failure.second.1': '또 막혔네...',
    'bot.failure.second.2': '이번에도 어렵다',
    'bot.failure.second.3': '음... 또 모르겠어',
    'bot.failure.final.1': '마지막 기회인데...',
    'bot.failure.final.2': '정말 어렵다...',
    'bot.failure.final.3': '이제 정말 위험해...',

    // Settings
    'settings.title': '설정',
    'settings.bot.title': '봇 행동',
    'settings.bot.difficulty': '봇 난이도',
    'settings.bot.difficulty.desc': '봇이 실수하는 빈도를 조절합니다',
    'settings.bot.delay': '인공 봇 딜레이',
    'settings.bot.delay.desc': '봇 응답에 현실적인 생각 시간을 추가합니다',
    'settings.bot.delay.duration': '지연 시간 (ms)',
    'settings.difficulty.easy': '쉬움',
    'settings.difficulty.medium': '보통',
    'settings.difficulty.hard': '어려움',
    'settings.difficulty.easy.chance': '30% 실패 확률',
    'settings.difficulty.medium.chance': '15% 실패 확률',
    'settings.difficulty.hard.chance': '5% 실패 확률',
    'settings.language': '한국어',

    // Player Status
    'player.left': '남음',
    'player.players': '플레이어',
    'player.possessive_turn': '의 차례',

    // Gameplay
    'settings.gameplay.title': '게임 플레이 설정',
    'settings.gameplay.coming-soon': '곧 출시 예정...',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {

    const saved = localStorage.getItem('kmig_language') as Language;
    if (saved && (saved === 'en' || saved === 'ko')) {
      return saved;
    }


    const browserLang = navigator.language.toLowerCase();
    if (browserLang.startsWith('ko')) {
      return 'ko';
    }

    return 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('kmig_language', lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
};
