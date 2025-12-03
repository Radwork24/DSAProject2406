function Header() {
  const navItems = ['Research', 'Features', 'Pricing', 'Why AlgoZen', 'Team'];

  return (
    <header className="site-header">
      <div className="header-content">
        <a href="/" className="brand">
          <span>AlgoZen</span>
        </a>

        <nav className="nav-links">
          {navItems.map((item) => (
            <a href="/" key={item}>
              {item}
            </a>
          ))}
        </nav>

        <button className="btn claude">Try AlgoZen</button>
      </div>
    </header>
  );
}

export default Header;

