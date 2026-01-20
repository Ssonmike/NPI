import React, { useState, useEffect } from 'react';
import { Scene } from './components/Scene';
import { generateSequence } from './utils/boxLogic';
import { Play, Pause, SkipBack, SkipForward, ChevronLeft, ChevronRight, Settings, Box as BoxIcon, Info, X } from 'lucide-react';
import { PALLET_CONFIGURATIONS, getPalletById } from './data/palletConfigurations';

const DEFAULT_JSON = `{
   "resourceId":"PAL_IITE8612MIS-B3AG",
   "resource":{
      "pallet":{
         "maxHeight":2300,
         "name":" - ",
         "description":"",
         "weightUom":"kg",
         "sizeUom":"mm",
         "length":2150,
         "width":1100,
         "height":130,
         "volume":0.307,
         "volumeUom":"m3",
         "weight":15,
         "maxWeight":2000,
         "maxLoadWeight":1985,
         "externalReferences":{
            
         }
      }
   },
   "loadInstructions":[
      {
         "id":"71c869ce-8d4a-467c-ad85-d0f0f56d8c3d",
         "serialNumber": "IIXUB2493HSU-B6",
         "x1":25,
         "x2":1655,
         "y1":150,
         "y2":335,
         "z1":0,
         "z2":1010,
         "quantityX":1,
         "quantityY":1,
         "quantityZ":1,
         "sizeUom":"mm",
         "orientation":"LxW",
         "blockType":"Cube",
         "packageId":"02546ba5-be55-402c-80cf-201ea75052e5",
         "sequence":1
      },
      {
         "id":"714c2a19-231f-48d6-9ca1-f2b820c5def8",
         "serialNumber": "IITF3239MSC-B1AG",
         "x1":25,
         "x2":2125,
         "y1":335,
         "y2":560,
         "z1":0,
         "z2":1280,
         "quantityX":1,
         "quantityY":1,
         "quantityZ":1,
         "sizeUom":"mm",
         "orientation":"LxW",
         "blockType":"Cube",
         "packageId":"d3bb422c-bbe2-406d-a16e-bbc082103a1a",
         "sequence":2
      },
      {
         "id":"cee2def4-55c8-460a-94a4-7a16cd4883bd",
         "serialNumber": "IIXUB2792QSU-B6",
         "x1":25,
         "x2":1405,
         "y1":560,
         "y2":950,
         "z1":0,
         "z2":845,
         "quantityX":1,
         "quantityY":3,
         "quantityZ":1,
         "sizeUom":"mm",
         "orientation":"LxW",
         "blockType":"Cube",
         "packageId":"f7562342-fa38-4b92-8f21-1b381aae9235",
         "sequence":3
      }
   ]
}`;

