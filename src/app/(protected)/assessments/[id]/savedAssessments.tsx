"use client"

import { useEffect, useState } from "react"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { ChevronDown, Loader2 } from "lucide-react"

interface AssessmentRecord {
  id: string
  jobId: number
  data: any
}

export function AssessmentPicker({
  jobId,
  onSelect,
}: {
  jobId: number
  onSelect: (data: any) => void
}) {
  const [assessments, setAssessments] = useState<AssessmentRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchAssessments() {
      try {
        const res = await fetch(`/mock/assessments?jobId=${jobId}`)
        const data = await res.json()
        setAssessments(data)
      } catch (err) {
        console.error("Failed to fetch assessments", err)
      } finally {
        setLoading(false)
      }
    }
    fetchAssessments()
  }, [jobId])

  return (
    <TooltipProvider>
      <Tooltip>
        <DropdownMenu>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger className="
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
              inline-flex items-center gap-2
              font-medium
              text-sm
            ">
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>loading...</span>
                </>
              ) : assessments.length > 0 ? (
                <>
                  <span>pick</span>
                  <ChevronDown className="w-4 h-4" />
                </>
              ) : (
                <span>none</span>
              )}
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <DropdownMenuContent className="
            bg-neutral-800/95 backdrop-blur-sm 
            border-neutral-700/50 
            rounded-xl 
            shadow-lg
          ">
            <DropdownMenuLabel className="text-white/90 font-medium">
              saved assessments
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-neutral-700/50" />
            {assessments.map((a) => (
              <DropdownMenuItem
                key={a.id}
                onSelect={() => onSelect(a.data)}
                className="
                  text-white/80 hover:text-white
                  hover:bg-neutral-700/50
                  focus:bg-neutral-700/50
                  cursor-pointer
                  rounded-lg
                  mx-1
                  font-normal
                "
              >
                {a.data.title} ({a.id.slice(0, 6)})
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <TooltipContent side="bottom" className="bg-neutral-800/95 backdrop-blur-sm text-white/90 border-neutral-700/50 rounded-lg px-3 py-2">
          <p className="text-sm font-normal">browse your saved assessments</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}