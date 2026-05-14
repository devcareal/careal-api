import React from 'react';
import { Link } from 'react-router-dom';
import img5 from "../assets/images/Careal-logo-2.png";
import './Footer.css';

function Footer() {
  const today = new Date();
  return (
    <div className='footer-container'>
      <div class='footer-links'>
        <div className='footer-link-wrapper'>
          <div class='footer-link-items'>
            <h2>About Us</h2>
            <Link to='/sign-up'>How it works</Link>
            <Link to='/'>Investors</Link>
            <Link to='/'>Terms of Service</Link>
          </div>
          <div class='footer-link-items'>
            <h2>Contact Us</h2>
            <Link to='/'>Contact</Link>
            <Link to='/'>Support</Link>
            <Link to='/'>Sponsorships</Link>
          </div>
        </div>
        <div className='footer-link-wrapper'>
          <div class='footer-link-items'>
            <h2>Social Media</h2>
            <Link to='https://www.linkedin.com/in/michaelbassey' target="_blank">Linkedin</Link>
            <Link to='https://www.instagram.com/devcareal/' target="_blank">Instagram</Link>
            <Link to='https://www.facebook.com/profile.php?id=61582834841134' target="_blank">Facebook</Link>
            <Link to='https://www.youtube.com/@Careal-h6t' target="_blank">Youtube</Link>
            <Link to='https://x.com/devcareal?t=ELFC8K3qT8v2fI0_gzjvBg&s=09' target="_blank">Twitter</Link>
          </div>
        </div>
      </div>
      <section class='social-media'>
        <div class='social-media-wrap'>
          <div class='footer-logo'>
            <Link to='/' className='social-logo'>
              Careal
              <img src={img5} alt="Descriptive text" style={{
                  width: '30px',
                  height: '30px',}}
              />
            </Link>
          </div>
          <small class='website-rights'>Copyright &copy; {today.getFullYear()}</small>
          <div class='social-icons'>
            <Link
              class='social-icon-link linkedin'
              to='https://www.linkedin.com/in/michaelbassey'
              target='_blank'
              aria-label='Linkedin'
            >
              <i class='fab fa-linkedin' />
            </Link>
            <Link
              class='social-icon-link instagram'
              to='https://www.instagram.com/devcareal/'
              target='_blank'
              aria-label='Instagram'
            >
              <i class='fab fa-instagram' />
            </Link>
            <Link
              class='social-icon-link facebook'
              to='https://www.facebook.com/profile.php?id=61582834841134'
              target='_blank'
              aria-label='Facebook' 
            >
              <i class='fab fa-facebook-f' />
            </Link>

            <Link
              class='social-icon-link youtube'
              to='https://www.youtube.com/@Careal-h6t'
              target='_blank'
              aria-label='Youtube'
            >
              <i class='fab fa-youtube' />
            </Link>
            
            <Link
              class='social-icon-link twitter'
              to='https://x.com/devcareal?t=ELFC8K3qT8v2fI0_gzjvBg&s=09'
              target='_blank'
              aria-label='Twitter'
            >
              <i class='fab fa-twitter' />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Footer;