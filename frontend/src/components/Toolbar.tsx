type ToolbarProps = {
    mode: 'solo' | 'multi';
    setMode: (mode: 'solo' | 'multi') => void;
    toolbarMode: 'guesses' | 'timer';
    setToolbarMode: (mode: 'guesses' | 'timer') => void;
    guessCount: number;
    setGuessCount: (count: number) => void;
    timerDuration: number;
    setTimerDuration: (value: number) => void;
}

const GUESS_OPTIONS = [5, 10, 15, 20];
const TIMER_OPTIONS = [0, 30, 60, 90, 120];


{/* not using anymore, but keeping for reference */}

export default function Toolbar({
    mode, setMode,
    toolbarMode, setToolbarMode,
    guessCount, setGuessCount,
    timerDuration, setTimerDuration,
}: ToolbarProps) {
    return (
        <div className="toolbar h-12 bg-theme-sub-alt flex items-center justify-between px-4 mx-auto rounded-lg">
            {/* Left section (Player Count) */}
            <div className="toolbar-left flex items-center space-x-4">
                <button
                    className={`solo-player-button flex flex-row items-center space-x-2 hover-text-theme-text ${
                        mode === 'solo' ? 'text-theme-main' : 'text-theme-sub'
                    }`}
                    onClick={() => setMode('solo')}
                >

                    <i className="fas fa-fw fa-user"></i>
                    <div>solo</div>
                </button>
                <button
                    className={`multi-player-button flex flex-row items-center space-x-2 hover-text-theme-text ${
                        mode === 'multi' ? 'text-theme-main' : 'text-theme-sub'
                    }`}
                    onClick={() => setMode('multi')}
                >
                    <i className="fas fa-fw fa-users"></i>
                    <div>multi</div>
                </button>
            </div>

            <div className="spacer leftSpacer w-1 h-6 mx-6 rounded-sm bg-theme-bg"></div>

            {/* Middle section (Settings) */}
            <div className="toolbar-center flex items-center space-x-4">
                <button
                    className={`timer-button flex flex-row items-center space-x-2 hover-text-theme-text ${
                        toolbarMode === 'timer' ? 'text-theme-main' : 'text-theme-sub'
                    }`}
                    onClick={() => setToolbarMode('timer')}
                >
                    <i className="fas fa-fw fa-stopwatch"></i>
                    <div>timer</div>
                </button>
                <button
                    className={`guesses-button flex flex-row items-center space-x-2 hover-text-theme-text ${
                        toolbarMode === 'guesses' ? 'text-theme-main' : 'text-theme-sub'
                    }`}
                    onClick={() => setToolbarMode('guesses')}
                >
                    <i className="fas fa-fw fa-question-circle"></i>
                    <div>guesses</div>
                </button>
            </div>

            <div className="spacer rightSpacer w-1 h-6 mx-6 rounded-sm bg-theme-bg"></div>

            {/* Right section (Config) */}
            <div className="toolbar-right flex items-center space-x-4">
                {toolbarMode === 'guesses' &&
                    GUESS_OPTIONS.map(opt => (
                        <button
                            key={opt}
                            className={`textButton flex flex-row items-center space-x-2 cursor-default hover-text-theme-text ${
                                guessCount === opt ? 'text-theme-main' : 'text-theme-sub'
                            }`}
                            onClick={() => setGuessCount(opt)}
                        >
                            <span>{opt}</span>
                        </button>
                    ))
                }
                {toolbarMode === 'timer' &&
                    TIMER_OPTIONS.map(opt => (
                        <button
                            key={opt}
                            className={`textButton flex flex-row items-center space-x-2 cursor-default hover-text-theme-text ${
                                timerDuration === opt ? 'text-theme-main' : 'text-theme-sub'
                            }`}
                            onClick={() => setTimerDuration(opt)}
                        >
                            <span>{opt}</span>
                        </button>
                    ))
                }
            </div>
        </div>
    );
}
