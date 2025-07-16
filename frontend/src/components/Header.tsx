export default function Header() {
  return (
    <header className="w-full h-25 bg-serika-dark--bg-color flex items-center justify-between">
      <div className="w-full max-w-screen-xl mx-auto flex items-center justify-between px-4 md:px-8 lg:px-16">
        {/* Left section (Logo) */}
        <div className="flex flex-row items-center space-x-6">
          <a id="kmig" href="/" className="text-2xl lg:text-3xl font-bold tracking-tight text-serika-dark--text-color">
            끝말잇기
          </a>
          <nav className="flex flex-row items-center space-x-4 text-sm text-serika-dark--sub-color">
            <a id="startGameButton" title="start game" href="/" className="hover:text-serika-dark--text-color">
              <div className="icon">
                <i className="fas fa-fw fa-gamepad"></i>
              </div>
            </a>
            <a id="aboutButton" title="about" href="/about" className="hover:text-serika-dark--text-color">
              <div className="icon">
                <i className="fas fa-fw fa-info"></i>
              </div>
            </a>
            <a id="settingsButton" title="settings" href="/settings" className="hover:text-serika-dark--text-color">
              <div className="icon">
                <i className="fas fa-fw fa-cog"></i>
              </div>
            </a>
          </nav>
        </div>

        {/* Right section (Menu) */}
        <div className="accountButtonAndMenu">
          <a className="accountButton flex flex-row items-center space-x-2 text-serika-dark--sub-color hover:text-serika-dark--text-color" href="/account" title="account">
            <div className="user">
              <i className="fas fa-fw fa-user"></i>
            </div>
            <div className="text">timboex</div>
          </a>
        </div>
      </div>
    </header>
  );
}
