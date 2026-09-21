import { ShieldCheck } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="app-footer">
      <div className="universal-footer-wrapper">
        <a
          href="https://sean-m.vercel.app"
          target="_blank"
          rel="noopener noreferrer"
          className="universal-branding"
        >
          <div className="universal-footer-content">
            <span className="universal-powered-by">POWERED BY:</span>
            <span className="universal-dev-name universal-dev-name-first">MaPSA</span>
            <span className="universal-dev-name">SEAN MORALES</span>
          </div>
        </a>
      </div>
    </footer>
  );
}
