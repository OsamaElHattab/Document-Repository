import { NavbarRound } from './NavbarRound';

type LayoutProps = {
  children: React.ReactNode;
  hideNavbar?: boolean;
};

export default function Layout({ children, hideNavbar = false }: LayoutProps) {
  return (
    <div className='flex flex-col bg-color-background-light dark:bg-color-background-dark text-color-text-light dark:text-color-text-dark p-2.5 min-h-screen'>
      {!hideNavbar && <NavbarRound />}
      <main
        className={`p-4 bg-color-background-light dark:bg-color-background-dark ${
          !hideNavbar ? 'mt-[4rem]' : ''
        }`}
      >
        {children}
      </main>
    </div>
  );
}
