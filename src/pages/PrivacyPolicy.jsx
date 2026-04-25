import '../App.css';
import './About.css';
import Header from '../components/Header';
import Footer from '../components/Footer';

function PrivacyPolicy() {
    return (
        <>
            <Header />
            <main className="about-page" style={{ paddingTop: '100px', maxWidth: '800px', margin: '0 auto', textAlign: 'left', lineHeight: '1.6' }}>
                <div className="about-bg-glow" />
                
                <p className="eyebrow" style={{ marginBottom: '0.5rem' }}>Legal & Compliance</p>
                <h1 className="about-hero-h1" style={{ marginBottom: '10px' }}>Privacy Policy</h1>
                <p className="about-body" style={{ marginBottom: '40px' }}>Last Updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>

                <section style={{ marginBottom: '32px' }}>
                    <h2 className="about-section-title">1. Introduction</h2>
                    <p className="about-body">
                        Welcome to AlgoZen. We respect your privacy and are committed to protecting your personal data. 
                        This Privacy Policy explains how we collect, use, and safeguard your information when you use our 
                        AI-powered DSA learning platform, including our website, mock interviews, and code evaluation features.
                    </p>
                </section>

                <section style={{ marginBottom: '32px' }}>
                    <h2 className="about-section-title">2. Information We Collect</h2>
                    <ul className="about-body" style={{ listStyleType: 'disc', paddingLeft: '20px' }}>
                        <li style={{ marginBottom: '8px' }}><strong>Account Information:</strong> When you sign up, we collect your name, email address, and authentication data via Firebase.</li>
                        <li style={{ marginBottom: '8px' }}><strong>Code and Performance Data:</strong> Code snippets you submit, AI hints requested, and your performance metrics on DSA problems.</li>
                        <li style={{ marginBottom: '8px' }}><strong>Mock Interview Data:</strong> During AI Mock Interviews, we process audio/video data in real-time to provide feedback. <strong>We do not store your video feeds permanently</strong>.</li>
                        <li style={{ marginBottom: '8px' }}><strong>Payment Information:</strong> Handled securely by our third-party payment processors (Razorpay and Dodo Payments). We do not store your raw credit card numbers.</li>
                    </ul>
                </section>

                <section style={{ marginBottom: '32px' }}>
                    <h2 className="about-section-title">3. How We Use Your Information</h2>
                    <p className="about-body" style={{ marginBottom: '16px' }}>
                        We use the collected data to:
                    </p>
                    <ul className="about-body" style={{ listStyleType: 'disc', paddingLeft: '20px' }}>
                        <li style={{ marginBottom: '8px' }}>Provide, maintain, and improve the AlgoZen platform.</li>
                        <li style={{ marginBottom: '8px' }}>Generate personalized AI hints, code reviews, and interview feedback.</li>
                        <li style={{ marginBottom: '8px' }}>Process subscriptions and manage your premium access limits.</li>
                        <li style={{ marginBottom: '8px' }}>Send you technical notices, updates, and support messages.</li>
                    </ul>
                </section>

                <section style={{ marginBottom: '32px' }}>
                    <h2 className="about-section-title">4. Third-Party Services & AI Providers</h2>
                    <p className="about-body">
                        To power our specialized DSA features, we integrate with third-party LLM providers (e.g., Groq) for text, 
                        audio, and code generation. Code snippets and interview transcripts may be sent to these partners strictly for processing 
                        your real-time requests.
                    </p>
                </section>

                <section style={{ marginBottom: '32px' }}>
                    <h2 className="about-section-title">5. Data Security</h2>
                    <p className="about-body">
                        We implement industry-standard security measures to protect your data. User authentication and database 
                        storage are securely managed through Google Firebase. However, no method of transmission over the Internet 
                        is 100% secure, and we cannot guarantee absolute security.
                    </p>
                </section>

                <section style={{ marginBottom: '32px' }}>
                    <h2 className="about-section-title">6. Contact Us</h2>
                    <p className="about-body">
                        If you have any questions about this Privacy Policy or wish to delete your account data, please contact us at: 
                        <br /><strong>algozensupport24@gmail.com</strong> or visit our <a href="/contact-us" style={{ color: '#ff7e5f', textDecoration: 'none', fontWeight: '500' }}>Contact Us</a> page.
                    </p>
                </section>

            </main>
            <Footer />
        </>
    );
}

export default PrivacyPolicy;
