import React from 'react';
import '../scss/Card.scss';

interface CardProps {
    icon: React.ElementType;
    header: string;
    children: React.ReactNode;
	bgColor?: string;
}

const Card: React.FC<CardProps> = ({ icon: Icon, header, children, bgColor }) => {
    return (
        <div className={`card ${bgColor ? bgColor : ''}`}>
            <Icon className="icon" />
            <div className="text-content">
                <p className="card-header">{header}</p>
                <div className="card-text">{children}</div>
            </div>
        </div>
    );
};

export default Card;