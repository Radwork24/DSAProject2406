import { Link, useNavigate } from 'react-router-dom';

const NAV_ROUTES = {
  Research: '/',
  Features: '/features',
  Pricing: '/pricing',
  'Why AlgoZen': '/why-algozen',
  Team: '/team',
};

function Header() {
  const navigate = useNavigate();
  const navItems = ['Research', 'Features', 'Pricing', 'Why AlgoZen', 'Team'];

  return (
    <header className="site-header">
      <div className="header-content">
        <Link to="/" className="brand">
          <span>AlgoZen</span>
        </Link>

        <nav className="nav-links">
          {navItems.map((item) => (
            <Link to={NAV_ROUTES[item]} key={item}>
              {item}
            </Link>
          ))}
        </nav>

        <button className="btn claude" onClick={() => navigate('/login')}>
          Try AlgoZen
        </button>
      </div>
    </header>
  );
}

export default Header;


