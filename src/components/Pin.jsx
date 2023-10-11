import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MdDownloadForOffline } from "react-icons/md";
import { AiTwotoneDelete } from "react-icons/ai";
import { BsFillArrowUpRightCircleFill } from "react-icons/bs";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../config/firebase";
import {
  getDocs,
  collection,
  query,
  where,
  or,
  updateDoc,
  doc,
  arrayUnion,
  addDoc,
  getDoc,
  deleteDoc,
  writeBatch,
} from "firebase/firestore";

export const Pin = ({ pin: { imageUrl, postId, category, userId } }) => {
  const [postHovered, setPostHovered] = useState(false);
  const [saveAmount, setSaveAmount] = useState(null);

  //Navigate Hook
  const navigate = useNavigate();

  // Current user details
  const [user] = useAuthState(auth);
  
  // Save collection reference
  const saveRef = collection(db, "save");
  const saveDoc = query(saveRef, where("postId", "==", postId));

  // Comment Collection reference
  const commentRef = collection(db, 'comment')
  const commentDoc = query(commentRef, where("postId", "==", postId))

  const getSave = async () => {
    const data = await getDocs(saveDoc);
    setSaveAmount(
      data.docs.map((doc) => ({ userId: doc.data().userId, postId: doc.data().postId, category: doc.data().category }))
    );
  };

  const savePin = async () => {
    try {
      const newDoc = await addDoc(saveRef, {
        userId: user?.uid,
        postId: postId,
        category: category,
      });
      if (user) {
        setSaveAmount((prev) =>
          prev
            ? [...prev, { userId: user?.uid, postId: postId }]
            : [{ userId: user?.uid, postId: newDoc.id }]
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const removeSave = async () => {
    try {
      const saveToDeleteQuery = query(
        saveRef,
        where("postId", "==", postId),
        where("userId", "==", user.uid)
      );
      const saveToDeleteData = await getDocs(saveToDeleteQuery);
      const saveToDelete = doc(db, "save", saveToDeleteData.docs[0].id);
      await deleteDoc(saveToDelete);

      if (user) {
        setSaveAmount(
          (prev) =>
            prev &&
            prev.filter((like) => like.likeId === saveToDeleteData.docs[0].id)
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const hasUserSaved = saveAmount?.find((save) => save.userId === user?.uid);



  // If we delete a pin then all the save and comments related to that pin should be deleted
  // Blog Link :- https://hemanta.io/delete-multiple-documents-from-firestore/

  const deleteAllSaveRelateToPin = async () => {
    const batch = writeBatch(db);
    const allSaveDocToDelete = await getDocs(saveDoc)

    allSaveDocToDelete.forEach((doc) => batch.delete(doc.ref))
    await batch.commit()
  }

  const deleteAllCommentsRelateToPin = async() => {
    const batch = writeBatch(db);
    const allCommentDocToDelete  = await getDocs(commentDoc) 

    allCommentDocToDelete.forEach((doc) => batch.delete(doc.ref))
    await batch.commit()
  }

  const deletePin = async (id) => {
    try {
      const pinToDelete = doc(db, "pin", id);
      await deleteDoc(pinToDelete);

      deleteAllSaveRelateToPin()
      deleteAllCommentsRelateToPin()
      window.location.reload();

    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    getSave();
  }, []);

  
  return (
    <div className="m-2">
      <div
        onMouseEnter={() => setPostHovered(true)}
        onMouseLeave={() => setPostHovered(false)}
        onClick={() => navigate(`/pin-detail/${postId}`)}
        className="relative cursor-zoom-in w-auto hover:shadow-lg rounded-lg overflow-hidden transition-all duration-500 ease-in-out"
      >
        <img src={imageUrl} alt="user-posts" className="rounded-lg w-full " />
        {postHovered && (
          <div
            className="absolute top-0 w-full h-full flex flex-col justify-between p-1 pr-2 pt-2 pb-2 z-50"
            style={{ height: "100%" }}
          >
            <div className="flex items-center justify-between">

              {/* download option of image  */}
              <div className="flex gap-2">
                <a
                  href={`${imageUrl}?dl=`}
                  download
                  onClick={(e) => e.stopPropagation()}
                  className="bg-white w-9 h-9 p-2 rounded-full flex items-center justify-center text-dark text-xl opacity-75 hover:opacity-100 hover:shadow-md outline-none"
                >
                  <MdDownloadForOffline />
                </a>
              </div>

              {/* Save Button */}
              {hasUserSaved ? (
                <button
                  type="button"
                  className="bg-red-500 opacity-70 hover:opacity-100 text-white font-bold px-5 py-1 text-base rounded-3xl hover:shadow-md outline-none"
                  onClick={(e) => {
                    e.stopPropagation()
                    removeSave()
                  }}
                >
                  {saveAmount && saveAmount?.length} Saved
                </button>
              ) : (
                <button
                  type="button"
                  className="bg-red-500 opacity-70 hover:opacity-100 text-white font-bold px-5 py-1 text-base rounded-3xl hover:shadow-md outline-none"
                  onClick={(e) => {
                    e.stopPropagation();
                    savePin();
                  }}
                >
                  {saveAmount && saveAmount?.length!== 0 && saveAmount?.length}Save
                </button>
              )}
            </div>

            {/* image url button to visit image url */}
            <div className="flex justify-between items-center gap-2 w-full text-sm">
              {imageUrl && (
                <a
                  href={imageUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-white flex items-center gap-2 text-black font-bold p-1 pl-4 pr-4 rounded-full opacity-70 hover:opacity-100 hover:shadow-md"
                  onClick={(e) => e.stopPropagation()}
                >
                  <BsFillArrowUpRightCircleFill />
                  {imageUrl.length > 20
                    ? imageUrl.slice(8, 20)
                    : imageUrl.slice(8)}
                </a>
              )}
              {userId === user?.uid && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    deletePin(postId);
                  }}
                  className="bg-white p-2 rounded-full w-8 h-8 flex items-center justify-center text-dark opacity-75 hover:opacity-100 outline-none"
                >
                  <AiTwotoneDelete />
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Link to User Profile */}
      {user?.uid &&
        <Link
        to={`user-profile/${user?.uid}`}
        className="flex gap-2 mt-2 items-center"
      >
        <img
          className="w-8 h-8 rounded-full object-cover"
          src={user.uid}
          alt="user-profile"
        />
        <p className="font-semibold capitalize text-sm">{user.displayName}</p>
      </Link>
      }
      
    </div>
  );
};