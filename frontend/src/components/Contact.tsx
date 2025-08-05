interface ContactProps {
  onClose: () => void;
}

export default function Contact({ onClose }: ContactProps) {
  return (
    <div className="contact-popup-window fixed inset-0 flex items-center justify-center z-50">
      {/* background */}
      <div
        className="absolute inset-0 bg-opacity-30 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative p-6 rounded-lg shadow-lg bg-theme-bg text-center z-10">
        <div className="title mb-4 text-left text-3xl text-theme-sub">Contact</div>
        <div className='text text-lg text-theme-text'>Reach out to me with any feedback, recommended changes, or study tips</div>
        <div className='buttons flex flex-row gap-4 mt-6 w-full'>
            <a
                className="flex-1 flex flex-row items-center justify-center space-x-4 p-4 rounded-lg bg-theme-sub-alt text-theme-text text-xl hover:bg-theme-main hover:text-black transition"
                target="_blank"
                href="mailto:kmig.game@gmail.com?subject=[Question]"
                rel="noopener"
            >
                <div className="icon">
                    <i className="fas fa-question-circle"></i>
                </div>
                <div className="text">Question</div>
            </a>
            <a
                className="flex-1 flex flex-row items-center justify-center space-x-4 p-4 rounded-lg bg-theme-sub-alt text-theme-text text-xl hover:bg-theme-main hover:text-black transition"
                target="_blank"
                href="mailto:kmig.game@gmail.com?subject=[Feedback]"
                rel="noopener"
            >
                <div className="icon">
                    <i className="fas fa-comment-dots"></i>
                </div>
                <div className="text">Comment</div>
            </a>
            <a
                className="flex-1 flex flex-row items-center justify-center space-x-4 p-4 rounded-lg bg-theme-sub-alt text-theme-text text-xl hover:bg-theme-main hover:text-black transition"
                target="_blank"
                href="mailto:kmig.game@gmail.com?subject=[Bug Report]"
                rel="noopener"
            >
                <div className="icon">
                    <i className="fas fa-bug"></i>
                </div>
                <div className="text">Bug Report</div>
            </a>
        </div>
      </div>
    </div>
  );
}
