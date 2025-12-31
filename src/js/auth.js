const AUTH_KEY = 'auth_user';
const USERS_KEY = 'app_users'; //store registered users


export const signup = (email, password) => {
    // 1. Validate email and password
  // 2. Check if user already exists
  // 3. Store user in localStorage (under USERS_KEY)
  // 4. Auto-login after signup
  // 5. Return success/error
}

export const login = (email, password) => {
// 1. Find user in localStorage
  // 2. Check password matches
  // 3. Create session (store in AUTH_KEY)
  // 4. Return success/error
}

export const logout = () => {
    // clear auth from localStorage
}

export const isAuthenticated = () => {
    //  check if user is logged in
    // return boolean
}

export const getCurrentUser = () => {
    // get current logged-in user info
}

