'use client';
import { useSelector, useDispatch } from 'react-redux';
import { setLanguage } from '../redux/slices/langSlice';
import { useTranslation } from 'react-i18next';

export const useLanguage = () => {
  const dispatch = useDispatch();
  const lang = useSelector((state) => state.lang.lang);
  const { i18n } = useTranslation();

  const changeLanguage = (lng) => {
    dispatch(setLanguage(lng));
    i18n.changeLanguage(lng);
  };

  return { lang, changeLanguage };
};
