"use client";

const SLOTS_REMAINING = 37;
const IS_SOLD_OUT = false;

export default function StatusBar() {
  const orderData = {
    slotsRemaining: SLOTS_REMAINING,
    isSoldOut: IS_SOLD_OUT,
  };

  return (
    <div className="bg-meathead-charcoal border-b border-meathead-red/30 py-3 px-4 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-4 text-sm md:text-base">
        <div className="flex items-center gap-2">
          <div className="relative flex items-center justify-center w-3 h-3">
            <span className="absolute inline-flex h-3 w-3 animate-ping bg-meathead-red rounded-full opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 bg-meathead-red rounded-full"></span>
          </div>
          <span className="text-gray-400 font-data">BATCH 01 (FRIDAY):</span>
        </div>
        {orderData.isSoldOut ? (
          <span className="font-data font-bold text-meathead-red text-lg uppercase animate-pulse">
            SOLD OUT
          </span>
        ) : (
          <span className="font-data font-bold text-white">
            <span className="text-meathead-red text-lg">{orderData.slotsRemaining}</span>
            /50 SLOTS REMAINING
          </span>
        )}
      </div>
    </div>
  );
}
