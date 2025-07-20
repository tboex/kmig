type FooterProps = {
  onContactClick: () => void;
  onSupportClick: () => void;
};

export default function Footer({ onContactClick, onSupportClick }: FooterProps) {
  return (
    <footer className="w-full h-30 px-4  bg-serika-dark--bg-color flex items-center justify-between z-50">
        {/* Left section (Logo) */}
        <div className="flex flex-row items-center space-x-6">
            <button
                className="contactButton flex flex-row items-center space-x-2 text-serika-dark--sub-color hover:text-serika-dark--text-color"
                onClick={onContactClick}
            >
                    <i className="fas fa-fw fa-envelope"></i>
                    <div>contact</div>
            </button>
            <button
                className="supportButton flex flex-row items-center space-x-2 text-serika-dark--sub-color hover:text-serika-dark--text-color"
                onClick={onSupportClick}
            >
                    <i className="fas fa-fw fa-donate"></i>
                    <div>support</div>
            </button>
            <a href="https://github.com/tboex/kmig" target="_blank" rel="noreferrer noopener" className="flex flex-row items-center space-x-2 text-serika-dark--sub-color hover:text-serika-dark--text-color">
                <i className="fab fa-fw fa-github"></i>
                <div>github</div>
            </a>
            <a href="/public/terms-of-service" target="_blank" className="flex flex-row items-center space-x-2 text-serika-dark--sub-color hover:text-serika-dark--text-color">
                <i className="fas fa-fw fa-file-contract"></i>
                <div>terms</div>
            </a>
            {/* <a href="/security" className="flex flex-row items-center space-x-2 text-serika-dark--sub-color hover:text-serika-dark--text-color">
                <i className="fas fa-fw fa-shield-alt"></i>
                <div>security</div>
            </a>
            <a href="/privacy-policy" className="flex flex-row items-center space-x-2 text-serika-dark--sub-color hover:text-serika-dark--text-color">
                <i className="fas fa-fw fa-shield-alt"></i>
                <div>privacy</div>
            </a> */}
        </div>

        {/* Right section (Menu) */}
        <div className="flex flex-row items-center space-x-6">
            <button className="themeButton flex flex-row items-center space-x-2 text-serika-dark--sub-color hover:text-serika-dark--text-color">
                <i className="fas fa-fw fa-palette"></i>
                <div>serika dark</div>
            </button>
            <button className="versionbutton flex flex-row items-center space-x-2 text-serika-dark--sub-color hover:text-serika-dark--text-color">
                <i className="fas fa-fw fa-code-branch"></i>
                <div>v1.0.0</div>
            </button>
        </div>
    </footer>
  );
}
