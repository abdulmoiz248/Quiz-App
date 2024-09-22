"use client"
import Loader from '@/components/Loader';
import React, { useState } from 'react';
import { motion } from 'framer-motion';

export default function Modal({open, setOpen}: {open: boolean, setOpen: (open: boolean) => void}) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
 
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setError(null); 
    if (event.target.files) {
      const files = Array.from(event.target.files);
      const validFiles = files.filter(file => file.type === 'application/pdf' && file.size <= 10 * 1024 * 1024);
      if (validFiles.length !== files.length) {
        setError('Only PDFs under 10MB are allowed.');
      } else {
        setSelectedFiles(validFiles);
      }
    }
  };

  const handleSubmit = async () => {
    if (selectedFiles.length > 0) {
      console.log('Submitting files:', selectedFiles.map(file => file.name));
      try {
        setLoading(true);

        // send files to backend
        // Simulating an API call
        await new Promise(resolve => setTimeout(resolve, 2000));

        setOpen(false);
      } catch (error) {
        setError('An error occurred while submitting the files.');   
      } finally {
        setLoading(false);
      }
    } else {
      setError('No files selected.');
    }
  };

  return (
    <>
      {open && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50'>
          {loading ? (
            <Loader />
          ) : (
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col max-w-4xl w-full md:w-2/3 lg:w-1/2 gap-4 p-8 rounded-lg shadow-lg bg-[#0e0725] dark:bg-gray-50 dark:text-gray-800"
            >
              <h2 className="text-2xl text-[#5c03bc] font-semibold leading-tight text-center mb-4">
                Upload PDF Files
              </h2>

              <div className="flex items-center justify-center w-full">
                <label htmlFor="pdfUpload" className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                  <div className=" flex flex-col items-center justify-center pt-5 pb-6">
                    <svg className="w-8 h-8 mb-4 text-[#5c03bc]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                      <path stroke="currentcolor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5A5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2" />
                    </svg>
                    <p className="mb-2 text-sm text-[#5c03bc]"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                    <p className="text-xs text-[#5c03bc]">PDFs only (MAX. 10MB each)</p>
                  </div>
                  <input id="pdfUpload" type="file" className="hidden" accept=".pdf" onChange={handleFileChange} multiple />
                </label>
              </div>

              <div className="mt-4">
                {selectedFiles.length > 0 ? (
                  <ul className="text-sm text-gray-700">
                    {selectedFiles.map((file, index) => (
                      <li key={index} className="flex justify-between py-1">
                        <span>{file.name}</span>
                        <span>{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                      </li>
                    ))}
                  </ul>
                ) : <p className="text-sm text-gray-500">No files selected</p>}
              </div>

              {error && <p className="text-sm text-red-600 mt-2">{error}</p>}

              <div className="flex justify-end mt-6">
                <button 
                  className="px-6 py-3 w-full sm:w-auto rounded-md shadow-sm bg-violet-600 text-white hover:bg-violet-700"
                  onClick={handleSubmit}
                >
                  Continue
                </button>
              </div>
            </motion.div>
          )}
        </div>
      )}
    </>
  );
}
