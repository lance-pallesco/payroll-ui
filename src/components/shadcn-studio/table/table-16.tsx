import * as React from 'react'
import { format } from 'date-fns'
import { ArchiveIcon, Calculator, PencilIcon, PlusIcon, Trash2Icon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { AddEmployeeDialog } from '@/components/employees/AddEmployeeDialog'
import { EditEmployeeDialog } from '@/components/employees/EditEmployeeDialog'
import { DeleteEmployeeDialog } from '@/components/employees/DeleteEmployeeDialog'
import { ComputePayrollDialog } from '@/components/employees/ComputePayrollDialog'
import { employeeApi, type Employee } from '@/services/api'

const ProductTableDemo = () => {
  const [employees, setEmployees] = React.useState<Employee[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const fetchEmployees = React.useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await employeeApi.getAll()
      console.log(data)
      setEmployees(data)
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to fetch employees. Please check if the API is running.")
      console.error("Error fetching employees:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    fetchEmployees()
  }, [fetchEmployees])

  const handleRefresh = () => {
    fetchEmployees()
  }

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM dd, yyyy")
    } catch {
      return dateString
    }
  }

  const formatDailyRate = (rate: number) => {
    return `PHP ${rate.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  const formatWorkingDays = (days: number[]) => {
    if (!days || days.length === 0) return "N/A"

    const dayMap: Record<number, string> = {
      1: "M",
      2: "T",
      3: "W",
      4: "TH",
      5: "F",
      6: "S",
      7: "SU",
    }

    return days
      .map(d => dayMap[d])
      .filter(Boolean)
      .join("")
  }

  const getFullName = (employee: Employee) => {
    const parts = [
      employee.lastName,
      employee.firstName,
    ].filter(Boolean)
    return parts.join(", ")
  }

  return (
    <div className='space-y-4'>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Employees</h2>
        <div className="flex gap-2">
          <AddEmployeeDialog onEmployeeAdded={handleRefresh} />
        </div>
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
          {error}
        </div>
      )}

      <div className='w-full'>
        <div className='[&>div]:rounded-sm [&>div]:border'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className='text-left'>Full Name</TableHead>
                <TableHead className='text-left'>Date of Birth</TableHead>
                <TableHead className='text-left'>Working Days</TableHead>
                <TableHead className='text-left'>Daily Rate</TableHead>
                <TableHead className='w-0 text-center'>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className='text-left'>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    Loading employees...
                  </TableCell>
                </TableRow>
              ) : employees.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No employees found. Add your first employee to get started.
                  </TableCell>
                </TableRow>
              ) : (
                employees.map(employee => (
                  <TableRow key={employee.id} className='has-data-[state=checked]:bg-muted/50'>
                    <TableCell>
                      <div className='flex items-center gap-3'>
                        <div>
                          <div className='font-medium'>{getFullName(employee)}</div>
                          <span className='text-muted-foreground mt-0.5 text-xs'>{employee.employeeNumber}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{formatDate(employee.dateOfBirth)}</TableCell>
                    <TableCell>{formatWorkingDays(employee.workingDayNumbers)}</TableCell>
                    <TableCell>{formatDailyRate(employee.dailyRate)}</TableCell>
                    <TableCell className="flex justify-center gap-2">
                      {/* Edit */}
                      <EditEmployeeDialog employee={employee} onEmployeeUpdated={handleRefresh}>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="rounded-full cursor-pointer"
                          aria-label={`edit-${employee.id}`}
                        >
                          <PencilIcon />
                        </Button>
                      </EditEmployeeDialog>

                      {/* Delete */}
                      <DeleteEmployeeDialog employee={employee} onEmployeeDeleted={handleRefresh}>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="rounded-full cursor-pointer"
                          aria-label={`delete-${employee.id}`}
                        >
                          <Trash2Icon />
                        </Button>
                      </DeleteEmployeeDialog>

                      {/* Compute */}
                      <ComputePayrollDialog employee={employee}>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="rounded-full cursor-pointer"
                          aria-label={`compute-${employee.id}`}
                        >
                          <Calculator />
                        </Button>
                      </ComputePayrollDialog>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}

export default ProductTableDemo
