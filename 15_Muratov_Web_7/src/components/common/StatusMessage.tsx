import type { AsyncStatus } from '../../types/api';

interface StatusMessageProps {
  status: AsyncStatus;
  text: string;
}

const statusClassMap: Record<AsyncStatus, string> = {
  idle: '',
  loading: 'status--loading',
  success: 'status--success',
  error: 'status--error',
  empty: 'status--empty'
};

export const StatusMessage = ({ status, text }: StatusMessageProps): JSX.Element => {
  return <div className={`status ${statusClassMap[status]}`.trim()}>{text}</div>;
};
