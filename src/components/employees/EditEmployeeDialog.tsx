import * as React from "react"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import { employeeApi } from "@/services/api"
import type { Employee } from "@/services/api"

const WORKING_DAYS = [
  { label: "Monday", value: 1 },
  { label: "Tuesday", value: 2 },
  { label: "Wednesday", value: 3 },
  { label: "Thursday", value: 4 },
  { label: "Friday", value: 5 },
  { label: "Saturday", value: 6 },
  { label: "Sunday", value: 7 },
]


interface EditEmployeeDialogProps {
  employee?: Employee,
  children: React.ReactNode
  onEmployeeUpdated?: () => void
}

export function EditEmployeeDialog({ employee, children, onEmployeeUpdated }: EditEmployeeDialogProps) {
  const [open, setOpen] = React.useState(false)
  const [dob, setDob] = React.useState<Date | undefined>(employee?.dateOfBirth ? new Date(employee.dateOfBirth) : undefined)
  const [workingDays, setWorkingDays] = React.useState<number[]>(employee?.workingDayNumbers || [])
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (open && employee) {
      setDob(employee.dateOfBirth ? new Date(employee.dateOfBirth) : undefined)
      setWorkingDays(employee.workingDayNumbers || [])
      setError(null)
    }
  }, [open, employee])

  const toggleDay = (day: number) => {
    setWorkingDays(prev =>
      prev.includes(day)
        ? prev.filter(d => d !== day)
        : [...prev, day]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!employee?.id) return

    setError(null)
    
    const firstName = (document.getElementById("edit-firstName") as HTMLInputElement)?.value
    const lastName = (document.getElementById("edit-lastName") as HTMLInputElement)?.value
    const dailyRate = parseFloat((document.getElementById("edit-dailyRate") as HTMLInputElement)?.value || "0")

    if (!firstName || !lastName || !dob || !dailyRate || workingDays.length === 0) {
      setError("Please fill in all required fields")
      return
    }

    setIsSubmitting(true)

    try {
      await employeeApi.update(employee.id, {
        firstName,
        lastName,
        dateOfBirth: format(dob, "yyyy-MM-dd"),
        dailyRate,
        workingDayNumbers: workingDays,
      })

      setOpen(false)
      if (onEmployeeUpdated) {
        onEmployeeUpdated()
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to update employee. Please try again.")
      console.error("Error updating employee:", err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full cursor-pointer">
          <span>{children}</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Employee</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4">
          {error && (
            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
              {error}
            </div>
          )}

          {/* First Name */}
          <div className="grid gap-2">
            <Label htmlFor="edit-firstName">First Name</Label>
            <Input id="edit-firstName" defaultValue={employee?.firstName || ""} required />
          </div>

          {/* Last Name */}
          <div className="grid gap-2">
            <Label htmlFor="edit-lastName">Last Name</Label>
            <Input id="edit-lastName" defaultValue={employee?.lastName || ""} required />
          </div>

          {/* Date of Birth */}
          <div className="grid gap-2">
            <Label>Date of Birth</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "justify-start text-left font-normal",
                    !dob && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dob ? format(dob, "PPP") : "Select date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 overflow-hidden" align="start">
                <Calendar
                  mode="single"
                  selected={dob}
                  defaultMonth={dob}
                  captionLayout="dropdown"
                  onSelect={setDob}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Daily Rate */}
          <div className="grid gap-2">
            <Label htmlFor="edit-dailyRate">Daily Rate</Label>
            <Input id="edit-dailyRate" type="number" defaultValue={employee?.dailyRate || ""} step="0.01" min="0" required />
          </div>

          {/* Working Days */}
          <div className="grid gap-2">
            <Label>Working Days</Label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="justify-start">
                  {workingDays.length > 0
                    ? WORKING_DAYS
                        .filter(d => workingDays.includes(d.value))
                        .map(d => d.label)
                        .join(", ")
                    : "Select working days"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                {WORKING_DAYS.map(day => (
                  <DropdownMenuItem
                    key={day.value}
                    className="flex items-center gap-2"
                    onSelect={e => e.preventDefault()}
                  >
                    <Checkbox
                      checked={workingDays.includes(day.value)}
                      onCheckedChange={() => toggleDay(day.value)}
                    />
                    <span>{day.label}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button 
              type="button"
              variant="outline" 
              onClick={() => {
                setOpen(false)
                setError(null)
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
