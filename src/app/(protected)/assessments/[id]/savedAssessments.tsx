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
    <DropdownMenu>
      <DropdownMenuTrigger className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 rounded-3xl">
        {loading
          ? "Loading..."
          : assessments.length > 0
          ? "Select Assessment"
          : "No Assessments"}
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Saved Assessments</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {assessments.map((a) => (
          <DropdownMenuItem
            key={a.id}
            onSelect={() => onSelect(a.data)} // pass data back
          >
            {a.data.title} ({a.id.slice(0, 6)})
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