export default function App() {
  const [selectedPalletId, setSelectedPalletId] = useState('pallet1');
  const [jsonInput, setJsonInput] = useState(JSON.stringify(PALLET_CONFIGURATIONS.pallet1.data, null, 2));
  const [boxes, setBoxes] = useState([]);
  const [pallet, setPallet] = useState(null);
  const [resourceInfo, setResourceInfo] = useState(null);

  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Closed by default for immersion

  // Initialize from default JSON
  useEffect(() => {
    handleParse();
  }, []);

  const handleParse = () => {
    try {
      const { boxes: generatedBoxes, pallet: parsedPallet, resource } = generateSequence(jsonInput);
      setBoxes(generatedBoxes);
      setPallet(parsedPallet);
      setResourceInfo(resource);

      setCurrentStep(0);
      setIsPlaying(false);
    } catch (e) {
      alert("Invalid JSON: " + e.message);
    }
  };

  const handlePalletChange = (palletId) => {
    setSelectedPalletId(palletId);
    const palletConfig = getPalletById(palletId);
    const newJson = JSON.stringify(palletConfig.data, null, 2);
    setJsonInput(newJson);

    try {
      const { boxes: generatedBoxes, pallet: parsedPallet, resource } = generateSequence(newJson);
      setBoxes(generatedBoxes);
      setPallet(parsedPallet);
      setResourceInfo(resource);
      setCurrentStep(0);
      setIsPlaying(false);
    } catch (e) {
      console.error("Error loading pallet:", e);
    }
  };

  //NUEVA LINEA HECHA POR MI
  const totalBlocks = boxes.length > 0 ? Math.max(...boxes.map(b => b.sequence)) : 0;
  // Animation Loop
  useEffect(() => {
    let interval;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentStep((prev) => {
          if (prev >= totalBlocks) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 1500); // Slower for clarity
    }
    return () => clearInterval(interval);
  }, [isPlaying, totalBlocks]);

  const handleSliderChange = (e) => {
    const val = parseInt(e.target.value);
    setCurrentStep(val);
    setIsPlaying(false);
  };

  // derived state
  const currentBlockBoxes = currentStep > 0 ? boxes.filter(b => b.sequence === currentStep) : [];
  const currentBox = currentBlockBoxes.length > 0 ? currentBlockBoxes[0] : null;
  const nextBox = currentStep < totalBlocks ? boxes.find(b => b.sequence === currentStep + 1) : null;
  const isComplete = currentStep === totalBlocks && totalBlocks > 0;

  const currentPalletConfig = getPalletById(selectedPalletId);
  /*
  const currentBox = currentStep > 0 && currentStep <= boxes.length ? boxes[currentStep - 1] : null;
  const nextBox = currentStep < boxes.length ? boxes[currentStep] : null;
  const isComplete = currentStep === boxes.length && boxes.length > 0;
*/

  return (
    <div className="flex h-screen w-screen flex-col bg-gray-900 text-white overflow-hidden font-sans">

      {/* 3D Scene Area */}
      <div className="flex-1 relative w-full h-full">
        <Scene boxes={boxes} currentStep={currentStep} pallet={pallet} />

        {/* Top Header - Work Order Info - Responsive Container */}
        <div className="absolute top-0 left-0 w-full p-4 md:p-6 flex flex-col gap-3 pointer-events-none z-10">

          {/* Pallet Selector - Horizontal Scroll on Mobile */}
          <div className="pointer-events-auto flex items-start">
            <div className="flex gap-2 overflow-x-auto max-w-full pb-2 md:pb-0 scrollbar-hide mask-fade-right">
              <button
                onClick={() => handlePalletChange('pallet1')}
                className={`flex-shrink-0 px-4 py-3 md:px-6 md:py-3 rounded-lg font-bold transition border-2 text-sm md:text-base min-w-[100px] md:min-w-0 ${selectedPalletId === 'pallet1'
                  ? 'bg-orange-600 border-orange-500 text-white shadow-lg'
                  : 'bg-gray-800/80 border-gray-600 text-gray-300 hover:bg-gray-700 hover:border-gray-500'
                  }`}
              >
                Pallet 1
              </button>
              <button
                onClick={() => handlePalletChange('pallet2')}
                className={`flex-shrink-0 px-4 py-3 md:px-6 md:py-3 rounded-lg font-bold transition border-2 text-sm md:text-base min-w-[100px] md:min-w-0 ${selectedPalletId === 'pallet2'
                  ? 'bg-orange-600 border-orange-500 text-white shadow-lg'
                  : 'bg-gray-800/80 border-gray-600 text-gray-300 hover:bg-gray-700 hover:border-gray-500'
                  }`}
              >
                Pallet 2
              </button>
            </div>
          </div>

          {/* Info Card - Collapsible or Compact on Mobile */}
          <div className="pointer-events-auto bg-gray-800/90 backdrop-blur border border-gray-600 rounded-lg p-3 md:p-4 shadow-xl w-full max-w-[calc(100vw-32px)] md:max-w-sm transition-all">
            <div className="flex items-center gap-3 mb-1">
              <BoxIcon className="text-orange-500" size={18} />
              <span className="text-[10px] md:text-xs uppercase tracking-widest text-gray-400 font-bold">Work Order</span>
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight truncate">{currentPalletConfig.displayName}</h1>
            <p className="text-xs md:text-sm text-gray-300 mt-1 truncate">{resourceInfo?.name || '---'}</p>

            {/* Picking Location Display */}
            {currentBox && currentBox.display?.pickingLocation && (
              <div className="mt-2 md:mt-3 pt-2 md:pt-3 border-t border-gray-700 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <svg
                    className="w-4 h-4 text-emerald-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <span className="text-[10px] md:text-xs uppercase tracking-widest text-gray-400 font-bold hidden xs:inline">
                    Picking From
                  </span>
                </div>
                <div className="font-mono text-xl md:text-2xl font-bold text-emerald-400 tracking-wider">
                  {currentBox.display.pickingLocation}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Floating Instruction Panel - Bottom Sheet on Mobile */}
        <div className="absolute bottom-0 left-0 right-0 md:left-1/2 md:right-auto md:bottom-10 md:transform md:-translate-x-1/2 
                        bg-gray-800/95 backdrop-blur border-t md:border border-gray-600 
                        p-4 md:p-6 
                        rounded-t-2xl md:rounded-2xl 
                        shadow-2xl 
                        w-full md:w-[800px] 
                        flex flex-col gap-4 md:gap-6
                        z-20 max-h-[45vh] md:max-h-none overflow-y-auto md:overflow-visible touch-pan-y">

          {/* Dynamic Instructions */}
          <div className="flex flex-col gap-3 md:flex-row md:justify-between md:items-center border-b border-gray-700 pb-3 md:pb-4">
            {currentBox ? (
              <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                  <div className="text-[10px] md:text-xs text-orange-400 uppercase tracking-widest font-bold">
                    Block {currentBox.display?.stepSequence || currentStep} of {totalBlocks}
                  </div>
                  {/* Mobile Coordinates (Compact) */}
                  <div className="flex gap-2 md:hidden">
                    <span className="text-xs font-mono text-orange-400">X:{currentBox.display.x_mm}</span>
                    <span className="text-xs font-mono text-blue-400">Y:{currentBox.display.y_mm}</span>
                    <span className="text-xs font-mono text-green-400">Z:{currentBox.display.z_mm}</span>
                  </div>
                </div>
                <div className="text-lg md:text-2xl font-light text-white leading-tight">
                  <span className="font-bold text-white block md:inline">{currentBox.display?.stepDescription}</span>
                  <span className="text-sm md:text-base text-gray-400 md:ml-2 block md:inline">to height {currentBox.display.z_mm + Math.round(currentBox.size[1] * 1000)} mm</span>
                </div>
              </div>
            ) : isComplete ? (
              <div className="text-xl md:text-2xl font-bold text-green-400 flex items-center gap-2">
                <span>✓</span> Carga Completa
              </div>
            ) : (
              <div className="text-lg md:text-xl text-gray-400">Ready to start</div>
            )}

            {/* Desktop Coordinates Widget */}
            {currentBox && (
              <div className="hidden md:flex gap-4 ml-8 bg-black/40 p-3 rounded-lg border border-gray-700">
                <div className="text-center">
                  <div className="text-[10px] text-gray-500 uppercase">POS X</div>
                  <div className="text-xl font-mono text-orange-400">{currentBox.display.x_mm}</div>
                </div>
                <div className="text-center">
                  <div className="text-[10px] text-gray-500 uppercase">POS Y</div>
                  <div className="text-xl font-mono text-blue-400">{currentBox.display.y_mm}</div>
                </div>
                <div className="text-center">
                  <div className="text-[10px] text-gray-500 uppercase">POS Z</div>
                  <div className="text-xl font-mono text-green-400">{currentBox.display.z_mm}</div>
                </div>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="flex flex-col-reverse md:flex-row items-center gap-4 md:gap-6">
            <div className="flex gap-2 w-full md:w-auto">
              <button
                onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
                className="flex-1 md:flex-none p-3 md:p-3 rounded-xl bg-gray-700 hover:bg-gray-600 transition text-white border border-gray-600 flex justify-center items-center min-h-[44px]"
              >
                <SkipBack size={20} />
              </button>

              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className={`flex-[2] md:flex-none flex items-center justify-center gap-3 px-4 md:px-8 py-3 rounded-xl font-bold transition text-white shadow-lg border border-white/10 min-h-[44px] ${isPlaying ? 'bg-orange-600 hover:bg-orange-500' : 'bg-emerald-600 hover:bg-emerald-500'}`}
              >
                {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                <span>{isPlaying ? "PAUSAR" : "AUTO"}</span>
              </button>

              <button
                onClick={() => setCurrentStep(prev => Math.min(totalBlocks, prev + 1))}
                className="flex-1 md:flex-none p-3 md:p-3 rounded-xl bg-gray-700 hover:bg-gray-600 transition text-white border border-gray-600 flex justify-center items-center min-h-[44px]"
              >
                <SkipForward size={20} />
              </button>
            </div>

            <div className="flex-1 flex flex-col gap-1 w-full">
              <div className="flex justify-between text-[10px] md:text-xs text-gray-400 font-mono">
                <span>START</span>
                <span>PROGRESS</span>
                <span>END</span>
              </div>
              <div className="relative h-4 md:h-2 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-orange-500 to-yellow-500 transition-all duration-300"
                  style={{ width: `${(currentStep / Math.max(1, totalBlocks)) * 100}%` }}
                />
              </div>
              <input
                type="range"
                min="0"
                max={totalBlocks}
                value={currentStep}
                onChange={handleSliderChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
            </div>
          </div>
        </div>

        {/* Sidebar Toggle */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="absolute top-4 right-4 md:top-6 md:right-6 bg-gray-800 p-3 rounded-xl text-gray-400 hover:text-white hover:bg-gray-700 shadow-xl z-30 transition border border-gray-600 min-w-[44px] min-h-[44px] flex items-center justify-center"
        >
          {isSidebarOpen ? <ChevronRight size={20} /> : <Settings size={20} />}
        </button>
      </div>

      {/* Sidebar (Input) - Full width on Mobile */}
      <div
        className={`fixed top-0 right-0 bottom-0 
          w-full md:w-[450px] 
          bg-gray-900 border-l border-gray-700 flex flex-col p-6 shadow-2xl z-40 transition-transform duration-300 transform 
          ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Settings size={20} className="text-orange-500" />
            Configuración JSON
          </h2>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="p-2 text-gray-400 hover:text-white md:hidden"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 flex flex-col min-h-0 mb-4">
          <textarea
            className="flex-1 bg-gray-950 border border-gray-800 rounded-lg p-4 font-mono text-xs md:text-sm text-green-400 resize-none focus:outline-none focus:border-orange-500 transition leading-tight"
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            spellCheck="false"
          />
        </div>

        <button
          onClick={() => {
            handleParse();
            if (window.innerWidth < 768) setIsSidebarOpen(false);
          }}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl shadow-lg transition min-h-[50px]"
        >
          Recalculate Model
        </button>
      </div>
    </div>
  );
}
