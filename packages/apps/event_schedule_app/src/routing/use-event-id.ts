import { useParams } from 'react-router';

export const eventIdParamName = 'id';

export const useEventId = (): string | undefined => {
  const { id } = useParams<{ id: string }>();
  return id;
};
