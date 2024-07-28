import React from 'react';
import '../scss/Layout.scss';
import Header from '../components/Header';

interface LayoutProps {
  title: string;
  disableBackButton?: boolean;
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ title, children, disableBackButton }) => {
  return (
    <div>
      <Header title={title} disableBackButton={disableBackButton} />
      <div className="main-content">
        {children}
      </div>
    </div>
  );
};

export default Layout;