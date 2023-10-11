import { useState, useEffect } from "react";
import { MdDownloadForOffline } from "react-icons/md";
import { Link, useParams } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { auth, db } from "../config/firebase";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  where,
  addDoc,
  query,
} from "firebase/firestore";

import { MasnoryLayout } from "./MasnoryLayout";
import { Spinner } from "./Spinner";
import { useAuthState } from "react-firebase-hooks/auth";

export const PinDetail = () => {
  const { pinId } = useParams();
  const [morePins, setMorePins] = useState();
  const [pinDetail, setPinDetail] = useState();
  const [pinComments, setPinComments] = useState();
  const [comment, setComment] = useState("");
  const [addingComment, setAddingComment] = useState(false);

  const [user] = useAuthState(auth);

  const commentRef = collection(db, "comment");
  const pinRef = collection(db, "pin");

  const getMorePins = async () => {
    try {
      const pinCollectionDoc = query(
        pinRef,
        where("category", "==", pinDetail?.category),
      );
      const data = await getDocs(pinCollectionDoc);
      const filteredData = data.docs.map((doc) => ({
        imageUrl: doc.data().imageUrl,
        postId: doc.id,
        userId: doc.data().userId,
        category: doc.data().category,
      }));

      setMorePins(filteredData);
    } catch (err) {
      console.error(err);
    }
  };

  const getPins = async () => {
    const pinDoc = doc(db, "pin", pinId);
    const data = await getDoc(pinDoc);
    // console.log(data.data());
    setPinDetail(data.data());
  };

  const getComments = async () => {
    const commentDoc = query(commentRef, where("postId", "==", pinId));
    const data = await getDocs(commentDoc);
    setPinComments(
      data.docs.map((doc) => ({
        message: doc.data().message,
        postId: doc.data().postId,
        userId: doc.data().userId,
        userName: doc.data().userName,
        userPhotoUrl: doc.data().userPhotoUrl,
        commentId: doc.id,
      }))
    );
  };

  const addComment = async () => {
    try {
      const newDoc = await addDoc(commentRef, {
        message: comment,
        postId: pinId,
        userId: user.uid,
        userName: user.displayName,
        userPhotoUrl: user.photoURL,
      });

      if (user) {
        setPinComments(
          (prev) =>
            prev && [
              ...prev,
              {
                message: comment,
                postId: pinId,
                userId: user.uid,
                userName: user.displayName,
                userPhotoUrl: user.photoURL,
                commentId: newDoc.id,
              },
            ]
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    getPins();
    getComments();
  }, [pinId]);

  useEffect(() => {
    getMorePins();
  }, [pinDetail]);

  if (!pinDetail) return <Spinner message="Loading Pin..." />;

  return (
    <>
      <div
        className="flex xl:flex-row flex-col m-auto bg-white"
        style={{ maxWidth: "1500px", borderRadius: "32px" }}
      >
        {/* Image Preview */}
        <div className="flex justify-center items-center md:items-start flex-initial">
          <img
            className="rounded-t-3xl rounded-b-lg"
            src={pinDetail?.imageUrl}
            alt="user-post"
          />
        </div>

        {/* Image Download option and visit link */}
        <div className="w-full p-5 flex-1 xl:min-w-620">
          <div className="flex items-center justify-between">
            <div className="flex gap-2 items-center">
              <a
                href={`${pinDetail?.imageUrl}?dl=`}
                download
                onClick={(e) => e.stopPropagation()}
                className="bg-white w-9 h-9 p-2 rounded-full flex items-center justify-center text-dark text-xl opacity-75 hover:opacity-100 hover:shadow-md outline-none"
              >
                <MdDownloadForOffline />
              </a>
            </div>

            {/* Image Vist Link */}
            <a
              href={pinDetail?.imageUrl}
              target="_blank"
              rel="noreferrer"
              className="bg-white flex items-center gap-2 text-black font-bold p-1 pl-4 pr-4 rounded-full opacity-70 hover:opacity-100 hover:shadow-md"
              onClick={(e) => e.stopPropagation()}
            >
              {pinDetail?.imageUrl.length > 20
                ? pinDetail?.imageUrl.slice(8, 20)
                : pinDetail?.imageUrl.slice(8)}
            </a>
          </div>

          {/* Pin Details like title about section */}
          <div>
            <h1 className="text-4xl font-bold break-words mt-3">
              {pinDetail?.title}
            </h1>
            <p className="mt-3">{pinDetail?.about}</p>
          </div>

          {/* User details who created that pin */}
          <Link
            to={`user-profile/${pinDetail?.userId}`}
            className="flex gap-2 mt-5 items-center bg-white rounded-lg"
          >
            <img
              className="w-10 h-10 rounded-full"
              src={pinDetail?.userPhotoUrl}
              alt="user-profile"
            />
            <p className="font-semibold capitalize text-sm">
              {pinDetail?.userName}
            </p>
          </Link>

          {/* Comments */}
          <h2 className="mt-5 text-2xl">Comments</h2>
          {/* Shwoing All users comment */}
          <div className="max-h-370 overflow-y-auto">
            {pinComments &&
              pinComments?.map((comment) => (
                <div
                  className="flex gap-2 mt-5 items-center bg-white rounded-lg"
                  key={comment?.commentId}
                >
                  <img
                    src={comment?.userPhotoUrl}
                    alt="User-Image"
                    className="w-10 h-10 rounded-full cursor-pointer"
                  />
                  <div className="flex flex-col" key={comment?.commentId}>
                    <p className="font-bold">{comment?.userName}</p>
                    <p>{comment?.message}</p>
                  </div>
                </div>
              ))}
          </div>
          {/* Adding any body to comment on post */}
          <div className="flex flex-wrap mt-6 gap-3">
            <Link to={`user-profile/${user.uid}`}>
              <img
                src={user.photoURL}
                className="w-10 h-10 rounded-full cursor-pointer"
                alt="user-profile"
              />
            </Link>
            <input
              className=" flex-1 border-gray-100 outline-none border-2 p-2 rounded-2xl focus:border-gray-300"
              type="text"
              placeholder="Add a Comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            <button
              type="button"
              className="bg-red-500 text-white rounded-full px-6 py-2 font-semibold text-base outline-none"
              onClick={addComment}
            >
              {addingComment ? "Posting the comment..." : "Post"}
            </button>
          </div>
        </div>
      </div>
      {morePins?.length > 0 ? (
        <>
          <h2 className="text-center font-bold text-2xl mt-8 mb-4">
            More like this
          </h2>
          <MasnoryLayout pins={morePins} />
        </>
      ) : (
        <Spinner message="Loading more pins" />
      )}
    </>
  );
};
