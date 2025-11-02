import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing Supabase environment variables. Make sure REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY are set in .env')
}
export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '')

// Authentication helper functions
export const auth = {
  // Get current user
  getCurrentUser: async () => {
    console.log("Fetching current user... apart of authy component");
    try {
        const { data: { user }, error } = await supabase.auth.getUser(); // getUser() safer
        if (error) {
            console.error('Error fetching user:', error);
            return null;
        }
        return user;
    } catch (err) {
        console.error('Exception in getCurrentUser:', err);
        return null;
    }
  },

  // Sign in with email/password
  signInWithEmail: async (email, password) => {
    console.log("Signing in with password, authy.js, ${email}");
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
    return data
  },

  refreshSession: async () => {
    console.log("Refreshing auth session...");
    const { data: { session }, error } = await supabase.auth.refreshSession();
    if (error) {
      console.error('Error refreshing session:', error);
      throw error;
    }
    return session;
  },

  // Sign in with magic link
  signInWithOtp: async (email) => {
    const { data, error } = await supabase.auth.signInWithOtp({
      email,
    })
    if (error) throw error
    return data
  },

  // Sign out
  signOut: async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    // Force reload to clear any cached auth state
    window.location.href = '/'
  },

  // Get session
  getSession: async () => {
    console.log("Getting session info...");
    const { data: { session }, error } = await supabase.auth.getSession()
    if (error) throw error
    return session
  },

  // Listen to auth changes
  onAuthStateChange: (callback) => {
    console.log("Setting up auth state change listener...");
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => callback(session)
    )
    return subscription
  },

  createNextUser: async () => {
    // Try to read latest email to compute next numeric address (best-effort)
    let latestEmail = '';
    try {
      const { data, error } = await supabase
        .from('users')
        .select('email')
        .order('created_at', { ascending: false })
        .limit(1);
      if (!error && data && data.length) latestEmail = data[0].email || '';
    } catch (err) {
      console.warn('Error fetching latest user email:', err?.message || err);
    }

    const match = (latestEmail || '').match(/user(\d+)@gmail\.com/);
    let nextEmail;
    if (match) {
      const currentNum = parseInt(match[1], 10);
      const nextNum = currentNum + 1;
      nextEmail = `user${String(nextNum).padStart(3, '0')}@gmail.com`;
    } else {
      nextEmail = 'user001@gmail.com';
    }

    // Generate client-side password (safe to do in browser)
    const randomPassword = Math.random().toString(36).slice(-8);

    // Return credentials only — creating a Supabase admin user must be done server-side
    return { email: nextEmail, password: randomPassword };
  },

  sendToAuth: async (email, password) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password
    });
    if (error) throw error;
    console.log("DATA IS EVERYWHERE", data);
    return data;
  },

  sendToBucket: async (filePath, file) => { // hit using auth.sendToBucket(`${file.name}`, file);
    console.log("[DEBUG] Uploading file, creds: ", filePath, file);
    const { data, error } = await supabase
      .storage
      .from('user-images')
      .upload(filePath, file);
    if (error) throw error;

    console.log("[DEBUG] Successfully uploaded photo to bucket: ", data);
    console.log("Now fetching public URL...");

    // we also want the image URL
    const imageUrl = `${supabase.storage.from('user-images').getPublicUrl(filePath)}`;
    console.log(imageUrl);
    return { ...data, imageUrl }; // this will be received via using auth.sendToBucket().imageUrl
  }

}

export default supabase
