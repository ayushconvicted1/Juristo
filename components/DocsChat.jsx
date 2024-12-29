import { UploadIcon } from "lucide-react";
import React from "react";

const DocsChat = () => {
  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 justify-center items-center flex py-3 p-4 border-1">
        <div className="max-w-4xl mx-auto flex gap-4 bg-gray-50 border-red-400 p-4 w-250">
          <label
            htmlFor="file-input"
            className="cursor-pointer flex items-center"
          >
            <UploadIcon size={40} className="text-blue-500" />
            <span className="ml-2 text-gray-600 text-sm">Browse a file</span>
          </label>

          <input
            id="file-input"
            type="file"
            accept="application/pdf"
            className="hidden"
          />
        </div>
      </div>
    </>
  );
};

export default DocsChat;
