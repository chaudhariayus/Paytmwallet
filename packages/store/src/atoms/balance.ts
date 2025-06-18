
import { atom, selector } from "recoil";

export const balanceAtom = atom<number>({
  key: "balanceAtom",
  default: 0,
});

export const usebalance = selector({
  key: "usebalance",
  get: ({ get }) => {
    const balance = get(balanceAtom);
    return balance;
  },
});
