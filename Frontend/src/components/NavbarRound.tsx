import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import {
  Typography,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemPrefix,
} from '@material-tailwind/react';
import ThemeToggleButton from './ThemeToggleButton';
import { ProfileMenu } from './ProfileMenu';
import { IoMenu } from 'react-icons/io5';
import { IoDocuments } from 'react-icons/io5';
import { IoSearch } from 'react-icons/io5';
import { IoCloudUpload } from 'react-icons/io5';

import siemens_logo from '../assets/siemens-logo.svg'; // Ensure you have the logo in the specified path

export function NavbarRound() {
  const location = useLocation(); // Get the current location for active link styling

  // Define navigation items for both the navbar and drawer
  const navItems = [
    { to: '/', label: 'Documents', Icon: IoDocuments },
    { to: '/search', label: 'Search', Icon: IoSearch },
    { to: '/upload', label: 'Upload', Icon: IoCloudUpload },
  ];

  return (
    <div className='flex items-start justify-between top-0 left-0 w-full p-4 bg-color-background-light dark:bg-color-background-dark z-50 border-b-2 border-opacity-5 dark:border-opacity-5 border-color-text-light dark:border-color-text-dark fixed'>
      {/* Logo and title */}
      <div className='flex flex-col items-start'>
        <img
          src={siemens_logo}
          alt='Siemens Logo'
          className='w-30 h-8 text-color-second dark:text-color-third'
        />
        <Link to={'/'}>
          <Typography className='ml-5 font-extralight text-color-text-light dark:text-color-text-dark'>
            Document Repository
          </Typography>
        </Link>
      </div>

      {/* Desktop navigation menu */}
      <div className='hidden lg:block w-auto px-4 py-2 lg:px-8 lg:py-2 lg:rounded-full bg-color-background-light-second dark:bg-color-background-dark-second '>
        <ul className='flex gap-8'>
          {navItems.map(({ to, label, Icon }) => (
            <li key={to}>
              <Link
                to={to}
                className={`flex items-center gap-x-2 p-2 font-medium rounded-none transition-all ${
                  location.pathname === to
                    ? 'border-b-2 border-color-first dark:border-color-third' // Highlight active page
                    : 'text-blue-gray-700 dark:text-blue-gray-300'
                }`}
              >
                <Icon
                  className={`scale-150 ${
                    location.pathname === to ? 'opacity-100' : 'opacity-50'
                  }`}
                />
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Theme toggle button and mobile drawer menu */}
      <div className='flex items-center gap-2'>
        <ThemeToggleButton />
        {/* Profile menu */}
        <ProfileMenu />
        <DrawerWithNavigation />
      </div>
    </div>
  );
}

function DrawerWithNavigation() {
  const location = useLocation(); // Get current location for active link styling
  const [open, setOpen] = React.useState(false); // State to control drawer visibility

  const openDrawer = () => setOpen(true);
  const closeDrawer = () => setOpen(false);

  // Navigation items (same as the main navbar)
  const navItems = [
    { to: '/', label: 'Documents', Icon: IoDocuments },
    { to: '/search', label: 'Search', Icon: IoSearch },
    { to: '/upload', label: 'Upload', Icon: IoCloudUpload },
  ];

  return (
    <React.Fragment>
      {/* Button to open drawer on small screens */}
      <button
        onClick={openDrawer}
        className='lg:hidden p-4 text-color-text-light rounded-full dark:text-color-text-dark bg-color-background-light-second dark:bg-color-background-dark-second'
      >
        <IoMenu className='scale-150' />
      </button>

      {/* Sidebar drawer for mobile navigation */}
      <Drawer
        open={open}
        onClose={closeDrawer}
        overlay={true}
        overlayProps={{ className: 'fixed inset-0 bg-black bg-opacity-50' }}
        className='bg-color-background-light-second dark:bg-color-background-dark-second'
      >
        {/* Drawer header with logo and close button */}
        <div className='mb-2 flex items-center justify-between p-4 border-b-2 border-opacity-5 dark:border-opacity-5 border-color-text-light dark:border-color-text-dark'>
          <div className='flex flex-col items-start'>
            <img
              src={siemens_logo}
              alt='Siemens Logo'
              className='w-30 h-8 text-color-second dark:text-color-third'
            />
            <Typography className='ml-5 font-extralight text-color-text-light dark:text-color-text-dark'>
              Document Repository
            </Typography>
          </div>
          <IconButton
            className='rounded-full p-6'
            variant='text'
            color='blue-gray'
            onClick={closeDrawer}
          >
            {/* Close button icon */}
            <svg
              xmlns='http://www.w3.org/2000/svg'
              fill='none'
              viewBox='0 0 24 24'
              strokeWidth={2}
              stroke='currentColor'
              className='h-5 w-5'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                d='M6 18L18 6M6 6l12 12'
              />
            </svg>
          </IconButton>
        </div>

        {/* Drawer navigation links */}
        <List>
          {navItems.map(({ to, label, Icon }) => (
            <Link
              key={to}
              to={to}
              className='flex items-center'
              onClick={closeDrawer} // Close drawer when a link is clicked
            >
              <ListItem
                className={
                  location.pathname === to
                    ? 'bg-color-background-light dark:bg-color-background-dark-third text-color-text-light dark:text-color-text-dark'
                    : 'text-blue-gray-700 dark:text-blue-gray-300 dark:hover:bg-color-background-dark-third'
                }
              >
                <ListItemPrefix>
                  <Icon className='text-color-first dark:text-color-fourth scale-150 opacity-50' />
                </ListItemPrefix>
                {label}
              </ListItem>
            </Link>
          ))}
        </List>
      </Drawer>
    </React.Fragment>
  );
}
