interface SupportProps {
  onClose: () => void;
}

export default function Support({ onClose }: SupportProps) {
  return (
    <div className="support-popup-window fixed inset-0 flex items-center justify-center z-50">
      {/* Blurred and darkened background */}
      <div
        className="absolute inset-0 bg-opacity-30 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Popup content */}
      <div className="relative p-6 rounded-lg shadow-lg bg-serika-dark--bg-color text-center z-10">
        <div className="title mb-4 text-left text-3xl text-serika-dark--sub-color">Support KMIG</div>
        <div className='text text-lg text-serika-dark--text-color'>Server costs are expensive. If you enjoy the website I made, please provide anything you can.</div>
        <div className='buttons flex flex-row gap-4 mt-6 w-full'>
            <a
                className="flex-1 flex flex-row items-center justify-center space-x-4 p-4 rounded-lg bg-serika-dark--sub-alt-color text-serika-dark--text-color text-xl hover:bg-serika-dark--main-color hover:text-black transition"
                target="_blank"
                href="https://ko-fi.com/kmiggame"
                rel="noopener noreferrer"
            >
                <div className="icon">
                    <i className="fas fa-fw fa-donate"></i>
                </div>
                <div className="text">Donate</div>
            </a>
        </div>
      </div>
    </div>
  );
}
