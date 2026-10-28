import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import themeReducer from './slices/themeSlice';
import langReducer from './slices/langSlice';
import cartReducer from './slices/cartSlice';
import wishlistReducer from './slices/wishlistSlice';
import pendingActionsReducer from './slices/pendingActionsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    theme: themeReducer,
    lang: langReducer,
    cart: cartReducer,
    wishlist: wishlistReducer,
    pendingActions: pendingActionsReducer
  }
});
