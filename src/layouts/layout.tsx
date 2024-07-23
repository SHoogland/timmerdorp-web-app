import React from 'react';
import '../scss/Layout.scss';
import Header from '../components/Header';

interface LayoutProps {
  title: string;
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ title, children }) => {
  return (
    <div>
      <Header title={title} />
      <div className="main-content">
        {children}
      </div>
    </div>
  );
};

export default Layout;