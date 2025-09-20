import { useTheme } from '../hooks/useTheme';
import { CiDark } from 'react-icons/ci';
import { IoSunny } from 'react-icons/io5';

// Button component to toggle between light and dark mode
const ThemeToggleButton = () => {
  // Extract the current theme and the function to toggle it from the custom hook
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className='p-2 bg-color-background-light-second dark:bg-color-background-dark-second text-color-text-light dark:text-color-text-dark rounded-full'
    >
      {theme === 'dark' ? (
        <IoSunny className='text-3xl' />
      ) : (
        <CiDark className='text-3xl' />
      )}
    </button>
  );
};

export default ThemeToggleButton;
