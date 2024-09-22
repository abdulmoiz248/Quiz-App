import React from 'react'
import Image from 'next/image'
export default function Header() {
  return (
    <header className="p-4 bg-black">
	<div className="container flex justify-between h-16 mx-auto md:justify-center md:space-x-8">
		
		<a rel="noopener noreferrer" href="https://lahore.comsats.edu.pk/default.aspx" aria-label="Back to homepage" className="flex mt-2 items-center p-2">
			<Image src="/images/cui.png" alt="Logo" width={70} height={70} />
		
         <>
            <h1 className='ml-2 text-[#7e22ce] text-2xl font-bold'>COMSATS University Islamabad</h1>
         </>
         </a>
		
		
	</div>
</header>
  )
}
