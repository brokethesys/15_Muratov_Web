import { type FormEvent, useState } from 'react';

import { CountryCard } from '../components/countries/CountryCard';
import { Panel } from '../components/common/Panel';
import { StatusMessage } from '../components/common/StatusMessage';
import { useAppStore } from '../store/useAppStore';
import type { RegionFilter } from '../types/api';

export const CountriesPage = (): JSX.Element => {
  const countries = useAppStore((state) => state.countries);
  const countriesStatus = useAppStore((state) => state.countriesStatus);
  const countriesError = useAppStore((state) => state.countriesError);
  const loadCountries = useAppStore((state) => state.loadCountries);

  const [region, setRegion] = useState<RegionFilter>('all');
  const [name, setName] = useState('');

  const statusText =
    countriesStatus === 'loading' ? 'Загрузка стран...' :
    countriesStatus === 'error' ? (countriesError ?? 'Ошибка загрузки стран') :
    countriesStatus === 'empty' ? 'Страны не найдены' :
    countriesStatus === 'success' ? `Загружено стран: ${countries.length}.` :
    'Выберите регион и загрузите данные';

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    await loadCountries(region, name);
  };

  return (
    <section className="page">
      <h2>API 3: REST Countries</h2>
      <p className="page__description">Загрузка стран по региону или по названию (GET).</p>

      <Panel>
        <form className="form form--inline" onSubmit={(event) => { void handleSubmit(event); }}>
          <label>
            Регион
            <select
              name="region"
              value={region}
              onChange={(event) => { setRegion(event.target.value as RegionFilter); }}
            >
              <option value="all">Все</option>
              <option value="europe">Европа</option>
              <option value="asia">Азия</option>
              <option value="africa">Африка</option>
              <option value="americas">Америка</option>
              <option value="oceania">Океания</option>
            </select>
          </label>

          <label>
            Название (необязательно)
            <input
              name="name"
              type="text"
              placeholder="например: russia"
              value={name}
              onChange={(event) => { setName(event.target.value); }}
            />
          </label>

          <button className="btn" type="submit">Загрузить</button>
        </form>

        <StatusMessage status={countriesStatus} text={statusText} />

        <div className="cards">
          {countries.map((country) => (
            <CountryCard key={country.name.common} country={country} />
          ))}
        </div>
      </Panel>
    </section>
  );
};

