import 'regenerator-runtime/runtime';
import { createRoot } from 'react-dom/client';
import './locales/i18n';
import App from './App';
import './style.css';
import './mobile.css';

// 捕获React 18中的严格模式下的控制台警告
const originalConsoleError = console.error;
console.error = function filterWarnings(msg, ...args) {
  const suppressedWarnings = [
    'Warning: ReactDOM.render is no longer supported',
    'Warning: Invalid hook call',
    'Warning: Cannot update a component'
  ];
  
  if (!suppressedWarnings.some(warning => typeof msg === 'string' && msg.includes(warning))) {
    originalConsoleError(msg, ...args);
  }
};

const container = document.getElementById('root');
const root = createRoot(container);

root.render(<App />);
