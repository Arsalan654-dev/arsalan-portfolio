import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import userService from '../../services/userService';

export const fetchCart = createAsyncThunk('cart/fetch', async (_, { rejectWithValue }) => {
  try {
    const res = await userService.getCart();
    return res.data?.data || res.data || [];
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to load cart');
  }
});

export const addToCartAPI = createAsyncThunk('cart/addToCart', async ({ itemId, itemType }, { rejectWithValue }) => {
  try {
    const res = await userService.addToCart({ itemId, itemType });
    return res.data?.data || res.data || [];
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to add to cart');
  }
});

export const removeFromCartAPI = createAsyncThunk('cart/removeFromCart', async (itemId, { rejectWithValue }) => {
  try {
    const res = await userService.removeFromCart(itemId);
    return res.data?.data || res.data || [];
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to remove from cart');
  }
});

export const updateCartQuantityAPI = createAsyncThunk('cart/updateQuantity', async ({ id, quantity }, { rejectWithValue }) => {
  try {
    const res = await userService.updateCartQuantity(id, { quantity });
    return res.data?.data || res.data || [];
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to update quantity');
  }
});

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: [],
    loading: false,
    error: null
  },
  reducers: {
    clearCart: (state) => {
      state.items = [];
    },
    setCart: (state, action) => {
      state.items = action.payload;
      state.loading = false;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchCart.fulfilled, (state, action) => { state.items = action.payload; state.loading = false; })
      .addCase(fetchCart.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(addToCartAPI.fulfilled, (state, action) => { state.items = action.payload; })
      .addCase(addToCartAPI.rejected, (state, action) => { state.error = action.payload; })
      .addCase(removeFromCartAPI.fulfilled, (state, action) => { state.items = action.payload; })
      .addCase(removeFromCartAPI.rejected, (state, action) => { state.error = action.payload; })
      .addCase(updateCartQuantityAPI.fulfilled, (state, action) => { state.items = action.payload; })
      .addCase(updateCartQuantityAPI.rejected, (state, action) => { state.error = action.payload; });
  }
});

export const { clearCart, setCart } = cartSlice.actions;
export default cartSlice.reducer;
