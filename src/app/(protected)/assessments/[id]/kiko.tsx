"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Sparkles } from "lucide-react";
import AIPromptModal from "./kikoPromptModal";

interface KikoProps {
  setFormData: (data: any) => void;
  jobId: string;
  title: string;
}

const Kiko: React.FC<KikoProps> = ({ setFormData, jobId, title }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div className="flex items-center justify-center p-4">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={() => setIsOpen(true)} // 👈 only opens modal
                variant="default"
                size="default"
                className="
                  relative overflow-hidden
                  bg-black hover:bg-black/90
                  text-white/90 hover:text-white
                  shadow-sm hover:shadow-md
                  transition-all duration-300 ease-out
                  hover:scale-102
                  border border-white/10 hover:border-white/20
                  px-5 py-2
                  rounded-xl
                  group
                "
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  <span className="font-medium">kiko</span>
                </div>
              </Button>
            </TooltipTrigger>
            <TooltipContent
              side="bottom"
              className="bg-neutral-800/95 backdrop-blur-sm text-white/90 border-neutral-700/50 rounded-lg px-3 py-2"
            >
              <p className="text-sm font-normal">
                generate assessment via ai copilot
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Modal */}
      <AIPromptModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        setFormData={setFormData}
        jobId={jobId}
        title={title}
      />
    </>
  );
};

export default Kiko;
