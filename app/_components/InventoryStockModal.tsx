"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog'

type Mode = 'in' | 'out'

interface Props {
  children?: React.ReactNode
  productName: string
  mode: Mode
  onConfirm: (qty: number, note?: string) => Promise<void> | void
}

export default function InventoryStockModal({ children, productName, mode, onConfirm }: Props) {
  const [open, setOpen] = useState(false)
  const [qty, setQty] = useState<number | ''>('')
  const [note, setNote] = useState('')
  const isOut = mode === 'out'

  const handleConfirm = async () => {
    const n = typeof qty === 'number' ? qty : parseFloat(String(qty))
    if (!n || n <= 0) {
      alert('Please enter a valid quantity')
      return
    }

    try {
      await onConfirm(n, note)
      setOpen(false)
      setQty('')
      setNote('')
    } catch (err) {
      console.error(err)
      alert('Action failed')
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children ? children : <Button>{isOut ? 'Stock Out' : 'Stock In'}</Button>}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isOut ? 'Stock Out' : 'Stock In'}</DialogTitle>
          <DialogDescription>
            {isOut ? 'Remove items from stock for:' : 'Add items to stock for:'} <strong>{productName}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-2">
          <label className="text-sm">Quantity</label>
          <Input
            type="number"
            value={qty}
            onChange={(e) => setQty(e.target.value === '' ? '' : Number(e.target.value))}
            placeholder="Enter quantity"
            min={1}
          />

          <label className="text-sm">Note (optional)</label>
          <Input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Reason or reference"
          />
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button onClick={handleConfirm}>{isOut ? 'Confirm Stock Out' : 'Confirm Stock In'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
