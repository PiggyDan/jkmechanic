// Lets any button open the chat widget without sharing React state.
export const OPEN_CHAT_EVENT = 'jk-open-chat'
export const openChat = () => window.dispatchEvent(new Event(OPEN_CHAT_EVENT))
