import { type FormEvent, useMemo, useState } from 'react';

import { Panel } from '../components/common/Panel';
import { StatusMessage } from '../components/common/StatusMessage';
import { PostCard } from '../components/posts/PostCard';
import { useAppStore } from '../store/useAppStore';
import type { AsyncStatus } from '../types/api';

const statusTextByType = (
  status: AsyncStatus,
  error: string | null,
  count: number,
  emptyText: string,
  successText: string,
  idleText: string,
  loadingText: string
): string => {
  if (status === 'loading') {
    return loadingText;
  }

  if (status === 'error') {
    return error ?? 'Не удалось получить данные.';
  }

  if (status === 'empty') {
    return emptyText;
  }

  if (status === 'success') {
    return `${successText}: ${count}.`;
  }

  return idleText;
};

export const PostsPage = (): JSX.Element => {
  const posts = useAppStore((state) => state.posts);
  const hiddenPostIds = useAppStore((state) => state.hiddenPostIds);
  const postsStatus = useAppStore((state) => state.postsStatus);
  const postsError = useAppStore((state) => state.postsError);

  const loadPosts = useAppStore((state) => state.loadPosts);
  const createPostAction = useAppStore((state) => state.createPostAction);
  const patchPostTitleAction = useAppStore((state) => state.patchPostTitleAction);
  const deletePostAction = useAppStore((state) => state.deletePostAction);

  const visiblePosts = useMemo(
    () => posts.filter((post) => !hiddenPostIds.includes(post.id)),
    [hiddenPostIds, posts]
  );

  const [createStatus, setCreateStatus] = useState<AsyncStatus>('idle');
  const [createMessage, setCreateMessage] = useState('Заполните форму и отправьте POST-запрос.');
  const [createResult, setCreateResult] = useState('');

  const [patchStatus, setPatchStatus] = useState<AsyncStatus>('idle');
  const [patchMessage, setPatchMessage] = useState('Введите ID и новый заголовок.');
  const [patchResult, setPatchResult] = useState('');

  const [deleteStatus, setDeleteStatus] = useState<AsyncStatus>('idle');
  const [deleteMessage, setDeleteMessage] = useState('Введите ID поста для удаления.');
  const [deleteResult, setDeleteResult] = useState('');

  const handleCreateSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const title = String(formData.get('title') ?? '').trim();
    const body = String(formData.get('body') ?? '').trim();

    setCreateStatus('loading');
    setCreateMessage('Отправка POST-запроса...');
    setCreateResult('');

    try {
      const createdPost = await createPostAction({ title, body, userId: 1 });
      setCreateStatus('success');
      setCreateMessage('Пост создан (тестовый ответ API).');
      setCreateResult(JSON.stringify(createdPost, null, 2));
      event.currentTarget.reset();
    } catch (error) {
      setCreateStatus('error');
      setCreateMessage(error instanceof Error ? error.message : 'Ошибка создания поста.');
    }
  };

  const handlePatchSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const postId = Number.parseInt(String(formData.get('id') ?? ''), 10);
    const title = String(formData.get('title') ?? '').trim();

    if (!Number.isInteger(postId) || postId <= 0) {
      setPatchStatus('error');
      setPatchMessage('ID должен быть положительным числом.');
      return;
    }

    setPatchStatus('loading');
    setPatchMessage('Отправка PATCH-запроса...');
    setPatchResult('');

    try {
      const updatedPost = await patchPostTitleAction(postId, title);
      setPatchStatus('success');
      setPatchMessage(`Пост #${postId} обновлён (тестовый ответ API).`);
      setPatchResult(JSON.stringify(updatedPost, null, 2));
      event.currentTarget.reset();
    } catch (error) {
      setPatchStatus('error');
      setPatchMessage(error instanceof Error ? error.message : 'Ошибка обновления поста.');
    }
  };

  const handleDeleteSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const postId = Number.parseInt(String(formData.get('id') ?? ''), 10);

    if (!Number.isInteger(postId) || postId <= 0) {
      setDeleteStatus('error');
      setDeleteMessage('ID должен быть положительным числом.');
      return;
    }

    setDeleteStatus('loading');
    setDeleteMessage('Отправка DELETE-запроса...');
    setDeleteResult('');

    try {
      const deletedResponse = await deletePostAction(postId);
      setDeleteStatus('success');
      setDeleteMessage(`Пост #${postId} удалён и скрыт из списка.`);
      setDeleteResult(JSON.stringify(deletedResponse, null, 2));
      event.currentTarget.reset();
      await loadPosts();
    } catch (error) {
      setDeleteStatus('error');
      setDeleteMessage(error instanceof Error ? error.message : 'Ошибка удаления поста.');
    }
  };

  return (
    <section className="page">
      <h2>API 1: JSONPlaceholder</h2>
      <p className="page__description">Методы GET, POST, PATCH, DELETE.</p>

      <div className="panel-grid">
        <Panel title="GET: список постов">
          <button className="btn" type="button" onClick={() => { void loadPosts(); }}>
            Загрузить посты
          </button>
          <StatusMessage
            status={postsStatus}
            text={statusTextByType(
              postsStatus,
              postsError,
              visiblePosts.length,
              'Посты не найдены',
              'Загружено постов',
              'Нажмите кнопку для загрузки данных',
              'Загрузка постов...'
            )}
          />
          <div className="cards">
            {visiblePosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </Panel>

        <Panel title="POST: создать пост">
          <form className="form" onSubmit={(event) => { void handleCreateSubmit(event); }}>
            <label>
              Заголовок
              <input name="title" type="text" required minLength={3} maxLength={100} />
            </label>
            <label>
              Текст
              <textarea name="body" required minLength={5} maxLength={300} />
            </label>
            <button className="btn" type="submit">Создать</button>
          </form>
          <StatusMessage status={createStatus} text={createMessage} />
          <pre className="code">{createResult}</pre>
        </Panel>

        <Panel title="PATCH: обновить заголовок">
          <form className="form" onSubmit={(event) => { void handlePatchSubmit(event); }}>
            <label>
              ID поста
              <input name="id" type="number" min={1} required />
            </label>
            <label>
              Новый заголовок
              <input name="title" type="text" required minLength={3} maxLength={100} />
            </label>
            <button className="btn" type="submit">Обновить</button>
          </form>
          <StatusMessage status={patchStatus} text={patchMessage} />
          <pre className="code">{patchResult}</pre>
        </Panel>

        <Panel title="DELETE: удалить пост">
          <form className="form form--inline" onSubmit={(event) => { void handleDeleteSubmit(event); }}>
            <label>
              ID поста
              <input name="id" type="number" min={1} required />
            </label>
            <button className="btn btn--danger" type="submit">Удалить</button>
          </form>
          <StatusMessage status={deleteStatus} text={deleteMessage} />
          <pre className="code">{deleteResult}</pre>
        </Panel>
      </div>
    </section>
  );
};

