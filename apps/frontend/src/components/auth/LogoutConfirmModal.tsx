import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"

interface LogoutConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function LogoutConfirmModal({ isOpen, onClose, onConfirm }: LogoutConfirmModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-zinc-900 border-zinc-800 rounded-3xl p-8">
        <DialogHeader className="flex flex-col items-center text-center">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 text-red-500 shadow-inner">
            <LogOut className="h-8 w-8" />
          </div>
          <DialogTitle className="text-2xl font-bold tracking-tight text-white font-display">Sign out?</DialogTitle>
          <DialogDescription className="text-zinc-400 text-base mt-2">
            Are you sure you want to end your session? You will need to log in again to access your ledger.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex flex-col sm:flex-row gap-3 mt-6">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 rounded-xl bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700 hover:text-white h-auto py-4 font-semibold"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            className="flex-1 rounded-xl bg-red-600 shadow-lg shadow-red-600/20 hover:bg-red-500 h-auto py-4 font-semibold"
          >
            Yes, Sign out
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
