import type { Post } from '../../types/api';

interface PostCardProps {
  post: Post;
}

export const PostCard = ({ post }: PostCardProps): JSX.Element => {
  return (
    <article className="card">
      <h4>#{post.id} {post.title}</h4>
      <p>{post.body}</p>
    </article>
  );
};
