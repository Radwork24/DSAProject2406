import '../App.css';
import './About.css';
import Header from '../components/Header';
import Footer from '../components/Footer';

function TermsOfUse() {
    return (
        <>
            <Header />
            <main className="about-page" style={{ paddingTop: '100px', maxWidth: '800px', margin: '0 auto', textAlign: 'left', lineHeight: '1.6' }}>
                <div className="about-bg-glow" />
                
                <p className="eyebrow" style={{ marginBottom: '0.5rem' }}>Legal & Compliance</p>
                <h1 className="about-hero-h1" style={{ marginBottom: '10px' }}>Website Terms of Use</h1>
                <p className="about-body" style={{ marginBottom: '40px' }}>Last Updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>

                <section style={{ marginBottom: '32px' }}>
                    <h2 className="about-section-title">1. Acceptance of Terms</h2>
                    <p className="about-body">
                        By accessing or using the AlgoZen platform ("Service"), you agree to be bound by these Terms of Use. 
                        If you do not agree to these terms, you may not access or use the Service. AlgoZen reserves the right 
                        to modify these terms at any time without prior notice.
                    </p>
                </section>

                <section style={{ marginBottom: '32px' }}>
                    <h2 className="about-section-title">2. Use of Service</h2>
                    <ul className="about-body" style={{ listStyleType: 'disc', paddingLeft: '20px' }}>
                        <li style={{ marginBottom: '8px' }}><strong>Account Integrity:</strong> You are responsible for safeguarding the password that you use to access the Service and for any activities or actions under your password.</li>
                        <li style={{ marginBottom: '8px' }}><strong>Acceptable Use:</strong> You agree not to misuse the Service or help anyone else do so. This includes attempting to scrape data, reverse-engineer our AI evaluations, or disrupt the platform's functionality.</li>
                        <li style={{ marginBottom: '8px' }}><strong>Age Requirement:</strong> You must be at least 13 years old to use the Service.</li>
                    </ul>
                </section>

                <section style={{ marginBottom: '32px' }}>
                    <h2 className="about-section-title">3. Intellectual Property</h2>
                    <p className="about-body" style={{ marginBottom: '16px' }}>
                        The Service and its original content, features, AI evaluation prompts, and functionality are and will remain 
                        the exclusive property of AlgoZen (RAD 24 Lab Team) and its licensors. 
                    </p>
                    <p className="about-body">
                        The code you write and submit remains yours, but by submitting it for evaluation, you grant us a temporary license to process it through our systems and third-party LLMs strictly to provide you with feedback.
                    </p>
                </section>

                <section style={{ marginBottom: '32px' }}>
                    <h2 className="about-section-title">4. Subscriptions and Payments</h2>
                    <p className="about-body">
                        Certain features of the Service are billed on a subscription basis ("Premium"). You will be billed in advance on a recurring and periodic basis depending on your plan. 
                        Payments are securely processed via Razorpay or Dodo Payments. Refunds are provided solely at the discretion of AlgoZen management.
                    </p>
                </section>

                <section style={{ marginBottom: '32px' }}>
                    <h2 className="about-section-title">5. Limitation of Liability</h2>
                    <p className="about-body">
                        In no event shall AlgoZen, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.
                    </p>
                </section>

                <section style={{ marginBottom: '32px' }}>
                    <h2 className="about-section-title">6. Contact Information</h2>
                    <p className="about-body">
                        If you have any questions about these Terms, please contact us at: 
                        <br /><strong>algozensupport24@gmail.com</strong> or visit our <a href="/contact-us" style={{ color: '#ff7e5f', textDecoration: 'none', fontWeight: '500' }}>Contact Us</a> page.
                    </p>
                </section>

            </main>
            <Footer />
        </>
    );
}

export default TermsOfUse;
