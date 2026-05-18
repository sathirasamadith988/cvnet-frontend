import { auth } from "@/lib/firebaseConfig";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  GoogleAuthProvider, 
  signInWithPopup,
  updateProfile
} from "firebase/auth";
import axios from "axios";

const API_URL = "http://localhost:5167/api";

export const authService = {
  // 1. Standard Email/Password Signup
  async signUp(firstName: string, lastName: string, email: string, pass: string, role: string, agreement: string) {
    const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
    await updateProfile(userCredential.user, { displayName: `${firstName} ${lastName}` });
    
    const idToken = await userCredential.user.getIdToken();

    // Call backend to sync PostgreSQL and Firestore
    return await axios.post(`${API_URL}/Auth/signup`, {
      uid: userCredential.user.uid,
      email: email,
      firstName: firstName,
      lastName: lastName,
      role: role,
      agreement: agreement 
    }, {
      headers: { Authorization: `Bearer ${idToken}` }
    });
  },

  // 2. RESTORED: Standard Email/Password Login
  async login(email: string, pass: string) {
    // A. Sign in with Firebase first
    const userCredential = await signInWithEmailAndPassword(auth, email, pass);
    
    // B. Get the cryptographically signed ID Token
    const idToken = await userCredential.user.getIdToken();

    // C. Send token to backend for verification and DB sync
    return await axios.post(`${API_URL}/Auth/login`, { idToken });
  },

  // 3. Proper Google Login/Signup logic
  async loginWithGoogle(agreement?: string) {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const idToken = await result.user.getIdToken();

    // Sends token and agreement status to backend for Upsert
    return await axios.post(`${API_URL}/Auth/login`, { 
      idToken,
      agreement: agreement || "Agreed" 
    });
  }
};