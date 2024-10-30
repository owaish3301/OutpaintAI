import React, { useState } from 'react';
import { Upload, Settings, Image as RefreshCw } from 'lucide-react';

const imgbbApiKey = import.meta.env.VITE_BB_API;
const backendUrl = import.meta.env.VITE_BACKEND_URL;

const Dashboard = () => {
  console.log(imgbbApiKey, ":", backendUrl)
  const [image, setImage] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedImage, setGeneratedImage] = useState(null);
  const [settings, setSettings] = useState({
    width: 720,
    height: 720,
    overlap_percentage: 10,
    num_inference_steps: 8,
    resize_option: "Full",
    custom_resize_percentage: 50,
    prompt_input: "",
    alignment: "Middle",
    overlap_left: true,
    overlap_right: true,
    overlap_top: true,
    overlap_bottom: true
  });
  
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    setImage(file)
    if (file) {
      const formData = new FormData();
      formData.append("image", file);
      formData.append("key", imgbbApiKey);
  
      try {
        const response = await fetch("https://api.imgbb.com/1/upload", {
          method: 'POST',
          body: formData,
        });
        const data = await response.json();
        if (data.success) {
          setImageUrl(data.data.url); // Directly set the image URL from ImgBB
        } else {
          console.error("Image upload failed:", data.error);
        }
      } catch (error) {
        console.error("Error uploading image:", error);
      }
    }
  };


  const handleGenerate = async () => {
    try {
      setLoading(true);
      const response = await fetch(backendUrl, {
        method : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body : JSON.stringify({imageUrl, ...settings})
      })
      const data = await response.json()

      setGeneratedImage(data.result);
    } catch (error) {
      console.error("Generation failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-indigo-600">Canvas+</h1>
            <span className="text-sm text-gray-500">AI Image Outpainting</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Panel - Image Upload & Preview */}
          <div className="lg:col-span-8 space-y-6">
            {/* Image Upload Area */}
            <div className="bg-white rounded-lg shadow p-6">
              {!image ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
                  <div className="flex flex-col items-center">
                    <Upload className="h-12 w-12 text-gray-400" />
                    <label className="mt-4 cursor-pointer">
                      <span className="mt-2 block text-sm font-medium text-indigo-600 hover:text-indigo-500">
                        Upload an image
                      </span>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageUpload}
                      />
                    </label>
                  </div>
                </div>
              ) : (
                <div className="relative">
                  <img
                    src={URL.createObjectURL(image)}
                    alt="Upload preview"
                    className="w-full rounded-lg"
                  />
                  <button
                    onClick={() => setImage(null)}
                    className="absolute top-2 right-2 bg-white rounded-full p-2 shadow-lg"
                  >
                    <RefreshCw className="h-4 w-4 text-gray-500" />
                  </button>
                </div>
              )}
            </div>

            {/* Generated Image Preview */}
            {generatedImage && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium mb-4">Generated Result</h3>
                <img
                  src={generatedImage}
                  alt="Generated result"
                  className="w-full rounded-lg"
                />
              </div>
            )}
          </div>

          {/* Right Panel - Controls */}
          <div className="lg:col-span-4 space-y-6">
            {/* Settings Panel */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium mb-4 flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                Settings
              </h3>
              
              <div className="space-y-4">
                {/* Dimensions */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Width</label>
                  <input
                    type="range"
                    min="320"
                    max="1920"
                    value={settings.width}
                    onChange={(e) => setSettings({...settings, width: parseInt(e.target.value)})}
                    className="w-full mt-1"
                  />
                  <span className="text-sm text-gray-500">{settings.width}px</span>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Height</label>
                  <input
                    type="range"
                    min="320"
                    max="1920"
                    value={settings.height}
                    onChange={(e) => setSettings({...settings, height: parseInt(e.target.value)})}
                    className="w-full mt-1"
                  />
                  <span className="text-sm text-gray-500">{settings.height}px</span>
                </div>

                {/* Overlap Settings */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Overlap Percentage</label>
                  <input
                    type="range"
                    min="1"
                    max="50"
                    value={settings.overlap_percentage}
                    onChange={(e) => setSettings({...settings, overlap_percentage: parseInt(e.target.value)})}
                    className="w-full mt-1"
                  />
                  <span className="text-sm text-gray-500">{settings.overlap_percentage}%</span>
                </div>

                {/* Prompt Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Prompt (Optional)</label>
                  <textarea
                    value={settings.prompt_input}
                    onChange={(e) => setSettings({...settings, prompt_input: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    rows="3"
                  />
                </div>

                {/* Generate Button */}
                <button
                  onClick={handleGenerate}
                  disabled={!image || loading}
                  className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {loading ? 'Generating...' : 'Generate'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;