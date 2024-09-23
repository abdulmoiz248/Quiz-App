'use client'
import axios from 'axios';
import React, { useState } from 'react'

function Main() {
    let [answer, setAnswer] = useState<string>('');
    let [question, setQuestion] = useState<string>('');
    let [loading, setLoading] = useState<boolean>(false);
    const handleSubmit = async () => {
        if(question === ''){
            setAnswer("Please enter a question")
            return;
        }
        try {
            setLoading(true);
             let res=await axios.post('/api/get-answer',{query:question})
             console.log(res)
             setAnswer(res.data.answer);
             setQuestion('');
             
        } catch (error) {
             setAnswer("An Error Occured")         
        }finally{
            setLoading(false);
        }
    }
  return (
    
  <div className='flex justify-center items-center h-screen mt-0 mb-0'>
  <div className="flex flex-col rounded-2xl w-[500px] bg-[#ffffff] shadow-xl">
    <div className="flex flex-col p-8">
        <div className="text-2xl font-bold uppercase text-center text-[#374151] pb-6">Ask a Question</div>
        <div className="text-lg text-center text-[#374151]">
            <textarea
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Enter your question"
              className="w-full p-2 border border-gray-300 rounded-md resize-none overflow-visible min-h-[40px] max-h-[120px]"
              style={{ overflowWrap: 'break-word' }}
            />
        </div>
        <div className="flex justify-end pt-6">
            <button onClick={handleSubmit} className="bg-[#7e22ce] text-[#ffffff] font-bold text-base uppercase p-3 rounded-lg hover:bg-purple-800 active:scale-95 transition-transform transform">Search</button>
        </div>
        {
           loading ? <div className="text-lg text-center text-[#374151]">Loading...</div> :
            <div className="text-lg text-center text-[#7e22ce]">{answer}</div>
        }
    </div>
</div>
  </div>
)
}

export default Main