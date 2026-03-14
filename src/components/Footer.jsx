import { Link } from 'react-router-dom';

function Footer() {
    return (
        <footer className="site-footer">
            <div className="footer-top">
                <Link to="/" className="footer-brand">
                    AlgoZen
                </Link>
            </div>

            <div className="footer-links">
                <div className="footer-col">
                    <h4 className="footer-col-title">PLATFORM &amp; SOLUTIONS</h4>
                    <Link to="/pricing">See Pricing</Link>
                    <Link to="#">Customer Stories</Link>
                    <Link to="#">Demos</Link>
                    <Link to="/help-support">Help &amp; Support</Link>
                </div>

                <div className="footer-col">
                    <h4 className="footer-col-title">LEARN</h4>
                    <Link to="#">Blog</Link>
                    <Link to="#">Whitepapers</Link>
                    <Link to="#">Subscribe</Link>
                </div>

                <div className="footer-col">
                    <h4 className="footer-col-title">ABOUT</h4>
                    <Link to="/about">About AlgoZen</Link>
                    <Link to="#">Newsroom</Link>
                    <Link to="#">Careers at AlgoZen</Link>
                    <Link to="/contact-us">Contact Us</Link>
                </div>

                <div className="footer-col">
                    <h4 className="footer-col-title">DEVELOPERS</h4>
                    <Link to="#">Free API key</Link>
                    <Link to="#">Community</Link>
                    <Link to="#">Docs</Link>
                </div>

                <div className="footer-col">
                    <h4 className="footer-col-title">TERMS & POLICIES</h4>
                    <Link to="#">Website Terms of Use</Link>
                    <Link to="#">Privacy Policy</Link>
                    <Link to="#">AlgoZen Trust Center</Link>
                    <Link to="#">Cookie Notice</Link>
                    <Link to="#">AlgoZen Privacy Portal</Link>
                    <Link to="#">Cloud Terms</Link>
                    <Link to="#">Services Agreement</Link>
                    <Link to="#">Security</Link>
                    <Link to="#">Trademark Policy</Link>
                    <Link to="#">Photography and Filming Policy</Link>
                </div>
            </div>

            <div className="footer-bottom">
                <div className="footer-copyright">
                    <span>&copy; {new Date().getFullYear()} ALGOZEN, INC. ALL RIGHTS RESERVED.</span>
                    <span className="footer-separator">&#x2022;</span>
                    <Link to="#">Manage cookies</Link>
                    <span className="footer-separator">&#x2022;</span>
                    <span>Designed by <strong>Rad 24 Lab Team</strong> (Mohit Gurjar, Abhay Singh, Yogesh Tiwari)</span>
                </div>

                <div className="footer-socials">
                    <Link to="#" aria-label="Github"><i className="fab fa-github"></i></Link>
                    <Link to="#" aria-label="Discord"><i className="fab fa-discord"></i></Link>
                    <Link to="#" aria-label="X (Twitter)"><i className="fab fa-twitter"></i></Link>
                    <Link to="#" aria-label="YouTube"><i className="fab fa-youtube"></i></Link>
                    <Link to="#" aria-label="LinkedIn"><i className="fab fa-linkedin"></i></Link>
                </div>
            </div>
        </footer>
    );
}

export default Footer;
