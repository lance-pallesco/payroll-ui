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

const WORKING_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

interface AddEmployeeDialogProps {
  onEmployeeAdded?: () => void
}

export function AddEmployeeDialog({ onEmployeeAdded }: AddEmployeeDialogProps) {
  const [open, setOpen] = React.useState(false)
  const [dob, setDob] = React.useState<Date | undefined>()
  const [workingDays, setWorkingDays] = React.useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const toggleDay = (day: string) => {
    setWorkingDays(prev =>
      prev.includes(day)
        ? prev.filter(d => d !== day)
        : [...prev, day]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    
    const firstName = (document.getElementById("firstName") as HTMLInputElement)?.value
    const lastName = (document.getElementById("lastName") as HTMLInputElement)?.value
    const dailyRate = parseFloat((document.getElementById("dailyRate") as HTMLInputElement)?.value || "0")

    if (!firstName || !lastName || !dob || !dailyRate || workingDays.length === 0) {
      setError("Please fill in all required fields")
      return
    }

    setIsSubmitting(true)

    try {
      await employeeApi.create({
        firstName,
        lastName,
        dateOfBirth: format(dob, "yyyy-MM-dd"),
        dailyRate,
        workingDayNumbers: workingDays.map(day => WORKING_DAYS.indexOf(day) + 1),
      })

      setDob(undefined)
      setWorkingDays([])
      setOpen(false)
      if (onEmployeeAdded) {
        onEmployeeAdded()
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to create employee. Please try again.")
      console.error("Error creating employee:", err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="cursor-pointer">
          + Add Employee
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Employee</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4">

          {error && (
            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
              {error}
            </div>
          )}

          {/* First Name */}
          <div className="grid gap-2">
            <Label htmlFor="firstName">First Name</Label>
            <Input id="firstName" placeholder="Juan" required />
          </div>

          {/* Last Name */}
          <div className="grid gap-2">
            <Label htmlFor="lastName">Last Name</Label>
            <Input id="lastName" placeholder="Dela Cruz" required />
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
            <Label htmlFor="dailyRate">Daily Rate</Label>
            <Input
              id="dailyRate"
              type="number"
              placeholder="2000"
              step="0.01"
              min="0"
              required
            />
          </div>

          {/* Working Days */}
          <div className="grid gap-2">
            <Label>Working Days</Label>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="justify-start">
                  {workingDays.length > 0
                    ? workingDays.join(", ")
                    : "Select working days"}
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent className="w-56">
                {WORKING_DAYS.map(day => (
                  <DropdownMenuItem
                    key={day}
                    className="flex items-center gap-2"
                    onSelect={e => e.preventDefault()}
                  >
                    <Checkbox
                      checked={workingDays.includes(day)}
                      onCheckedChange={() => toggleDay(day)}
                    />
                    <span>{day}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Actions */}
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
              {isSubmitting ? "Saving..." : "Save Employee"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
