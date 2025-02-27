import { atom, atomFamily, selectorFamily } from 'recoil';
import type { TConversation } from 'librechat-data-provider';

// 定义基本对话状态
export const conversationAtom = atom<TConversation | null>({
  key: 'conversationState',
  default: null,
});

// 创建对话组对家族
export const conversationFamily = atomFamily<TConversation | null, number>({
  key: 'conversationFamily',
  default: null,
});

// 选择器函数，用于按索引获取对话
export const conversationByIndex = selectorFamily({
  key: 'conversationByIndex',
  get: (index: number) => ({ get }) => {
    return index === 0 ? get(conversationAtom) : get(conversationFamily(index));
  },
  set: (index: number) => ({ set }, newConversation) => {
    if (index === 0) {
      set(conversationAtom, newConversation);
    } else {
      set(conversationFamily(index), newConversation);
    }
  },
});

// 创建消息数组原子
export const messagesAtom = atom({
  key: 'messagesState',
  default: [],
});

export default {
  conversation: conversationAtom,
  conversationByIndex,
  messagesAtom,
};
