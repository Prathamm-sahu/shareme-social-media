import { useState, ueEffect, useRef, useEffect } from 'react';
import { auth } from '../config/firebase';
import { HiMenu } from 'react-icons/hi';
import { AiFillCloseCircle } from 'react-icons/ai';
import { Link, Route, Routes } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { UserProfile } from '../components/UserProfile';
import { Pins } from './Pins'
import logo from '../assets/logo.png'

export const Home = () => {

  const [toggleSidebar, setToggleSidebar] = useState(false);
  const scrollRef = useRef(null)
  // const userInfo = auth ? auth.currentUser : null

  // console.log(auth.currentUser);

  useEffect(() => {
    scrollRef.current.scrollTo(0, 0)
  }, [])

  return (
    <div className='flex bg-gray-50 md:flex-row flex-col h-screen transition-height duration-75 ease-out'>
      <div className='hidden md:flex h-screen flex-initial'>
        <Sidebar user={auth && auth.currentUser} />   {/* Desktop View Sidebar */}
      </div>
      <div className='flex md:hidden flex-row'>
        <div className='p-2 w-full flex flex-row justify-between items-center shadow-md'>
          <HiMenu fontSize={40} className="cursor-pointer" onClick={() => setToggleSidebar(true)} />
          <Link to="/">
            <img src={logo} alt="logo" className="w-28" />
          </Link>

          {auth && <Link to={`user-profile/${auth?.currentUser?.uid}`}>
             <img src={auth?.currentUser?.photoURL} alt="logo" className='w-10 rounded-full' />
          </Link>}
        </div>
      </div>
      {toggleSidebar && (
        <div className='fixed w-4/5 bg-white h-screen overflow-y-auto shadow-md z-10 animate-slide-in'>
          <div className='absolute w-full flex justify-end items-center p-2'>
            <AiFillCloseCircle fontSize={30} className='cursor-pointer' onClick={() => setToggleSidebar(false)} />
          </div>
            <Sidebar user={auth && auth.currentUser} closeToggle={setToggleSidebar} />     {/* Mobile View sidebar */}
        </div>
      )}
      <div className='pb-2 flex-1 h-screen overflow-y-scroll' ref={scrollRef}>
        <Routes>
          <Route path="/user-profile/:userId" element={<UserProfile />} />
          <Route path="/*" element={<Pins user={auth && auth.currentUser} />} />
        </Routes>
      </div>
    </div>
  )
}
