import React, { useContext, useState } from 'react';
import { Toggle } from '../components/Toggle';
import Back from '../components/Back';
import { Helmet } from 'react-helmet-async';
import ThemeContext from '../components/ThemeProvider';

const themes = [
  {
    name: 'dark',
    bg: 'bg-surface-dark',
    text: 'text-on-surface-dark',
    border: 'border-secondary-dark',
    btnBg: 'bg-primary-dark',
    btnText: 'text-white',
  },
  {
    name: 'light',
    bg: 'bg-surface-light',
    text: 'text-on-surface-light',
    border: 'border-secondary-light',
    btnBg: 'bg-primary-light',
    btnText: 'text-white',
  },
  {
    name: 'retro',
    bg: 'bg-surface-retro',
    text: 'text-on-surface-retro',
    border: 'border-secondary-retro',
    btnBg: 'bg-primary-retro',
    btnText: 'text-white',
  },
  {
    name: 'neon',
    bg: 'bg-surface-neon',
    text: 'text-on-surface-neon',
    border: 'border-secondary-neon',
    btnBg: 'bg-primary-neon',
    btnText: 'text-black',
  },
];

const Preferences: React.FC = () => {
  const { theme, toggleThemeHandler } = useContext(ThemeContext);
  const [selectedTheme, setSelectedTheme] = useState(
    () => themes.find((t) => t.name === theme) || themes[0],
  );

  return (
    <div className="container-sm">
      <Helmet title="Preferences | JukeVibes" />
      <Back to="/settings" />
      <h2 className="heading-2 mt-10 text-center">Preferences</h2>
      <div className="list">
        <div className="list-item">
          <label className="inline-flex w-full cursor-pointer items-center justify-between">
            <span className="me-3 font-medium">Theme</span>
          </label>
          <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">
            {themes.map((theme) => (
              <label
                key={theme.name}
                className={`${theme.border} flex cursor-pointer flex-col items-center justify-center rounded border p-4 transition-all ${theme.bg} ${theme.text} ${
                  selectedTheme.name === theme.name ? 'scale-110 ring-4 ring-[var(--border)]' : ''
                }`}
                onClick={() => {
                  setSelectedTheme(theme);
                  toggleThemeHandler(theme.name);
                }}
              >
                <input type="radio" value={theme.name} className="hidden" />
                <span className="body-1 text-sm font-medium">{theme.name.toUpperCase()}</span>
                <div
                  className={`mt-2 w-full rounded py-1 text-center ${theme.btnBg} ${theme.btnText} text-xs font-semibold`}
                >
                  Button
                </div>
              </label>
            ))}
          </div>
        </div>
        <div className="list-item">
          <label className="inline-flex w-full cursor-pointer items-center justify-between">
            <input type="checkbox" className="peer sr-only" />
            <span className="me-3 font-medium">Set all requests to auto-approve</span>
            <Toggle />
          </label>
        </div>
      </div>
    </div>
  );
};

export default Preferences;
