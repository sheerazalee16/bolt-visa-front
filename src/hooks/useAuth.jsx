import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  loadUsersFromStorage,
  loadCurrentUserFromStorage,
  saveCurrentUserToStorage,
  removeCurrentUserFromStorage,
  getStoredUsers,
  saveUsersToStorage,
  saveLoginHistory,
  generateAvatarUrl
} from '@/services/authService';
import { loginUser } from '../apis/user/authentication';
import { registerUser } from '../apis/admin/registerUser';
import { editUser } from '../apis/admin/registerUser';
import { fetchAllUsers } from '../apis/admin/registerUser';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const _loadData = useCallback(async () => {
    setLoading(true);
    try {
      const existingUsers = await fetchAllUsers();
      console.log('existingUsers ', existingUsers)
      if (existingUsers?.data?.data?.users && existingUsers?.success) {
        localStorage.setItem('bolt_visa_users', JSON.stringify(existingUsers?.data?.data?.users));

      }
      const storedUsers = await loadUsersFromStorage();
      setUsers(storedUsers);
      const storedCurrentUser = await loadCurrentUserFromStorage();
      setCurrentUser(storedCurrentUser);

      console.log('storedCurrentUser ', storedUsers)
      // console.log('storedUsers ', storedUsers)
      // if (storedCurrentUser) {
      //   const userFromList = storedUsers.find(u => u.id === storedCurrentUser.userId);
      //   console.log('userFromList ', userFromList)
      //   if (userFromList) {
      //     // setCurrentUser(prev => JSON.stringify(prev) !== JSON.stringify(userFromList) ? userFromList : prev);
      //     setCurrentUser(userFromList);
      //     console.log('user fetch hua')
      //   } else {
      //     // setCurrentUser(null);
      //     console.log('current user null 1')
      //     // removeCurrentUserFromStorage();
      //   }
      // } else {
      //   // setCurrentUser(null);
      //   console.log('current user null 2')
      // }
    } catch (error) {
      console.error("Error loading data from authService:", error);
      setUsers([]);
      setCurrentUser(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    _loadData();
  }, [_loadData]);

  const refreshUsers = useCallback(() => {
    _loadData();
  }, [_loadData]);

  const login = useCallback(async (email, password, deviceType = 'web') => {
    setLoading(true);
    try {
      const response = await loginUser(email, password, deviceType);
      console.log('response... ', response)
      if (response.status && response.data && response?.data?.token) {
        localStorage.setItem('bolt_visa_token', response?.data?.token);
        saveCurrentUserToStorage(response.data);
        setCurrentUser(response.data);
        saveLoginHistory(response.data);
        setLoading(false);
        return { success: true, user: response.data };
      } else {
        setLoading(false);
        throw new Error(response.message || 'Invalid credentials.');
      }
    } catch (err) {
      setLoading(false);
      throw new Error(err.message || 'Invalid credentials. Please check your email and password.');
    }
  }, []);

  const logout = useCallback(() => {
    setCurrentUser(null);

    removeCurrentUserFromStorage();
  }, []);

  const addUser = useCallback(async (userData) => {
    const currentUsers = getStoredUsers();
    if (currentUsers.some(u => u.email === userData.email)) {
      return { success: false, error: 'Email already exists.' };
    }
    try {
      const result = await registerUser(userData)
      console.log('result ', result)
      if (result.status) {
        const updatedUsers = [...currentUsers, result.data];
        saveUsersToStorage(updatedUsers);
        refreshUsers();
        return { success: result.status, user: result.data };

      }

    } catch (err) {
      return { success: result.status };
    }
  }, [refreshUsers]);

  const updateUser = useCallback(async (userId, updates) => {
    try {
      const response = await editUser(updates)
      if (response.status) {

        // await saveCurrentUserToStorage(response.data);
        refreshUsers();
        return { success: response.status, message: response.message };
      }
      else {
        return { success: response.status, message: response.message };
      }

    }
    catch (err) {
      console.log('err ', err)

    }

    // const userIndex = currentUsers.findIndex(u => u.id === userId);

    // if (userIndex === -1) {
    //   return { success: false, error: 'User not found.' };
    // }

    // const oldUserData = currentUsers[userIndex];
    // let updatedUser = { ...oldUserData, ...updates };

    // if (!updates.newPassword || updates.password === '') {
    //   updatedUser.newPassword = oldUserData.password;
    // }

    // if (updates.avatar && typeof updates.avatar === 'string') {
    //   updatedUser.avatar = updates.avatar;
    // } else if (!updates.avatar && updates.name && oldUserData.name !== updates.name) {
    //   updatedUser.avatar = generateAvatarUrl(updates.name);
    // } else if (!updates.avatar) {
    //   updatedUser.avatar = oldUserData.avatar;
    // }
    // here 

    // currentUsers[userIndex] = updatedUser;
    // saveUsersToStorage(currentUsers);

    // if (currentUser && currentUser.id === userId) {
    //   setCurrentUser(updatedUser);
    //   console.log('current user null 6')

    //   saveCurrentUserToStorage(updatedUser);
    // }
  }, [refreshUsers]);

  const deleteUser = useCallback((userId) => {
    let currentUsers = getStoredUsers();
    const userToDelete = currentUsers.find(u => u.id === userId);

    if (!userToDelete) {
      return { success: false, error: 'User not found.' };
    }
    if (userToDelete.role === 'Admin' && currentUsers.filter(u => u.role === 'Admin').length <= 1) {
      return { success: false, error: 'Cannot delete the last admin account.' };
    }

    const updatedUsers = currentUsers.filter(u => u.id !== userId);

    saveUsersToStorage(updatedUsers);
    refreshUsers();
    return { success: true };
  }, [refreshUsers]);

  const contextValue = useMemo(() => ({
    user: currentUser,
    users,
    loading,
    login,
    logout,
    addUser,
    updateUser,
    deleteUser,
    isAdmin: currentUser?.role == "Admin",
    refreshUsers
  }), [currentUser, users, loading, login, logout, addUser, updateUser, deleteUser, refreshUsers]);
  console.log('current user ', currentUser)
  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined || context === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};