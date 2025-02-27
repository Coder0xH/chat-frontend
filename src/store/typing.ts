import { atom, selectorFamily } from 'recoil';

// 打字状态原子
export const typingAtom = atom({
  key: 'typingState',
  default: false,
});

// 按索引的打字状态
export const typingFamily = selectorFamily({
  key: 'typingFamily',
  get: (index: number) => ({ get }) => {
    return get(typingAtom);
  },
  set: (index: number) => ({ set }, isTyping) => {
    set(typingAtom, isTyping);
  },
});

export default {
  typing: typingAtom,
  typingFamily,
};
