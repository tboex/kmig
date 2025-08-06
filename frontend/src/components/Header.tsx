import Logo from './Logo';
import LanguageToggle from './LanguageToggle';
import { useLanguage } from '../contexts/LanguageContext';

export default function Header() {
  const { t } = useLanguage();

  return (
    <header className="w-full h-15 bg-theme-bg flex items-center justify-between">
      <div className="w-full max-w-screen-xl mx-auto flex items-center justify-between px-4 md:px-8 lg:px-16">
        {/* Left section (Logo and Nav) */}
        <div className="flex flex-row items-center space-x-6">
          <a id="kmig" href="/" className="text-2xl lg:text-3xl font-bold tracking-tight text-theme-text">
            <Logo width={120} height={36} />
          </a>
          <nav className="flex flex-row items-center space-x-4 text-sm text-theme-sub">
            <a id="startGameButton" title="start game" href="/" className="hover-text-theme-text">
              <div className="icon">
                <i className="fas fa-fw fa-gamepad"></i>
              </div>
            </a>
            <a id="aboutButton" title="about" href="/about" className="hover-text-theme-text">
              <div className="icon">
                <i className="fas fa-fw fa-info"></i>
              </div>
            </a>
            <a id="settingsButton" title={t('nav.settings')} href="/settings" className="hover-text-theme-text">
              <div className="icon">
                <i className="fas fa-fw fa-cog"></i>
              </div>
            </a>
          </nav>
        </div>

        {/* Right section (Account button and Language toggle) */}
        <div className="flex items-center space-x-4">
          <a className="accountButton flex flex-row items-center space-x-2 text-theme-sub hover-text-theme-text" href="/account" title={t('nav.account')}>
            <div className="user">
              <i className="fas fa-fw fa-user"></i>
            </div>
            <div className="text">Account</div>
          </a>
          <LanguageToggle />
        </div>
      </div>
    </header>
  );
}
