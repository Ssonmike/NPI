import React, { useState, useEffect } from 'react';
import { Scene } from './components/Scene';
import { generateSequence } from './utils/boxLogic';
import { Play, Pause, SkipBack, SkipForward, ChevronLeft, ChevronRight, Settings, Box as BoxIcon, Info } from 'lucide-react';

const DEFAULT_JSON = `{
   "resourceId":"PAL_IITE8612MIS-B3AG",
   "resource":{
      "pallet":{
         "maxHeight":2300,
         "name":"IILH5541UHS-B2 - STOCKPALLET",
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
  const [jsonInput, setJsonInput] = useState(DEFAULT_JSON);
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
  //NUEVA LINEA HECHA POR MI
  const totalBlocks = boxes.length > 0 ? Math.max(...boxes.map(b => b.secuence)) : 0;
  // Animation Loop
  useEffect(() => {
    let interval;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentStep((prev) => {
          if (prev >= boxes.length) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 1500); // Slower for clarity
    }
    return () => clearInterval(interval);
  }, [isPlaying, boxes.length]);

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
  /*
  const currentBox = currentStep > 0 && currentStep <= boxes.length ? boxes[currentStep - 1] : null;
  const nextBox = currentStep < boxes.length ? boxes[currentStep] : null;
  const isComplete = currentStep === boxes.length && boxes.length > 0;
*/

  return (
    <div className="flex h-screen w-screen flex-col bg-gray-900 text-white overflow-hidden font-sans">

      {/* 3D Scene Area */}
      <div className="flex-1 relative">
        <Scene boxes={boxes} currentStep={currentStep} pallet={pallet} />

        {/* Top Header - Work Order Info */}
        <div className="absolute top-6 left-6 flex flex-col gap-2">
          <div className="bg-gray-800/80 backdrop-blur border border-gray-600 rounded-lg p-4 shadow-xl">
            <div className="flex items-center gap-3 mb-1">
              <BoxIcon className="text-orange-500" size={20} />
              <span className="text-xs uppercase tracking-widest text-gray-400 font-bold">Work Order</span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">{resourceInfo?.id || 'NO LOADED'}</h1>
            <p className="text-sm text-gray-300 mt-1">{resourceInfo?.name || '---'}</p>
          </div>
        </div>

        {/* Floating Instruction Panel */}
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 bg-gray-800/90 backdrop-blur border border-gray-600 p-6 rounded-2xl shadow-2xl w-[800px] flex flex-col gap-6">

          {/* Dynamic Instructions */}
          <div className="flex justify-between items-center border-b border-gray-700 pb-4">
            {currentBox ? (
              <div className="flex-1">
                <div className="text-xs text-orange-400 uppercase tracking-widest font-bold mb-2">
                  Paso {currentBox.display?.stepSequence || currentStep} de {totalBlocks}
                </div>
                <div className="text-2xl font-light text-white">
                  <span className="font-bold text-white">{currentBox.display?.stepDescription}</span>
                  <span className="text-gray-400 ml-2">hasta altura {currentBox.display.z_mm + Math.round(currentBox.size[1] * 1000)} mm</span>
                </div>
              </div>
            ) : isComplete ? (
              <div className="text-2xl font-bold text-green-400 flex items-center gap-2">
                <span>✓</span> Carga Completa
              </div>
            ) : (
              <div className="text-xl text-gray-400">Listo para iniciar</div>
            )}

            {/* Coordinates Widget */}
            {currentBox && (
              <div className="flex gap-4 ml-8 bg-black/40 p-3 rounded-lg border border-gray-700">
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
          <div className="flex items-center gap-6">
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
                className="p-3 rounded-xl bg-gray-700 hover:bg-gray-600 transition text-white border border-gray-600"
              >
                <SkipBack size={20} />
              </button>

              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className={`flex items-center gap-3 px-8 py-3 rounded-xl font-bold transition text-white shadow-lg border border-white/10 ${isPlaying ? 'bg-orange-600 hover:bg-orange-500' : 'bg-emerald-600 hover:bg-emerald-500'}`}
              >
                {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                <span>{isPlaying ? "PAUSAR" : "AUTO"}</span>
              </button>

              <button
                onClick={() => setCurrentStep(prev => Math.min(boxes.length, prev + 1))}
                className="p-3 rounded-xl bg-gray-700 hover:bg-gray-600 transition text-white border border-gray-600"
              >
                <SkipForward size={20} />
              </button>
            </div>

            <div className="flex-1 flex flex-col gap-1">
              <div className="flex justify-between text-xs text-gray-400 font-mono">
                <span>START</span>
                <span>PROGRESS</span>
                <span>END</span>
              </div>
              <div className="relative h-2 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-orange-500 to-yellow-500 transition-all duration-300"
                  style={{ width: `${(currentStep / Math.max(1, boxes.length)) * 100}%` }}
                />
              </div>
              <input
                type="range"
                min="0"
                max={boxes.length}
                value={currentStep}
                onChange={handleSliderChange}
                className="absolute inset-0 w-full h-8 opacity-0 cursor-pointer"
                style={{ top: 'auto' }}
              />
            </div>
          </div>
        </div>

        {/* Sidebar Toggle */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="absolute top-6 right-6 bg-gray-800 p-3 rounded-xl text-gray-400 hover:text-white hover:bg-gray-700 shadow-xl z-10 transition border border-gray-600"
        >
          {isSidebarOpen ? <ChevronRight size={20} /> : <Settings size={20} />}
        </button>
      </div>

      {/* Sidebar (Input) */}
      <div
        className={`fixed top-0 right-0 bottom-0 w-[450px] bg-gray-900 border-l border-gray-700 flex flex-col p-6 shadow-2xl z-20 transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <h2 className="text-xl font-bold mb-6 text-white flex items-center gap-2">
          <Settings size={20} className="text-orange-500" />
          Configuración JSON
        </h2>

        <div className="flex-1 flex flex-col min-h-0 mb-4">
          <textarea
            className="flex-1 bg-gray-950 border border-gray-800 rounded-lg p-4 font-mono text-xs text-green-400 resize-none focus:outline-none focus:border-orange-500 transition leading-tight"
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            spellCheck="false"
          />
        </div>

        <button
          onClick={handleParse}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl shadow-lg transition"
        >
          Recalcular Modelo
        </button>
      </div>
    </div>
  );
}
