import { useSettings } from '../contexts/SettingsContext';

export default function Settings() {
  const { botDelay, setBotDelay, botDelayMs, setBotDelayMs } = useSettings();

  return (
    <main className="flex-1 flex flex-col bg-serika-dark--bg-color items-center justify-start p-8">
      <div className="w-full max-w-2xl">
        <h1 className="text-3xl font-bold text-serika-dark--text-color mb-8 text-center">
          Settings
        </h1>

        <div className="bg-serika-dark--sub-alt-color rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-serika-dark--text-color mb-4">
            Bot Behavior
          </h2>

          {/* Bot Delay Toggle */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <label className="text-serika-dark--text-color font-medium">
                Artificial Bot Delay
              </label>
              <p className="text-sm text-serika-dark--sub-color">
                Add a realistic thinking delay to bot responses
              </p>
            </div>
            <button
              onClick={() => setBotDelay(!botDelay)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                ${botDelay
                  ? 'bg-serika-dark--main-color'
                  : 'bg-serika-dark--sub-color'
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
              <label className="block text-serika-dark--text-color font-medium mb-2">
                Delay Duration: {botDelayMs}ms
              </label>
              <input
                type="range"
                min="500"
                max="3000"
                step="100"
                value={botDelayMs}
                onChange={(e) => setBotDelayMs(parseInt(e.target.value))}
                className="w-full h-2 bg-serika-dark--sub-color rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-serika-dark--sub-color mt-1">
                <span>500ms</span>
                <span>3000ms</span>
              </div>
            </div>
          )}
        </div>

        {/* Future Settings Sections */}
        <div className="bg-serika-dark--sub-alt-color rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-serika-dark--text-color mb-4">
            Appearance
          </h2>
          <p className="text-serika-dark--sub-color">
            Theme settings coming soon...
          </p>
        </div>

        <div className="bg-serika-dark--sub-alt-color rounded-lg p-6">
          <h2 className="text-xl font-semibold text-serika-dark--text-color mb-4">
            Gameplay
          </h2>
          <p className="text-serika-dark--sub-color">
            Additional gameplay settings coming soon...
          </p>
        </div>
      </div>
    </main>
  );
}
