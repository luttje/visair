export type Member = {
  id: string;
  name: string;
  avatar?: string;
  status?: 'online' | 'offline' | 'away';
  isTyping?: boolean;
  color?: string;
};
