import ThemeDropdown from './ThemeDropdown';

type FooterProps = {
  onContactClick: () => void;
  onSupportClick: () => void;
};

export default function Footer({ onContactClick, onSupportClick }: FooterProps) {
  return (
    <footer className="sticky bottom-0 left-0 right-0 w-full h-15 px-4 bg-theme-bg flex items-center justify-between z-50">
      {/* Left section */}
      <div className="flex flex-row items-center space-x-6">
        <button
          className="contactButton flex flex-row items-center space-x-2 text-theme-sub hover-text-theme-text"
          onClick={onContactClick}
        >
          <i className="fas fa-fw fa-envelope"></i>
          <div>contact</div>
        </button>
        <button
          className="supportButton flex flex-row items-center space-x-2 text-theme-sub hover-text-theme-text"
          onClick={onSupportClick}
        >
          <i className="fas fa-fw fa-donate"></i>
          <div>support</div>
        </button>
        <a href="https://github.com/tboex/kmig" target="_blank" rel="noreferrer noopener" className="flex flex-row items-center space-x-2 text-theme-sub hover-text-theme-text">
          <i className="fab fa-fw fa-github"></i>
          <div>github</div>
        </a>
        {/* <a href="/public/terms-of-service" target="_blank" className="flex flex-row items-center space-x-2 text-theme-sub hover-text-theme-text">
          <i className="fas fa-fw fa-file-contract"></i>
          <div>terms</div>
        </a> */}
      </div>

      {/* Right section */}
      <div className="flex flex-row items-center space-x-6">
        <ThemeDropdown />
        <button className="versionbutton flex flex-row items-center space-x-2 text-theme-sub hover-text-theme-text">
          <i className="fas fa-fw fa-code-branch"></i>
          <div>v1.0.0</div>
        </button>
      </div>
    </footer>
  );
}
