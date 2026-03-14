import './ContactUs.css';
import Header from '../components/Header';
import Footer from '../components/Footer';

function ContactUs() {
    return (
        <>
            <Header />
            <main className="contact-page">
                <div className="contact-container">
                    <div className="contact-header">
                        <p className="eyebrow">Get In Touch</p>
                        <h1>Contact Us</h1>
                        <p className="lede">
                            Have questions, feedback, or need support? We're here to help you on your AlgoZen journey.
                        </p>
                    </div>

                    <div className="contact-content">
                        <div className="contact-info-card glass-panel">
                            <div className="info-item">
                                <div className="icon-wrapper">
                                    <i className="fas fa-phone-alt"></i>
                                </div>
                                <div className="info-text">
                                    <h3>Phone</h3>
                                    <p>Reach out to us directly.</p>
                                    <a href="tel:+917014382386" className="highlight-link">+91 7014382386</a>
                                </div>
                            </div>

                            <div className="info-item">
                                <div className="icon-wrapper">
                                    <i className="fas fa-envelope"></i>
                                </div>
                                <div className="info-text">
                                    <h3>Email</h3>
                                    <p>Drop us a line anytime.</p>
                                    <a href="mailto:support@algozen.com" className="highlight-link">support@algozen.com</a>
                                </div>
                            </div>

                            <div className="info-item">
                                <div className="icon-wrapper">
                                    <i className="fas fa-map-marker-alt"></i>
                                </div>
                                <div className="info-text">
                                    <h3>Location</h3>
                                    <p>Rad 24 AI Lab</p>
                                    <span className="highlight-text">India</span>
                                </div>
                            </div>
                        </div>

                        <div className="contact-form-card glass-panel">
                            <h2>Send a Message</h2>
                            <form className="contact-form" onSubmit={(e) => e.preventDefault()}>
                                <div className="form-group">
                                    <label htmlFor="name">Name</label>
                                    <input type="text" id="name" placeholder="Enter your name" />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="email">Email</label>
                                    <input type="email" id="email" placeholder="Enter your email" />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="message">Message</label>
                                    <textarea id="message" rows="5" placeholder="How can we help you?"></textarea>
                                </div>
                                <button type="submit" className="btn primary submit-btn">Send Message</button>
                            </form>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
}

export default ContactUs;
