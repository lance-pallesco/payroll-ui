import { ArchiveIcon, Calculator, PencilIcon, PlusIcon, Trash2Icon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { AddEmployeeDialog } from '@/components/employees/AddEmployeeDialog'
import { EditEmployeeDialog } from '@/components/employees/EditEmployeeDialog'
import { DeleteEmployeeDialog } from '@/components/employees/DeleteEmployeeDialog'
import { ComputePayrollDialog } from '@/components/employees/ComputePayrollDialog'

const items = [
  {
    id: '1',
    productName: 'Chair',
    model: 'Wooden Garden  Chair',
    src: 'https://cdn.shadcnstudio.com/ss-assets/products/product-1.png',
    fallback: 'WGC',
    color: 'Black',
    category: 'Furniture',
    price: '$269.09'
  },
  {
    id: '2',
    productName: 'Nike Shoes',
    model: 'Jordan 1 Retro OG',
    src: 'https://cdn.shadcnstudio.com/ss-assets/products/product-2.png',
    fallback: 'J1R',
    color: 'Red',
    category: 'Sneakers',
    price: '$150.00'
  },
  {
    id: '3',
    productName: 'OnePluse',
    model: 'OnePlus 7 Pro',
    src: 'https://cdn.shadcnstudio.com/ss-assets/products/product-3.png',
    fallback: 'O7P',
    color: 'Nebula Blue',
    category: 'Smartphone',
    price: '$869.00'
  },
  {
    id: '4',
    productName: 'Nintendo',
    model: 'Nintendo Switch',
    src: 'https://cdn.shadcnstudio.com/ss-assets/products/product-4.png',
    fallback: 'NS',
    color: 'Neon Blue and Red',
    category: 'Console Gaming',
    price: '$499.00'
  },
  {
    id: '5',
    productName: 'Apple Magic Mouse',
    model: 'Apple Magic Mouse',
    src: 'https://cdn.shadcnstudio.com/ss-assets/products/product-5.png',
    fallback: 'AMM',
    color: 'Black',
    category: 'Electronics',
    price: '$110.29'
  }
]

const ProductTableDemo = () => {

  return (

    <div className='space-y-4'>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Employees</h2>
        <AddEmployeeDialog />
      </div>
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
            {items.map(item => (
              <TableRow key={item.id} className='has-data-[state=checked]:bg-muted/50'>
                <TableCell>
                  <div className='flex items-center gap-3'>
                    <div>
                      <div className='font-medium'>{item.productName}</div>
                      <span className='text-muted-foreground mt-0.5 text-xs'>{item.model}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{item.color}</TableCell>
                <TableCell>{item.category}</TableCell>
                <TableCell>{item.price}</TableCell>
                <TableCell className="flex justify-center gap-2">
                  {/* Edit */}
                  <EditEmployeeDialog employee={item}>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-full cursor-pointer"
                      aria-label={`edit-${item.id}`}
                    >
                      <PencilIcon />
                    </Button>
                  </EditEmployeeDialog>

                  {/* Delete */}
                  <DeleteEmployeeDialog employee={item}>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-full cursor-pointer"
                      aria-label={`delete-${item.id}`}
                    >
                      <Trash2Icon />
                    </Button>
                  </DeleteEmployeeDialog>

                  {/* Compute */}
                  <ComputePayrollDialog employee={item}>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-full cursor-pointer"
                      aria-label={`compute-${item.id}`}
                    >
                      <Calculator />
                    </Button>
                  </ComputePayrollDialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  </div>
  )
}

export default ProductTableDemo
