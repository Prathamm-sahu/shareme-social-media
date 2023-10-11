import { useState } from "react";
import { AiOutlineCloudUpload } from "react-icons/ai";
import { useNavigate } from "react-router-dom";
import { MdDelete } from "react-icons/md";
import { Spinner } from "./Spinner";
import { categories } from "../utils/categoryData";
import { v4 } from "uuid";
import { auth, db, storage } from "../config/firebase";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { useAuthState } from "react-firebase-hooks/auth";
import { addDoc, collection } from "firebase/firestore";

export const CreatePin = () => {
  const [title, setTitle] = useState("");
  const [about, setAbout] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const [fields, setFields] = useState();
  const [imageAsset, setImageAsset] = useState();
  const [imageUpload, setImageUpload] = useState();
  const [wrongImageType, setWrongImageType] = useState(false);
  const [progresspercent, setProgresspercent] = useState(0);
  const navigate = useNavigate();
  const [user] = useAuthState(auth);

  const pinRef = collection(db, "pin");

  const showImageForPreview = (e) => {
    setImageUpload(e.target.files[0]);
    const reader = new FileReader();
    if (e.target.files[0]) {
      reader.readAsDataURL(e.target.files[0]);
    }

    reader.onload = (readerEvent) => {
      setImageAsset(readerEvent.target.result);
    };
  };

  const savePin = async (e) => {
    // const selectedFile = e.target.files[0];

    if (
      imageUpload.type === "image/png" ||
      imageUpload.type === "image/svg" ||
      imageUpload.type === "image/jpeg" ||
      imageUpload.type === "image/gif"
    ) {
      setWrongImageType(false);
      setLoading(true);

      const imageRef = ref(storage, `images/${v4() + imageUpload.name}`);
      const uploadTask = uploadBytesResumable(imageRef, imageUpload);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress = Math.round(
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          );
          setProgresspercent(progress);
        },
        (error) => {
          alert(error);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then(async (downloadURL) => {
            await addDoc(pinRef, {
              title: title,
              userId: user?.uid,
              category: category,
              about: about,
              imageUrl: downloadURL,
              userPhotoUrl: user?.photoURL,
              userName: user?.displayName,
            });
            alert("Your Pin Saved");
          });
        }
      );
      setLoading(false);
      setImageUpload(null);
      setImageAsset(null);
      setTitle("");
      setAbout("");
      setCategory("");
    } else {
      setWrongImageType(true);
    }
  };

  return (
    <div className="flex flex-col justify-center items-center mt-5 lg:h-4/5">
      {fields && (
        <p className="text-red-500 mb-5 text-xl transition-all duration-150 ease-in">
          Please Add all fields
        </p>
      )}
      <div className="flex lg:flex-row flex-col justify-center items-center bg-white lg:p-5 p-3 lg:w-4/5  w-full">
        <div className="bg-secondaryColor p-3 flex flex-0.7 w-full">
          <div className="flex justify-center items-center flex-col border-2 border-dotted border-gray-300 p-3 w-full h-420">
            {loading && <Spinner />}
            {wrongImageType && <p>Wrong Image Type</p>}
            {!imageAsset ? (
              <label>
                <div className="flex flex-col items-center justify-center h-full">
                  <div className="flex flex-col justify-center items-center">
                    <p className="font-bold text-2xl">
                      <AiOutlineCloudUpload />
                    </p>
                    <p className="text-lg">Click to Upload</p>
                  </div>
                  <p className="mt-32 text-gray-400">
                    Recommendation: Use high-quality JPG, JPEG, SVG, PNG, GIF
                    less than 20MB
                  </p>
                </div>
                <input
                  type="file"
                  name="upload-image"
                  onChange={showImageForPreview}
                  className="w-0 h-0"
                />
              </label>
            ) : (
              <div className="relative h-full">
                <img
                  src={imageAsset}
                  alt="uploaded-pic"
                  className="h-full w-full"
                />
                <button
                  type="button"
                  className="absolute bottom-3 right-1 p-3 rounded-full bg-white text-xl cursor-pointer outline-none hover:shadow-md transition-all duration-500 ease-in-out"
                  onClick={() => {
                    setImageAsset(null);
                    setLoading(false);
                  }}
                >
                  <MdDelete />
                </button>
              </div>
            )}
          </div>
        </div>
        {/* Other Details of Post */}

        <div className="flex flex-1 flex-col gap-6 lg:pl-5 mt-5 w-full">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Add your title"
            className="outline-none text-2xl sm:text-3xl font-bold border-b-2 border-gray-200 p-2"
          />
          {user && (
            <div className="flex gap-2 mt-2 mb-2 items-center bg-white rounded-lg">
              <img
                src={user?.photoURL}
                alt="user-profile"
                className="w-10 h-10 rounded-full"
              />
              <p>{user.displayName}</p>
            </div>
          )}
          <input
            type="text"
            value={about}
            onChange={(e) => setAbout(e.target.value)}
            placeholder="What is your pin about"
            className="outline-none text-base sm:text-lg border-b-2 border-gray-200 p-2"
          />

          <div className="flex flex-col">
            <div>
              <p className="mb-2 font-semibold text:lg sm:text-xl">
                Choose Pin Category
              </p>
              <select
                onChange={(e) => setCategory(e.target.value)}
                className="outline-none w-4/5 text-base border-b-2 border-gray-200 p-2 rounded-md cursor-pointer"
              >
                <option value="other">Select Category</option>
                {categories.map((item) => (
                  <option
                    key={item.name}
                    value={item.name}
                    className="text-base border-0 outline-none capitalize bg-white text-black "
                  >
                    {item.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end items-end mt-5">
              <button
                type="button"
                onClick={savePin}
                className="bg-red-500 text-white font-bold p-2 rounded-full w-28 outline-none"
              >
                Save Pin
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
