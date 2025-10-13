import React from 'react';

const ThemeToggle = ({ theme, setTheme }) => {
  return (
    <div className="p-2 flex justify-end">
      <select
        value={theme}
        onChange={(e) => setTheme(e.target.value)}
        className="bg-gray-200 dark:bg-gray-700 p-2 rounded text-sm"
      >
        <option value="system">System</option>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
      </select>
    </div>
  );
};

export default ThemeToggle;
