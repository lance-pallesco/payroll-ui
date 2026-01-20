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

const WORKING_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

interface EditEmployeeDialogProps {
  employee?: any,
  children: React.ReactNode
}

export function EditEmployeeDialog({ employee, children }: EditEmployeeDialogProps) {
  const [open, setOpen] = React.useState(false)
  const [dob, setDob] = React.useState<Date | undefined>(employee?.dob ? new Date(employee.dob) : undefined)
  const [workingDays, setWorkingDays] = React.useState<string[]>(employee?.workingDays || [])

  const toggleDay = (day: string) => {
    setWorkingDays(prev =>
      prev.includes(day)
        ? prev.filter(d => d !== day)
        : [...prev, day]
    )
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

        <div className="grid gap-4">
          {/* First Name */}
          <div className="grid gap-2">
            <Label htmlFor="firstName">First Name</Label>
            <Input id="firstName" defaultValue={employee?.firstName || ""} />
          </div>

          {/* Last Name */}
          <div className="grid gap-2">
            <Label htmlFor="lastName">Last Name</Label>
            <Input id="lastName" defaultValue={employee?.lastName || ""} />
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
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dob}
                  onSelect={setDob}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Daily Rate */}
          <div className="grid gap-2">
            <Label htmlFor="dailyRate">Daily Rate</Label>
            <Input id="dailyRate" type="number" defaultValue={employee?.dailyRate || ""} />
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
                  <DropdownMenuItem key={day} className="flex items-center gap-2" onSelect={e => e.preventDefault()}>
                    <Checkbox checked={workingDays.includes(day)} onCheckedChange={() => toggleDay(day)} />
                    <span>{day}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button>Save Changes</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
