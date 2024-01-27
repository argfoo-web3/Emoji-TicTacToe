import React from 'react'

function GameMode() {
  return (
      <>
      <div className='flex justify-center items-center h-screen'>
        <div className='bg-white w-[25%] rounded-lg'>
            <div className='text-black font-semibold text-2xl border-gray-200 border-b-2 w-full flex justify-center py-3'>Select The Game Mode</div>
        <div className='flex justify-center my-3'>
            <button className='btn btn-glass mx-3 text-2xl w-40 text-white bg-blue-700'>Easy</button>
            <button className='btn btn-glass mx-3 text-2xl w-40 text-white bg-black'>Hard</button>
        </div>
        </div>
    </div>
      </>
  )
}

export default GameMode