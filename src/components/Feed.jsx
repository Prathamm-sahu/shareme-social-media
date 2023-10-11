import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { MasnoryLayout } from './MasnoryLayout';
import { Spinner } from './Spinner';
import { db } from '../config/firebase';
import { getDocs, collection, query, where, or } from 'firebase/firestore';

export const Feed = () => {

  const [pins, setPins] = useState(null);
  const [loading, setLoading] = useState(true);
  const { categoryId } = useParams();

  // pins collection reference
  const pinCollectionRef = collection(db, "pin")


  useEffect(() => {
    if(categoryId) {
      setLoading(true);
      const getPins = async() => {
        try {
          const pinCollectionDoc = query(pinCollectionRef, 
            // or(
              // where("title", "==", categoryId), 
              where("category", "==", categoryId),
              // where("about", "==", categoryId),
            // )
          );
          const data = await getDocs(pinCollectionDoc)
          const filteredData = data.docs.map((doc) => ({
            imageUrl: doc.data().imageUrl,
            postId: doc.id,
            userId: doc.data().userId,
            category: doc.data().category
          }))
          setPins(filteredData)
          setLoading(false)
        } 
        catch (err)
        {
          console.error(err)
        }
      }
      getPins();
    } else {

    }
  }, [categoryId])

  console.log(pins);

  if(loading) {
    return <Spinner message="We are adding new ideas to feed" />
  }

  if(!pins?.length) return <h2>No Pins Available</h2>

  return (
    <div className='Pratham'>
      <MasnoryLayout pins={pins} />
    </div>
  )
}

