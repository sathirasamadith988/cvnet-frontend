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
  // Enhanced: Standard Email/Password Signup with explicit Error Mapping
  async signUp(firstName: string, lastName: string, email: string, pass: string, role: string, agreement: string) {
    try {
      // A. Register with Firebase
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      
      // 🛑 FIX: Extract the secure ID token from the new Firebase session
      const idToken = await userCredential.user.getIdToken();
      
      // B. Post context data securely via API to your .NET system
      return await axios.post(`${API_URL}/Auth/signup`, {
        uid: userCredential.user.uid,
        email: email,
        firstName: firstName, 
        lastName: lastName,   
        role: role,
        agreement: agreement
      }, {
        // 🛑 FIX: Attach the token to the Authorization header so .NET allows the request
        headers: {
          Authorization: `Bearer ${idToken}`
        }
      });
      
    } catch (error: any) {
      console.error("AuthService Exception Caught:", error);
      
      if (error.response) {
        throw error; 
      } else if (error.code) {
        throw error; 
      }
      
      throw new Error(error.message || "An unknown error occurred during authentication.");
    }
  },

  async login(email: string, pass: string) {
    const userCredential = await signInWithEmailAndPassword(auth, email, pass);
    const idToken = await userCredential.user.getIdToken();
    return await axios.post(`${API_URL}/Auth/login`, { idToken });
  },

  async loginWithGoogle(agreement?: string) {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const idToken = await result.user.getIdToken();

    return await axios.post(`${API_URL}/Auth/login`, { 
      idToken,
      agreement: agreement || "Agreed" 
    });
  }
};