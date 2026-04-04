import type { Country } from '../../types/api';

interface CountryCardProps {
  country: Country;
}

export const CountryCard = ({ country }: CountryCardProps): JSX.Element => {
  const countryName = country.name?.common ?? 'Без названия';
  const capital = Array.isArray(country.capital) && country.capital.length ? country.capital.join(', ') : 'Нет данных';

  return (
    <article className="card country-card">
      <img
        className="flag"
        src={country.flags?.png ?? ''}
        alt={`Флаг ${countryName}`}
      />
      <div>
        <h4>{countryName}</h4>
        <p>Столица: {capital}</p>
        <div className="card__meta">
          <span className="tag">Регион: {country.region ?? 'Нет данных'}</span>
          <span className="tag">Население: {country.population?.toLocaleString('ru-RU') ?? 'Нет данных'}</span>
        </div>
      </div>
    </article>
  );
};
