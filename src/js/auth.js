import * as storage from './storage.js';


// const AUTH_KEY = 'auth_user';
// const USERS_KEY = 'app_users'; //store registered users


export const signup = (email, password) => {
    // 1. Validate email and password
    if(!email || !password){
        return {
            success: false,
            message: 'Email and password are required'
        };
    }
    if(!isValidEmail(email)){
        return {
            success: false,
            message: 'Invalid email address'
        };
    }
    if(!isValidPassword(password)){
        return {
            success: false,
            message: 'Password must be at least 8 characters long'
        };
    }

    // 2. Check if user already exists
    const users = storage.loadUsers();
    const existingUser = users.find(user => user.email.toLowerCase() === email.toLowerCase());

    if(existingUser){
        return {
            success: false,
            message: 'An account with this email already exists.'
        };
    }

    // 3. Create new user object
    const newUser = {
        id: `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`,
        email: email.toLowerCase().trim(),
        password: password,
        createdAt: new Date().toISOString()
    };
    // 4. Store user in localStorage
    users.push(newUser);
    const saveResult = storage.saveUsers(users);

    if(!saveResult.success){
        return {
            success: false,
            message: saveResult.message || 'Failed to create account. Please try again.'
        };
    }

  // 5. Auto-login after signup
  const authData = {
    userId: newUser.id,
    email: newUser.email,
    loggedInAt: new Date().toISOString(),
  }

  const authResult = storage.saveAuth(authData);
  if(!authResult.success){
    return {
        success: false,
        message: authResult.message || 'Failed to login after signup. Please try again.'
    };
  }

  return {
    success: true,
    message: 'Account created successfully!',
    user: authData
  };
};

export const login = (email, password) => {
    // 1. Validate email and password
    if(!email || !password){
        return {
            success: false,
            message: 'Email and password are required'
        };
    }
   // 2. Find user in localStorage
   const users = storage.loadUsers();

    // convert to array

   const user = users.find(user => user.email.toLowerCase() === email.toLowerCase());
   if(!user){
    return {
        success: false,
        message: 'Invalid email or password'
    };
   }

  // 3. Check password matches
   if(user.password !== password){
    return {
        success: false,
        message: 'Invalid email or password.'
    };
   }

  // 4. Create session (store in AUTH_KEY)
  const authData = {
    userId: user.id,
    email: user.email,
    loggedInAt: new Date().toISOString()
  }

  const authResult = storage.saveAuth(authData);

  if(!authResult.success){
    return {
        success: false,
        message: authResult.message || 'Login failed. Please try again.'
    };
  }

  return {
    success: true,
    message: 'Login successful!',
    user: authData
  };
}


export const logout = () => {
    // clear auth from localStorage
    const result = storage.clearAuth();
    return result;
}

export const isAuthenticated = () => {
    //  check if user is logged in
    const authData = storage.loadAuth();

    if(!authData){
        return false;
    }
    

    return !!authData.userId && !!authData.email;
}

export const getCurrentUser = () => {
    // get current logged-in user info
    if(!isAuthenticated()){
        return null;
    }

    const authData = storage.loadAuth();
    const users = storage.loadUsers();
    const user = users.find(user => user.id === authData.userId);

    if(!user){
        return null;
    }

    // return user info
    return {
        id: user.id,
        email: user.email,
        createdAt: user.createdAt,
        loggedInAt: authData.loggedInAt
    }
}

export const changePassword = (currentPassword, newPassword) => {
    // validate inputs
    if(!currentPassword || !newPassword){
        return {
            success: false,
            message: 'Current password and new password are required'
        };
    }

    if(!isValidPassword(newPassword)){
        return {
            success: false,
            message: 'New password must be at least 8 characters long'
        }
    }

    // get current user
    const authData = storage.loadAuth();
    if(!authData || !authData.userId){
        return {
            success: false,
            message: 'You must be logged in to change password'
        }
    }

    // get user from storage
    const users = storage.loadUsers();
    const user = users.find(user => user.id === authData.userId);
    if(!user){
        return {
            success: false,
            message: 'User not found'
        };
    }

    // check if current password matches
    if(user.password !== currentPassword){
        return {
            success: false,
            message: 'Current password is incorrect'
        };
    }

    // check if new password is the same as current password
    if(user.password === newPassword){
        return {
            success: false,
            message: 'New password cannot be the same as current password'
        };
    }

    // update password
    user.password = newPassword;
    const saveResult = storage.saveUsers(users);
    if(!saveResult.success){
        return {
            success: false,
            message: saveResult.message || 'Failed to change password. Please try again.'
        };
    }

    // update auth data
    authData.password = newPassword;
    const authResult = storage.saveAuth(authData);
    if(!authResult.success){
        return {
            success: false,
            message: authResult.message || 'Failed to change password. Please try again.'
        };
    }

    return {
        success: true,
        message: 'Password changed successfully!'
    };
}


// === helper functions ===

// validate email format
const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// validate password strength (min 8 characters)
const isValidPassword = (password) => {
    return password.length >= 8;
}

// hash password using bcrypt
