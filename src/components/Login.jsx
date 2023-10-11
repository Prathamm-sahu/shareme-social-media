import { auth, db, googleProvider } from "../config/firebase";
import { signInWithPopup } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import React from "react";
import { FcGoogle } from "react-icons/fc";
import shareVideo from "../assets/share.mp4";
import logoWhite from "../assets/logowhite.png";
import { doc, setDoc } from "firebase/firestore";

export const Login = () => {
  const navigate = useNavigate();

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      await setDoc(doc(db, "users", auth?.currentUser?.uid), {
        userId: auth?.currentUser?.uid,
        userName: auth?.currentUser?.displayName,
        userPhotoUrl: auth?.currentUser?.photoURL,
        userEmail: auth?.currentUser?.email
      })
      navigate("/");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex justify-start items-center flex-col h-screen">
      <div className="relative w-full h-full">
        <video
          className="w-full h-full object-cover"
          src={shareVideo}
          type="video/mp4"
          loop
          controls={false}
          muted
          autoPlay
        />
        <div className="absolute flex flex-col justify-center items-center top-0 right-0 bottom-0 left-0 bg-blackOverlay">
          <div className="p-5">
            <img src={logoWhite} alt="logo" width="130px" />
          </div>

          <div className="shawdow-2xl">
            <button
              type="button"
              className="bg-mainColor mr-4 flex justify-center items-center px-3 py-2 rounded-md cursor-pointer outline-none"
              onClick={signInWithGoogle}
            >
              <FcGoogle className="mr-4" />
              <span className="text-sm">Sign in with Google</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
