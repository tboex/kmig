import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import Logo from './Logo';
import PressableButton from './PressableButton';

export default function LandingPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();

  function handleSolo() {
    navigate('/setup/solo');
  }

  function handleMulti() {
    navigate('/setup/multi');
  }

  return (
    <div className="flex-1 bg-theme-bg">
      <div className="flex flex-col items-center justify-center h-full" style={{ height: 'calc(100vh - 200px)'}}>
        <Logo width={400} height={120} className="mb-8" />
        <div className="flex flex-row space-x-4 mb-4">
          <PressableButton onClick={handleSolo} className="px-8 py-4 text-xl flex items-center space-x-2">
            <i className="fas fa-fw fa-user"></i>
            <span>{t('landing.solo')}</span>
          </PressableButton>
          <PressableButton onClick={handleMulti} className="px-8 py-4 text-xl flex items-center space-x-2">
            <i className="fas fa-fw fa-users"></i>
            <span>{t('landing.multiplayer')}</span>
          </PressableButton>
        </div>
      </div>
    </div>
  );
}
