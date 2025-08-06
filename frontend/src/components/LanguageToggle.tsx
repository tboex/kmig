import { useLanguage } from '../contexts/LanguageContext';

export default function LanguageToggle() {
  const { language, setLanguage, t } = useLanguage();

  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={() => setLanguage(language === 'en' ? 'ko' : 'en')}
        className="flex items-center space-x-2 px-3 py-1  text-theme-sub hover-text-theme-text"
      >
        <span className="text-sm font-medium">
          {t('settings.language')}
        </span>
      </button>
    </div>
  );
}
