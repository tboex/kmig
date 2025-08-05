import { useSettings } from '../contexts/SettingsContext';
import { useLanguage } from '../contexts/LanguageContext';

export default function Settings() {
  const { botDelay, setBotDelay, botDelayMs, setBotDelayMs, botDifficulty, setBotDifficulty } = useSettings();
  const { t } = useLanguage();

  return (
    <main className="flex-1 flex flex-col bg-theme-bg items-center justify-start p-8 overflow-hidden">
      <div className="w-full max-w-2xl flex flex-col"
      style={{ height: 'calc(100vh - 200px)'}}>
        <h1 className="text-3xl font-bold text-theme-text mb-8 text-center flex-shrink-0">
          {t('settings.title')}
        </h1>

        {/* Scrollable content area */}
        <div className="flex-1 overflow-y-auto space-y-6 scrollbar-hide">
          {/* Bot Behavior Section */}
          <div className="bg-theme-sub-alt rounded-lg p-6">
            <h2 className="text-xl font-semibold text-theme-text mb-4">
              {t('settings.bot.title')}
            </h2>

            {/* Bot Difficulty Setting */}
            <div className="mb-6">
              <label className="block text-theme-text font-medium mb-2">
                {t('settings.bot.difficulty')}
              </label>
              <p className="text-sm text-theme-sub mb-3">
                {t('settings.bot.difficulty.desc')}
              </p>
              <div className="flex flex-col space-y-2">
                {[
                  { value: 'easy', label: t('settings.difficulty.easy'), chance: t('settings.difficulty.easy.chance') },
                  { value: 'medium', label: t('settings.difficulty.medium'), chance: t('settings.difficulty.medium.chance') },
                  { value: 'hard', label: t('settings.difficulty.hard'), chance: t('settings.difficulty.hard.chance') }
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setBotDifficulty(option.value as any)}
                    className={`flex items-center justify-between p-3 rounded-lg border-2 transition-colors
                      ${botDifficulty === option.value
                        ? 'border-theme-main bg-theme-main bg-opacity-20 text-theme-text'
                        : 'border-theme-sub bg-theme-bg text-theme-text hover:border-theme-main'
                      }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-4 h-4 rounded-full border-2
                        ${botDifficulty === option.value
                          ? 'border-theme-main bg-theme-main'
                          : 'border-theme-sub'
                        }`}
                      />
                      <span className="font-medium">{option.label}</span>
                    </div>
                    <span className="text-sm text-theme-sub">{option.chance}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Bot Delay Toggle */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <label className="text-theme-text font-medium">
                  {t('settings.bot.delay')}
                </label>
                <p className="text-sm text-theme-sub">
                  {t('settings.bot.delay.desc')}
                </p>
              </div>
              <button
                onClick={() => setBotDelay(!botDelay)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                  ${botDelay
                    ? 'bg-theme-main'
                    : 'bg-theme-sub'
                  }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                    ${botDelay ? 'translate-x-6' : 'translate-x-1'}`}
                />
              </button>
            </div>

            {/* Delay Duration Slider */}
            {botDelay && (
              <div className="mt-4">
                <label className="block text-theme-text font-medium mb-2">
                  {t('settings.bot.delay.duration')}: {botDelayMs}ms
                </label>
                <input
                  type="range"
                  min="500"
                  max="3000"
                  step="100"
                  value={botDelayMs}
                  onChange={(e) => setBotDelayMs(parseInt(e.target.value))}
                  className="w-full h-2 bg-theme-sub rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-xs text-theme-sub mt-1">
                  <span>500ms</span>
                  <span>3000ms</span>
                </div>
              </div>
            )}
          </div>

          {/* <div className="bg-theme-sub-alt rounded-lg p-6">
            <h2 className="text-xl font-semibold text-theme-text mb-4">
              {t('settings.appearance.title')}
            </h2>
            <p className="text-theme-sub">
              {t('settings.appearance.coming-soon')}
            </p>
          </div> */}

          {/* Gameplay Section */}
          <div className="bg-theme-sub-alt rounded-lg p-6">
            <h2 className="text-xl font-semibold text-theme-text mb-4">
              {t('settings.gameplay.title')}
            </h2>
            <p className="text-theme-sub">
              {t('settings.gameplay.coming-soon')}
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
