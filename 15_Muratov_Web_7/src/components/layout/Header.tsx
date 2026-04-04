import { NavLink } from 'react-router-dom';

const navLinks = [
  { to: '/', label: 'Главная', end: true },
  { to: '/posts', label: 'JSONPlaceholder' },
  { to: '/products', label: 'DummyJSON' },
  { to: '/countries', label: 'REST Countries' }
];

export const Header = (): JSX.Element => {
  return (
    <header className="header">
      <div className="container header__inner">
        <h1 className="header__title">Лабораторная работа №7</h1>
        <nav className="nav" aria-label="Навигация по разделам">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) => `nav__button ${isActive ? 'is-active' : ''}`.trim()}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
};