'use client';
import { useSelector, useDispatch } from 'react-redux';
import { toggleTheme, setTheme } from '../redux/slices/themeSlice';

export const useTheme = () => {
  const dispatch = useDispatch();
  const theme = useSelector((state) => state.theme.theme);

  return { theme, toggleTheme: () => dispatch(toggleTheme()), setTheme: (t) => dispatch(setTheme(t)) };
};
