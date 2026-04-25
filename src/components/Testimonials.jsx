import './Testimonials.css';

const ROW_1_DATA = [
    {
        name: "Arjun Mehta",
        role: "SDE II at Amazon",
        country: "India",
        quote: "AlgoZen's AI Mock Interviews are the closest thing to a real FAANG interview. The real-time hints forced me to think instead of just giving me the answer. Absolutely brilliant.",
        initials: "AM"
    },
    {
        name: "Sarah Jenkins",
        role: "Software Engineer",
        country: "USA",
        quote: "I used to struggle visualizing graph traversals. The visual intelligence feature here made Dijkstra's algorithm click for me in 10 minutes after weeks of confusion.",
        initials: "SJ"
    },
    {
        name: "David Chen",
        role: "Frontend Developer",
        country: "UK",
        quote: "The progressive hint system is a game-changer. It doesn't spoil the solution; it nudges your intuition. Highly recommend the premium tier.",
        initials: "DC"
    },
    {
        name: "Priya Patel",
        role: "Senior Engineer",
        country: "India",
        quote: "Finally, a DSA platform that prioritizes understanding over rote memorization. The depth of explanations provided by the AI is unparalleled.",
        initials: "PP"
    },
];

const ROW_2_DATA = [
    {
        name: "Michael Ross",
        role: "Backend Dev",
        country: "USA",
        quote: "Passed my Google onsite thanks to the mock interview simulator. It conditioned me to articulate my thoughts while coding under pressure.",
        initials: "MR"
    },
    {
        name: "Elena Rostova",
        role: "Tech Lead",
        country: "UK",
        quote: "We now use AlgoZen's methodology to train our junior engineers. The way it breaks down complex dynamic programming problems is just beautiful.",
        initials: "ER"
    },
    {
        name: "Rahul Verma",
        role: "SDE I",
        country: "India",
        quote: "The interface is so clean and distraction-free. No more hunting for obscure edge cases; the code evaluator catches everything instantly.",
        initials: "RV"
    },
    {
        name: "James Wilson",
        role: "Full Stack Dev",
        country: "USA",
        quote: "I was skeptical about AI interviewers, but the contextual feedback on my time and space complexity was spot on. Worth every penny.",
        initials: "JW"
    },
];

const TestimonialCard = ({ data }) => (
    <div className="testimonial-card">
        <i className="fas fa-quote-left testimonial-quote-icon"></i>
        <p className="testimonial-text">"{data.quote}"</p>
        <div className="testimonial-author">
            <div className="author-avatar">{data.initials}</div>
            <div className="author-info">
                <span className="author-name">{data.name}</span>
                <span className="author-role">{data.role}</span>
                <span className="author-country">{data.country}</span>
            </div>
        </div>
    </div>
);

function Testimonials() {
    // We duplicate the arrays to create a seamless infinite scrolling effect
    const row1 = [...ROW_1_DATA, ...ROW_1_DATA];
    const row2 = [...ROW_2_DATA, ...ROW_2_DATA];

    return (
        <section className="testimonials-section">
            <div className="testimonials-header">
                <p className="eyebrow">Wall of Love</p>
                <h2 className="testimonials-title">Trusted by engineers worldwide</h2>
            </div>

            <div className="marquee-container marquee-row-1">
                {row1.map((item, idx) => (
                    <TestimonialCard key={`r1-${idx}`} data={item} />
                ))}
            </div>

            <div className="marquee-container marquee-row-2">
                {row2.map((item, idx) => (
                    <TestimonialCard key={`r2-${idx}`} data={item} />
                ))}
            </div>
        </section>
    );
}

export default Testimonials;
