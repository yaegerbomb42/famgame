import { useGameStore } from '../store/useGameStore';

export const useGame = () => {
    const store = useGameStore();
    return store;
};