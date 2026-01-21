import * as React from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { employeeApi, type Employee } from "@/services/api"

interface DeleteEmployeeDialogProps {
  employee?: Employee,
  children: React.ReactNode
  onEmployeeDeleted?: () => void
}

export function DeleteEmployeeDialog({ employee, children, onEmployeeDeleted }: DeleteEmployeeDialogProps) {
  const [open, setOpen] = React.useState(false)
  const [isDeleting, setIsDeleting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const handleDelete = async () => {
    if (!employee?.id) return

    setError(null)
    setIsDeleting(true)

    try {
      await employeeApi.delete(employee.id)
      setOpen(false)
      if (onEmployeeDeleted) {
        onEmployeeDeleted()
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to delete employee. Please try again.")
      console.error("Error deleting employee:", err)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full cursor-pointer">
          {children}
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Delete Employee?</DialogTitle>
        </DialogHeader>

        <p className="text-sm text-muted-foreground">
          This action cannot be undone. This will permanently delete {employee?.firstName} {employee?.lastName}.
        </p>

        {error && (
          <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
            {error}
          </div>
        )}

        <div className="flex justify-end gap-2 pt-4">
          <Button 
            variant="outline" 
            onClick={() => {
              setOpen(false)
              setError(null)
            }}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}