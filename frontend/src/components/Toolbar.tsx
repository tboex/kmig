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
        <div className="toolbar h-12 bg-serika-dark--sub-alt-color flex items-center justify-between px-4 mx-auto rounded-lg">
            {/* Left section (Player Count) */}
            <div className="toolbar-left flex items-center space-x-4">
                <button
                    className={`solo-player-button flex flex-row items-center space-x-2 hover:text-serika-dark--text-color ${
                        mode === 'solo' ? 'text-serika-dark--main-color' : 'text-serika-dark--sub-color'
                    }`}
                    onClick={() => setMode('solo')}
                >

                    <i className="fas fa-fw fa-user"></i>
                    <div>solo</div>
                </button>
                <button
                    className={`multi-player-button flex flex-row items-center space-x-2 hover:text-serika-dark--text-color ${
                        mode === 'multi' ? 'text-serika-dark--main-color' : 'text-serika-dark--sub-color'
                    }`}
                    onClick={() => setMode('multi')}
                >
                    <i className="fas fa-fw fa-users"></i>
                    <div>multi</div>
                </button>
            </div>

            <div className="spacer leftSpacer w-1 h-6 mx-6 rounded-sm bg-serika-dark--bg-color"></div>

            {/* Middle section (Settings) */}
            <div className="toolbar-center flex items-center space-x-4">
                <button
                    className={`timer-button flex flex-row items-center space-x-2 hover:text-serika-dark--text-color ${
                        toolbarMode === 'timer' ? 'text-serika-dark--main-color' : 'text-serika-dark--sub-color'
                    }`}
                    onClick={() => setToolbarMode('timer')}
                >
                    <i className="fas fa-fw fa-stopwatch"></i>
                    <div>timer</div>
                </button>
                <button
                    className={`guesses-button flex flex-row items-center space-x-2 hover:text-serika-dark--text-color ${
                        toolbarMode === 'guesses' ? 'text-serika-dark--main-color' : 'text-serika-dark--sub-color'
                    }`}
                    onClick={() => setToolbarMode('guesses')}
                >
                    <i className="fas fa-fw fa-question-circle"></i>
                    <div>guesses</div>
                </button>
            </div>

            <div className="spacer rightSpacer w-1 h-6 mx-6 rounded-sm bg-serika-dark--bg-color"></div>

            {/* Right section (Config) */}
            <div className="toolbar-right flex items-center space-x-4">
                {toolbarMode === 'guesses' &&
                    GUESS_OPTIONS.map(opt => (
                        <button
                            key={opt}
                            className={`textButton flex flex-row items-center space-x-2 cursor-default hover:text-serika-dark--text-color ${
                                guessCount === opt ? 'text-serika-dark--main-color' : 'text-serika-dark--sub-color'
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
                            className={`textButton flex flex-row items-center space-x-2 cursor-default hover:text-serika-dark--text-color ${
                                timerDuration === opt ? 'text-serika-dark--main-color' : 'text-serika-dark--sub-color'
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
