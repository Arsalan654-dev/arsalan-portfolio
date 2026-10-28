import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  lang: 'en'
};

const langSlice = createSlice({
  name: 'lang',
  initialState,
  reducers: {
    hydrate: (state, action) => {
      state.lang = action.payload.lang;
    },
    setLanguage: (state, action) => {
      state.lang = action.payload;
      localStorage.setItem('lang', action.payload);
      document.documentElement.lang = action.payload;
      document.documentElement.dir = action.payload === 'ar' ? 'rtl' : 'ltr';
      import('@/i18n/config').then((mod) => mod.default.changeLanguage(action.payload));
    }
  }
});

export const { hydrate, setLanguage } = langSlice.actions;
export default langSlice.reducer;
