export function getCommunityAvatar(id: number): string {
  const avatarURL = import.meta.env.VITE_AVATAR;
  return `${avatarURL}/namespace/${id}/${Date.now()}/avatar`;
}
