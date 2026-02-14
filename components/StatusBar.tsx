"use client";

import { useOrder } from "@/context/OrderContext";
import {
  LAUNCH_GOAL,
  getLaunchMilestone,
  getLaunchProgress,
} from "@/lib/launchProgress";

export default function StatusBar() {
  const { orderData } = useOrder();
  const waitlistCount = orderData.waitlistCount || 0;
  const launchProgress = getLaunchProgress(waitlistCount, LAUNCH_GOAL);
  const remainingToLaunch = Math.max(LAUNCH_GOAL - waitlistCount, 0);
  const launchMilestone = getLaunchMilestone(waitlistCount, LAUNCH_GOAL);

  let statusText = `${waitlistCount} PEOPLE JOINED`;
  if (launchMilestone === "momentum") {
    statusText = `${waitlistCount} JOINED • MOMENTUM`;
  } else if (launchMilestone === "almost") {
    statusText = `${remainingToLaunch} TO GO • ALMOST THERE`;
  } else if (launchMilestone === "done") {
    statusText = "WE DID IT! LAUNCH UNLOCKED";
  }

  return (
    <div className="bg-meathead-charcoal border-b border-meathead-red/30 py-2 px-4 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-3 text-xs sm:text-sm md:text-base">
        <div className="flex items-center gap-2">
          <div className="relative flex items-center justify-center w-3 h-3">
            <span className="absolute inline-flex h-3 w-3 animate-ping bg-meathead-red rounded-full opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 bg-meathead-red rounded-full"></span>
          </div>
          <span className="text-gray-400 font-data">LAUNCHING SOON IN TWIN CITY:</span>
        </div>
        <span className="font-data font-bold text-white">
          <span className="text-meathead-red">{statusText}</span>
        </span>
      </div>
      <div className="max-w-4xl mx-auto mt-1">
        <div className="w-full bg-meathead-black rounded-full h-1.5 overflow-hidden border border-meathead-red/30">
          <div
            className="bg-gradient-to-r from-meathead-red to-red-600 h-full rounded-full transition-all duration-700"
            style={{ width: `${launchProgress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
