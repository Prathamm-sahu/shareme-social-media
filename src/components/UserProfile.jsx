import React, { useEffect, useState } from "react";
import { AiOutlineLogout } from "react-icons/ai";
import { useParams, useNavigate } from "react-router-dom";

import { MasnoryLayout } from "./MasnoryLayout";
import { Spinner } from "./Spinner";
import { useAuthState } from "react-firebase-hooks/auth";
import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import { auth, db } from "../config/firebase";
import { signOut } from "firebase/auth";

const activeBtnStyles =
  "bg-red-500 text-white font-bold p-2 rounded-full w-22 outline-none";
const notActiveBtnStyles =
  "bg-primary mr-4 text-black font-bold p-2 rounded-full w-20 outline-none";
const randomImage =
  "https://source.unsplash.com/1600x900/?nature,photography,technology";

export const UserProfile = () => {
  const [user, setUser] = useState();
  const [pins, setPins] = useState();
  const [text, setText] = useState("Created");
  const [activeBtn, setActiveBtn] = useState("created");
  const navigate = useNavigate();
  const { userId } = useParams();

  const [users] = useAuthState(auth);

  const userDoc = doc(db, "users", userId);

  const pinRef = collection(db, "pin");
  const pinDoc = query(pinRef, where("userId", "==", users?.uid));

  const saveRef = collection(db, 'save');
  const saveDoc = query(saveRef, where('userId', '==', users?.uid));

  const getPins = async () => {
    const data = await getDocs(pinDoc);
    const filteredData = data.docs.map((doc) => ({
      imageUrl: doc.data().imageUrl,
      postId: doc.id,
      userId: doc.data().userId,
      category: doc.data().category,
    }));
    setPins(filteredData);
    // console.log(filteredData);
  }

  const getSavedPins = async() => {

  }

  const getUser = async () => {
    const data = await getDoc(userDoc);
    console.log(data.data());
    setUser(data.data());
    setTimeout(30000)
  };

  const logout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    getUser();
    getPins();
  }, [userId]);

  if (!user) {
    return <Spinner message="Loading Profile" />;
  }

  return (
    <div className="relative pb-2 h-full justify-center items-center">
      <div className="flex flex-col pb-5">
        <div className="relative flex flex-col mb-7">
          <div className="flex flex-col justify-center items-center">
            <img
              className="w-full h-370 2xl:h-510 shadow-lg object-cover"
              src={randomImage}
              alt="user-pic"
            />
            <img
              className="rounded-full w-20 h-20 -mt-10 shadow-xl object-cover"
              src={user?.userPhotoURL}
              alt="user-pic"
            />
            <h1 className="font-bold text-3xl text-center mt-3">
              {user?.displayName}
            </h1>
            <div className="absolute top-0 z-1 right-0 p-2">
              {userId === users?.uid && (
                <button
                  type="button"
                  className=" bg-white p-2 rounded-full cursor-pointer outline-none shadow-md"
                  onClick={logout}
                >
                  <AiOutlineLogout color="red" fontSize={21} />
                </button>
              )}
            </div>
          </div>
          <div className="text-center mb-7">
            <button
              type="button"
              onClick={(e) => {
                setText(e.target.textContent);
                setActiveBtn("created");
              }}
              className={`${
                activeBtn === "created" ? activeBtnStyles : notActiveBtnStyles
              }`}
            >
              Created
            </button>
            <button
              type="button"
              onClick={(e) => {
                setText(e.target.textContent);
                setActiveBtn("saved");
              }}
              className={`${
                activeBtn === "saved" ? activeBtnStyles : notActiveBtnStyles
              }`}
            >
              Saved
            </button>
          </div>
          <div className="px-2">
            <MasnoryLayout pins={pins} />
          </div>
        </div>
        {pins?.length === 0 && (
          <div className="flex justify-center font-bold items-center w-full text-1xl mt-2">
            No Pins Found!
          </div>
        )}
      </div>
    </div>
  );
};
