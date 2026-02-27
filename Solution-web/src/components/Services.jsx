import React from 'react';
import { Link } from 'react-router-dom';
import './Services.css';
import { MdKeyboardDoubleArrowRight } from "react-icons/md";
import { FaArrowRight } from "react-icons/fa";
import { detailedServiceData } from '../data/detailedServices';

const Services = () => {
  return (
    <section className="services-section">
      <div className="container">
        <h2 className="section-title">Business Setup & Statutory Registration</h2>
        <p className="section-desc">(foundation services-required to start and operate a business)</p>

        <div className="services-grid">
          {detailedServiceData.slice(0, 6).map((service, index) => (
            <div className="service-card" key={index}>
              <div 
                className="icon-box" 
                style={{ backgroundColor: service.bgColor, color: service.iconColor }}
              >
                {service.icon}
              </div>
              
              <h3 className="card-title">{service.title}</h3>
              <p className="card-desc">{service.desc}</p>
              
              <Link to={service.path || "#"} className="apply-now">
                Apply now <MdKeyboardDoubleArrowRight className="arrow-icon" />
              </Link>
            </div>
          ))}
        </div>

        {/* Explore All Button Section */}
        <div className="services-footer">
          <Link to="/services" className="explore-btn">
            Explore all <FaArrowRight className="btn-arrow" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Services;
