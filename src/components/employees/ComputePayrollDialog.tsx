import * as React from "react"
import { CalendarIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { employeeApi, type Employee } from "@/services/api"

interface ComputePayrollDialogProps {
  employee?: Employee,
  children?: React.ReactNode
}

export function ComputePayrollDialog({ employee, children }: ComputePayrollDialogProps) {
  const [open, setOpen] = React.useState(false)
  const [startDate, setStartDate] = React.useState<Date>()
  const [endDate, setEndDate] = React.useState<Date>()
  const [takeHomePay, setTakeHomePay] = React.useState<string>("")
  const [isComputing, setIsComputing] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (!open) {
      setStartDate(undefined)
      setEndDate(undefined)
      setTakeHomePay("")
      setError(null)
    }
  }, [open])

  const handleCompute = async () => {
    if (!employee?.id || !startDate || !endDate) {
      setError("Please select both start and end dates")
      return
    }

    if (endDate < startDate) {
      setError("End date must be after start date")
      return
    }

    setError(null)
    setIsComputing(true)

    try {
      const response = await employeeApi.computePay(employee.id, {
        startDate: format(startDate, "yyyy-MM-dd"),
        endDate: format(endDate, "yyyy-MM-dd"),
      })

      setTakeHomePay(`PHP ${response.takeHomePay.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`)
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to compute payroll. Please try again.")
      setTakeHomePay("")
      console.error("Error computing payroll:", err)
    } finally {
      setIsComputing(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full cursor-pointer">
          {children}
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Compute Payroll</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4">
          {error && (
            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
              {error}
            </div>
          )}

          {/* Employee Number */}
          <div className="grid gap-2">
            <Label>Employee Number</Label>
            <Input value={employee?.employeeNumber || ""} readOnly />
          </div>

          {/* Employee Name */}
          <div className="grid gap-2">
            <Label>Employee Name</Label>
            <Input 
              value={employee ? `${employee.lastName}, ${employee.firstName}` : ""} 
              readOnly 
            />
          </div>

          {/* Start Date */}
          <div className="grid gap-2">
            <Label>Start Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="justify-start">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, "PPP") : "Select date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus />
              </PopoverContent>
            </Popover>
          </div>

          {/* End Date */}
          <div className="grid gap-2">
            <Label>End Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="justify-start">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, "PPP") : "Select date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={endDate} onSelect={setEndDate} initialFocus />
              </PopoverContent>
            </Popover>
          </div>

          {/* Take-home Pay */}
          <div className="grid gap-2">
            <Label>Take-home Pay</Label>
            <Input value={takeHomePay} readOnly placeholder="PHP 0.00" className={takeHomePay ? "font-semibold text-green-600" : ""} />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button 
              variant="outline" 
              onClick={() => {
                setOpen(false)
                setError(null)
              }}
              disabled={isComputing}
            >
              Cancel
            </Button>
            <Button onClick={handleCompute} disabled={isComputing || !startDate || !endDate}>
              {isComputing ? "Computing..." : "Compute"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
