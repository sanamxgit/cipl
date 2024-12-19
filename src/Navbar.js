import React from 'react';
import './Navbar.css'; // Assuming you will create a CSS file for styles

const Navbar = () => {
    return (
        <div className="navbar-container">
            <div className="navbar-logo">
                <img src="https://via.placeholder.com/52x48" alt="Logo" />
                <div className="navbar-title">
                    <span className="title-part">C</span>
                    <span className="title-part">yber</span>
                    <span className="title-part"> I</span>
                    <span className="title-part">nternational </span>
                    <span className="title-part">P</span>
                    <span className="title-part">vt. </span>
                    <span className="title-part">L</span>
                    <span className="title-part">td</span>
                    <span className="title-part">.</span>
                </div>
            </div>
            <div className="navbar-links">
                <div className="navbar-item">Products</div>
                <div className="navbar-item">Services</div>
                <div className="navbar-item">Home</div>
                <div className="navbar-item">Blog</div>
                <div className="navbar-item">Contacts</div>
            </div>
            <div className="navbar-buttons">
                <div className="get-started">Get Started</div>
                <div className="get-started-secondary">Get Started</div>
            </div>
        </div>
    );
};

export default Navbar; 