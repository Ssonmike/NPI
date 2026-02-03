import React, { useState, useEffect, useCallback } from 'react';
import { Scene } from './components/Scene';
import { normalizeWarehouseOrder } from './domain/normalizer';
import { buildRenderSteps } from './render/stepsBuilder';
import { Play, Pause, SkipBack, SkipForward, ChevronLeft, ChevronRight, Settings, Box as BoxIcon, Info, X } from 'lucide-react';
import { PALLET_CONFIGURATIONS, getPalletById } from './data/palletConfigurations';

export default function App() {
  // Dynamic data loading state
  const [warehouseOrderId, setWarehouseOrderId] = useState(null);
  const [taskId, setTaskId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [jsonInput, setJsonInput] = useState('');
  const [boxes, setBoxes] = useState([]);
  const [pallet, setPallet] = useState(null);
  const [resourceInfo, setResourceInfo] = useState(null);

  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Calculate total blocks
  const totalBlocks = boxes.length > 0 ? Math.max(...boxes.map(b => b.sequence)) : 0;

  // Load data from URL or embedded data
  useEffect(() => {
    loadDataFromUrl();
  }, []);

  const loadDataFromUrl = async () => {
    try {
      // Check if we have embedded data from server
      if (window.__INITIAL_DATA__) {
        console.log('Loading from embedded data');
        const data = window.__INITIAL_DATA__;

        setWarehouseOrderId(data.warehouseOrderId);
        setTaskId(data.taskId);

        // Normalize and build render steps
        const normalized = normalizeWarehouseOrder(data.warehouseOrder);
        const { boxes: generatedBoxes, pallet: parsedPallet, resource } = buildRenderSteps(normalized);

        setBoxes(generatedBoxes);
        setPallet(parsedPallet);
        setResourceInfo(resource);
        setJsonInput(JSON.stringify(data.warehouseOrder, null, 2));

        // Set current step to the task sequence
        setCurrentStep(data.sequence);
        setLoading(false);
        return;
      }

      // Parse URL to get warehouse order and task IDs
      const pathParts = window.location.pathname.split('/');
      if (pathParts.length >= 4 && pathParts[2] === 'task') {
        const woId = pathParts[1];
        const tId = pathParts[3];

        console.log('Loading from API:', woId, tId);

        setWarehouseOrderId(woId);
        setTaskId(tId);

        // Fetch data from API
        const response = await fetch(`/api/warehouse-orders/${woId}`);
        if (!response.ok) {
          throw new Error('Warehouse order not found');
        }

        const ortecData = await response.json();

        // Normalize and build render steps
        const normalized = normalizeWarehouseOrder(ortecData);
        const { boxes: generatedBoxes, pallet: parsedPallet, resource } = buildRenderSteps(normalized);

        setBoxes(generatedBoxes);
        setPallet(parsedPallet);
        setResourceInfo(resource);
        setJsonInput(JSON.stringify(ortecData, null, 2));

        // Find current task sequence
        const currentTask = ortecData.loadInstructions.find(t => t.id === tId);
        if (currentTask) {
          setCurrentStep(currentTask.sequence);
        }

        setLoading(false);
      } else {
        // No URL params - load default pallet for development
        console.log('No URL params, loading SAP example pallet');
        const defaultData = PALLET_CONFIGURATIONS.sapExample.data;
        setJsonInput(JSON.stringify(defaultData, null, 2));

        const normalized = normalizeWarehouseOrder(defaultData);
        const { boxes: generatedBoxes, pallet: parsedPallet, resource } = buildRenderSteps(normalized);

        setBoxes(generatedBoxes);
        setPallet(parsedPallet);
        setResourceInfo(resource);
        setLoading(false);
      }
    } catch (err) {
      console.error('Error loading data:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  // Animation Loop for AUTO mode
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= totalBlocks) {
          console.log("Auto sequence complete at:", prev);
          setIsPlaying(false);
          return prev;
        }
        console.log(`Auto stepping: ${prev} -> ${prev + 1} (total: ${totalBlocks})`);
        return prev + 1;
      });
    }, 1500);

    return () => clearInterval(interval);
  }, [isPlaying, totalBlocks]);

  const handleSliderChange = (e) => {
    const val = parseInt(e.target.value);
    console.log('Slider changed to:', val);
    setCurrentStep(val);
    setIsPlaying(false);
  };

  const handleNext = () => {
    setCurrentStep(prev => {
      const next = Math.min(totalBlocks, prev + 1);
      console.log(`Next: ${prev} -> ${next}`);
      return next;
    });
  };

  const handlePrevious = () => {
    setCurrentStep(prev => {
      const previous = Math.max(0, prev - 1);
      console.log(`Previous: ${prev} -> ${previous}`);
      return previous;
    });
  };

  const handleParse = useCallback(() => {
    try {
      const normalized = normalizeWarehouseOrder(jsonInput);
      const { boxes: generatedBoxes, pallet: parsedPallet, resource } = buildRenderSteps(normalized);
      setBoxes(generatedBoxes);
      setPallet(parsedPallet);
      setResourceInfo(resource);
      setCurrentStep(0);
      setIsPlaying(false);

      console.log('Parsed boxes:', generatedBoxes.length);
      console.log('Unique sequences:', [...new Set(generatedBoxes.map(b => b.sequence))].sort((a, b) => a - b));
    } catch (e) {
      alert("Invalid JSON: " + e.message);
    }
  }, [jsonInput]);

  const handleCompleteTask = async () => {
    if (!taskId) {
      alert('No active task to complete');
      return;
    }

    try {
      const response = await fetch(`/api/tasks/${taskId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      const result = await response.json();

      if (result.success) {
        if (result.warehouseOrderCompleted) {
          alert('¡Warehouse Order Completado! 🎉');
          // Could redirect to a completion page or dashboard
        } else if (result.nextTaskUrl) {
          // Redirect to next task
          window.location.href = result.nextTaskUrl;
        }
      } else {
        alert('Error completing task: ' + result.error);
      }
    } catch (err) {
      console.error('Error completing task:', err);
      alert('Error completing task');
    }
  };

  // Derived state
  const currentBlockBoxes = currentStep > 0 ? boxes.filter(b => b.sequence === currentStep) : [];
  const currentBox = currentBlockBoxes.length > 0 ? currentBlockBoxes[0] : null;
  const nextBox = currentStep < totalBlocks ? boxes.find(b => b.sequence === currentStep + 1) : null;
  const isComplete = currentStep === totalBlocks && totalBlocks > 0;

  // Debug logging
  useEffect(() => {
    console.log('Current state:', { currentStep, totalBlocks, boxesCount: boxes.length });
  }, [currentStep, totalBlocks, boxes.length]);

  // Loading state
  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-gray-900 text-white">
        <div className="text-center">
          <div className="mb-4 text-6xl">⏳</div>
          <div className="text-xl">Loading warehouse order...</div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-gray-900 text-white">
        <div className="text-center">
          <div className="mb-4 text-6xl">❌</div>
          <div className="text-xl text-red-400">Error: {error}</div>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-6 py-3 bg-blue-600 rounded-lg hover:bg-blue-500"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen flex-col bg-gray-900 text-white overflow-hidden font-sans">

      {/* 3D Scene Area */}
      <div className="flex-1 relative w-full h-full">
        <Scene boxes={boxes} currentStep={currentStep} pallet={pallet} />

        {/* Top Header - Work Order Info */}
        <div className="absolute top-0 left-0 w-full p-4 md:p-6 flex flex-col gap-3 pointer-events-none z-10">

          {/* Warehouse Order ID Display (only show if we have a warehouse order) */}
          {warehouseOrderId && (
            <div className="pointer-events-auto">
              <div className="px-4 py-2 bg-gray-800/80 border border-gray-600 rounded-lg">
                <div className="text-xs text-gray-400 uppercase tracking-wider">Warehouse Order</div>
                <div className="text-sm font-mono text-orange-400 font-bold">{warehouseOrderId}</div>
              </div>
            </div>
          )}

          {/* Info Card */}
          <div className="pointer-events-auto bg-gray-800/90 backdrop-blur border border-gray-600 rounded-lg p-3 md:p-4 shadow-xl w-full max-w-[calc(100vw-32px)] md:max-w-sm transition-all">
            <div className="flex items-center gap-3 mb-1">
              <BoxIcon className="text-orange-500" size={18} />
              <span className="text-[10px] md:text-xs uppercase tracking-widest text-gray-400 font-bold">Work Order</span>
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight truncate">
              {warehouseOrderId ? `Task ${currentStep} of ${totalBlocks}` : 'Development Mode'}
            </h1>
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

        {/* Floating Instruction Panel */}
        <div className="mobile-bottom-panel absolute bottom-0 left-0 right-0 md:left-1/2 md:right-auto md:bottom-10 md:transform md:-translate-x-1/2 
                        bg-gray-800/95 backdrop-blur border-t md:border border-gray-600 
                        p-4 md:p-6 
                        rounded-t-2xl md:rounded-2xl 
                        shadow-2xl 
                        w-full md:w-[800px] 
                        flex flex-col gap-4 md:gap-6
                        z-20 max-h-[45vh] md:max-h-none overflow-y-auto md:overflow-visible touch-pan-y"
          style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}>

          {/* Dynamic Instructions */}
          <div className="flex flex-col gap-3 md:flex-row md:justify-between md:items-center border-b border-gray-700 pb-3 md:pb-4">
            {currentBox ? (
              <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                  <div className="text-[10px] md:text-xs text-orange-400 uppercase tracking-widest font-bold">
                    Task {currentStep} of {totalBlocks}
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
          <div className="flex flex-col-reverse md:flex-row items-center gap-4 md:gap-6 pb-safe">
            <div className="flex gap-2 w-full md:w-auto">
              <button
                onClick={handlePrevious}
                className="flex-1 md:flex-none p-3 md:p-3 rounded-xl bg-gray-700 hover:bg-gray-600 transition text-white border border-gray-600 flex justify-center items-center min-h-[48px] active:bg-gray-500"
                disabled={currentStep === 0}
              >
                <SkipBack size={20} />
              </button>

              <button
                onClick={() => {
                  console.log('Auto button clicked. Current playing:', isPlaying);
                  setIsPlaying(!isPlaying);
                }}
                className={`flex-[2] md:flex-none flex items-center justify-center gap-3 px-4 md:px-8 py-3 rounded-xl font-bold transition text-white shadow-lg border border-white/10 min-h-[48px] ${isPlaying ? 'bg-orange-600 hover:bg-orange-500 active:bg-orange-400' : 'bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-400'}`}
              >
                {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                <span>{isPlaying ? "PAUSAR" : "AUTO"}</span>
              </button>

              <button
                onClick={handleNext}
                className="flex-1 md:flex-none p-3 md:p-3 rounded-xl bg-gray-700 hover:bg-gray-600 transition text-white border border-gray-600 flex justify-center items-center min-h-[48px] active:bg-gray-500"
                disabled={currentStep >= totalBlocks}
              >
                <SkipForward size={20} />
              </button>

              {/* Complete Task Button (only show if we have an active task) */}
              {taskId && currentStep > 0 && (
                <button
                  onClick={handleCompleteTask}
                  className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 md:px-6 py-3 rounded-xl font-bold transition text-white shadow-lg border border-white/10 min-h-[48px] bg-green-600 hover:bg-green-500 active:bg-green-400"
                >
                  <span>✓</span>
                  <span>Completar</span>
                </button>
              )}
            </div>

            <div className="flex-1 flex flex-col gap-1 w-full relative">
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
        </div>

        {/* Sidebar Toggle */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="absolute top-4 right-4 md:top-6 md:right-6 bg-gray-800 p-3 rounded-xl text-gray-400 hover:text-white hover:bg-gray-700 shadow-xl z-30 transition border border-gray-600 min-w-[44px] min-h-[44px] flex items-center justify-center"
        >
          {isSidebarOpen ? <ChevronRight size={20} /> : <Settings size={20} />}
        </button>
      </div>

      {/* Sidebar (Input) */}
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