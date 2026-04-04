import { Panel } from '../components/common/Panel';
import { StatusMessage } from '../components/common/StatusMessage';
import { useAppStore } from '../store/useAppStore';

export const HomePage = (): JSX.Element => {
  const preloadStatus = useAppStore((state) => state.preloadStatus);
  const preloadMessage = useAppStore((state) => state.preloadMessage);

  return (
    <section className="page">
      <h2>Главная страница</h2>
      <p className="page__description">Лабораторная работа №7.</p>

      <Panel title="Статус предзагрузки">
        <StatusMessage status={preloadStatus} text={preloadMessage} />
      </Panel>
    </section>
  );
};