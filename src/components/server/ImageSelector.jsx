const ImageSelector = () => {
  return (
    <div>
      <div className="flex space-x-6 text-sm font-medium border-b border-gray-700 mb-4">
        <button className="pb-2 border-b-2 border-red-500 text-white">OS Images</button>
        <button className="pb-2 text-gray-400 hover:text-white transition">Apps</button>
      </div>

      <div className="text-gray-400 text-sm">
        OS options like Ubuntu, Fedora, CentOS etc. will be listed here...
      </div>
    </div>
  );
};

export default ImageSelector;
