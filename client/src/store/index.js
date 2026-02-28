import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import documentReducer from './slices/documentSlice';
import notificationsReducer from './slices/notificationsSlice';
import planReducer from './slices/planSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    documents: documentReducer,
    notifications: notificationsReducer,
    plan: planReducer,
  },
});

export default store;
