import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Typography,
  Button,
  Menu,
  MenuHandler,
  MenuList,
  MenuItem,
} from '@material-tailwind/react';
import {
  UserCircleIcon,
  Cog6ToothIcon,
  PowerIcon,
} from '@heroicons/react/24/solid';
import { IoMdPerson } from 'react-icons/io';

const profileMenuItems = [
  {
    label: 'My Profile',
    icon: UserCircleIcon,
    path: '/profile',
  },
  {
    label: 'Edit Profile',
    icon: Cog6ToothIcon,
    path: '/profile/edit',
  },
  {
    label: 'Sign Out',
    icon: PowerIcon,
    path: null, // Special handling for sign out
  },
];

export function ProfileMenu() {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const navigate = useNavigate();

  const closeMenu = () => setIsMenuOpen(false);

  const handleMenuClick = (path: string | null, label: string) => {
    if (path) {
      navigate(path);
    } else if (label === 'Sign Out') {
      // Remove token from localStorage
      localStorage.removeItem('token');
      // Redirect to login page
      navigate('/login');
    }
    closeMenu();
  };

  return (
    <Menu open={isMenuOpen} handler={setIsMenuOpen} placement='bottom-end'>
      <MenuHandler>
        <Button
          variant='text'
          className='p-3 text-color-text-light rounded-full dark:text-color-text-dark bg-color-background-light-second dark:bg-color-background-dark-second hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors'
        >
          <IoMdPerson className='w-6 h-6' />
        </Button>
      </MenuHandler>
      <MenuList className='p-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg'>
        {profileMenuItems.map(({ label, icon, path }, key) => {
          const isLastItem = key === profileMenuItems.length - 1;
          return (
            <MenuItem
              key={label}
              onClick={() => handleMenuClick(path, label)}
              className={`flex items-center gap-2 rounded text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                isLastItem
                  ? 'hover:bg-red-500/10 focus:bg-red-500/10 active:bg-red-500/10 dark:hover:bg-red-500/20'
                  : ''
              }`}
            >
              {React.createElement(icon, {
                className: `h-4 w-4 ${isLastItem ? 'text-red-500' : 'text-gray-600 dark:text-gray-300'}`,
                strokeWidth: 2,
              })}
              <Typography
                as='span'
                variant='small'
                className='font-normal'
                color={isLastItem ? 'red' : 'inherit'}
              >
                {label}
              </Typography>
            </MenuItem>
          );
        })}
      </MenuList>
    </Menu>
  );
}
export default ProfileMenu;
