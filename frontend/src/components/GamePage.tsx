import { useRef, useState, useEffect } from 'react';
import Toolbar from './Toolbar'
import Popup from './Popup';
import Username from './Username';
import WordTooltip from './WordTooltip';
import { startGame, submitWord, getBotTurn, getGameStatus } from '../services/game';


export default function GamePage() {
    const [mode, setMode] = useState<'solo' | 'multi'>('solo');
    const [toolbarMode, setToolbarMode] = useState<'guesses' | 'timer'>('guesses');
    const [guessCount, setGuessCount] = useState<number>(5);
    const [timerDuration, setTimerDuration] = useState<number>(0);
    const [gameData, setGameData] = useState<any>(null);
    const [username, setUsername] = useState(() => localStorage.getItem('kmig_username') || '');
    const [showUsernamePopup, setShowUsernamePopup] = useState(!username);
    const [usernameInput, setUsernameInput] = useState('');
    const [popup, setPopup] = useState<{
        open: boolean;
        message: string;
        type?: 'success' | 'error' | 'info' | 'defeat'
    }>({ open: false, message: '', type: 'info' });

    // New state for the chain and input
    const [chain, setChain] = useState<{
        sender: 'other' | 'user',
        text: string,
        name: string,
        pronunciation?: string,
        hanja?: string,
        part_of_speech?: string,
        definition?: string,
        english?: string,
    }[]>([]);
    const [userInput, setUserInput] = useState('');
    const chainRef = useRef<HTMLDivElement>(null);
    const [isScrolledUp, setIsScrolledUp] = useState(false);

    async function handleStartGame(word?: string) {
        try {
            const data = await startGame(mode, guessCount, timerDuration, word);
            setGameData(data);
            if (data.game_id && mode === 'multi') {
                window.history.replaceState(null, '', `/game/${data.game_id}`);
            }
            if (data.hasOwnProperty('word')) {
                setChain([{
                    sender: 'other',
                    text: data.word.korean,
                    name: data.player.name,
                    pronunciation: data.word.pronunciation,
                    hanja: data.word.hanja,
                    part_of_speech: data.word.part_of_speech,
                    definition: data.word.definition,
                    english: data.word.english,
                }]);
            }
        } catch (err) {
            console.log(err);
            alert("Failed to start game");
        }
    }

    function handleUsernameSubmit() {
        if (usernameInput.trim()) {
            setUsername(usernameInput.trim());
            localStorage.setItem('kmig_username', usernameInput.trim());
            setShowUsernamePopup(false);
        }
    }

    // Call handleStartGame on mount and whenever settings change
    useEffect(() => {
        setChain([])
        handleStartGame();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mode, toolbarMode, guessCount, timerDuration]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!userInput.trim() || !gameData?.game_id) return;

        // TODO: Check if game is still active before submitting
        // const game_status = await getGameStatus(gameData.game_id);

        // if(game_status.status.status === 'INACTIVE') {
        //     handleStartGame(userInput);
        // }


        const submittedWord = userInput;
        setUserInput('');

        try {
            // POST user's word
            const submitRes = await submitWord(gameData.game_id, submittedWord);

            if (submitRes.status.status === 'VICTORY') {
                setPopup({ open: true, message: submitRes.status.message, type: 'success' });
            } else if (submitRes.status.status === 'INVALID') {
                setChain([...chain, {
                    sender: 'user',
                    text: userInput,
                    name: usernameInput
                }]);
                setPopup({ open: true, message: submitRes.status.message, type: 'error' });
            }
            else {
                setChain([...chain, {
                    sender: 'user',
                    text: submitRes.word.korean,
                    name: submitRes.player.name,
                    pronunciation: submitRes.word.pronunciation,
                    hanja: submitRes.word.hanja,
                    part_of_speech: submitRes.word.part_of_speech,
                    definition: submitRes.word.definition,
                    english: submitRes.word.english,
                }]);
            }

            // If single mode, get bot's turn
            if (gameData.mode === 'single' && submitRes.status.status != 'INVALID') {
                const botRes = await getBotTurn(gameData.game_id);
                setChain(current => [
                    ...current,
                    {
                        sender: 'other',
                        text: botRes.word?.korean || '봇의 응답 없음',
                        name: botRes.player.name,
                        pronunciation: botRes.word?.pronunciation,
                        hanja: botRes.word?.hanja,
                        part_of_speech: botRes.word?.part_of_speech,
                        definition: botRes.word?.definition,
                        english: botRes.word?.english,
                    }
                ]);
            }
        } catch (err) {
            alert('제출에 실패했습니다.');
        }
    }

    function handleChainScroll() {
        const el = chainRef.current;
        if (!el) return;
        // If at the bottom (allowing a small threshold)
        const atBottom = el.scrollTop <= 5;
        setIsScrolledUp(!atBottom);
    }

    useEffect(() => {
        if (!isScrolledUp && chainRef.current) {
            chainRef.current.scrollTop = 0;
        }
    }, [chain, isScrolledUp]);

    return (
        <main className="game-page w-full flex-1 flex flex-col  bg-serika-dark--bg-color">
            <Toolbar
                mode={mode}
                setMode={setMode}
                toolbarMode={toolbarMode}
                setToolbarMode={setToolbarMode}
                guessCount={guessCount}
                setGuessCount={setGuessCount}
                timerDuration={timerDuration}
                setTimerDuration={setTimerDuration}
            />
            <div className="game-bar flex-1 flex flex-col items-center justify-center">
                <div
                    ref={chainRef}
                    onScroll={handleChainScroll}
                    className="game-play-space w-full max-w-md mb-4 h-96 overflow-y-auto flex flex-col-reverse space-y-reverse space-y-2"
                >
                        {[...chain].reverse().map((msg, idx) => {
                            const fadeSteps = 5;
                            const opacity = isScrolledUp ? 1 : Math.max(1 - idx * (0.7 / fadeSteps), 0.3);

                            return (
                                <div
                                    key={chain.length - 1 - idx}
                                    style={{ opacity }}
                                    className={`relative px-4 py-2 rounded-lg transition-opacity duration-500 mb-2 ${
                                        msg.sender === 'other'
                                            ? 'bg-serika-dark--sub-alt-color text-serika-dark--main-color self-start'
                                            : 'bg-serika-dark--main-color text-black self-end'
                                    }`}
                                >
                                    <div className="text-xs text-serika-dark--sub-color mb-1">{msg.name}</div>
                                    <WordTooltip
                                        tooltip={
                                            <>
                                            {msg.english && <div><b>English:</b> {msg.english}</div>}
                                            {msg.definition && <div><b>Definition:</b> {msg.definition}</div>}
                                            {msg.pronunciation && <div><b>Pronunciation:</b> {msg.pronunciation}</div>}
                                            {msg.hanja && <div><b>Hanja:</b> {msg.hanja}</div>}
                                            </>
                                        }
                                        >
                                        {msg.text}
                                    </WordTooltip>
                                </div>
                            );
                        })}
                </div>
                <form onSubmit={handleSubmit} className="w-full max-w-md flex space-x-2">
                    <input
                        className="flex-1 px-3 py-2 rounded bg-serika-dark--sub-alt-color text-serika-dark--text-color outline-none"
                        value={userInput}
                        onChange={e => setUserInput(e.target.value)}
                        placeholder="단어를 입력하세요…"
                    />
                    <button
                        type="submit"
                        className="px-4 py-2 rounded bg-serika-dark--main-color text-black font-bold"
                    >
                        제출
                    </button>
                </form>
            </div>
            <Username
                open={showUsernamePopup}
                usernameInput={usernameInput}
                setUsernameInput={setUsernameInput}
                onSubmit={handleUsernameSubmit}
            />
            <Popup
                open={popup.open}
                message={popup.message}
                type={popup.type}
                onClose={() => setPopup({ ...popup, open: false })}
            />
        </main>
    );
}
