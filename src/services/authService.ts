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
      // A. Create user in Firebase Auth client
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      await updateProfile(userCredential.user, { displayName: `${firstName} ${lastName}` });
      
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
        headers: { Authorization: `Bearer ${idToken}` }
      });
    } catch (error: any) {
      // Cryptographic and auth policy translation map
      if (error.code) {
        switch (error.code) {
          case "auth/email-already-in-use":
            throw new Error("This email address is already registered. Please log in instead.");
          case "auth/invalid-email":
            throw new Error("The email address provided is invalid.");
          case "auth/weak-password":
            throw new Error("Password security threshold not met. Must be at least 6 characters.");
          case "auth/operation-not-allowed":
            throw new Error("Email/Password registration is currently disabled.");
          default:
            throw new Error(error.message);
        }
      }
      throw error;
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