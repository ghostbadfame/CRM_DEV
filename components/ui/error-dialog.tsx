"use client";
import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  FunctionComponent,
  useEffect,
} from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./dialog";
import { Button } from "./button";

export interface ErrorDialogContextType {
  showDialog: (title: string, message: string, redirect?: boolean) => void;
}

interface ErrorDetails {
  title: string;
  message: string;
  redirect?: boolean;
}

const ErrorDialogContext = createContext<ErrorDialogContextType | null>(null);

export const useErrorDialog = () => useContext(ErrorDialogContext);

const ErrorDialog: React.FC<
  ErrorDetails & { isOpen: boolean; onClose: () => void }
> = ({ isOpen, title, message, redirect, onClose }) => {
  const router = useRouter();

  const handleClose = () => {
    onClose();
    if (redirect) {
      router.back();
    }
  };

  //timer to close the dialog in 2seconds
  useEffect(() => {
    if (!isOpen || title.toLowerCase().includes("error")) return;
    const timer = setTimeout(() => {
      console.log("should close now");
      handleClose();
    }, 2000);

    return () => {
      clearTimeout(timer);
    };
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px] group">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="text-sm leading-tight">{message}</div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="default" onClick={handleClose}>
              OK
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export const ErrorDialogProvider: FunctionComponent<{
  children: ReactNode;
}> = ({ children }) => {
  const [errorDialog, setErrorDialog] = useState<
    ErrorDetails & { isOpen: boolean }
  >({ title: "", message: "", isOpen: false });

  const showDialog = (title: string, message: string, redirect?: boolean) => {
    setErrorDialog({ title, message, redirect, isOpen: true });
  };

  const handleClose = () => {
    setErrorDialog((prev) => ({ ...prev, isOpen: false }));
  };

  return (
    <ErrorDialogContext.Provider value={{ showDialog }}>
      {children}
      <ErrorDialog {...errorDialog} onClose={handleClose} />
    </ErrorDialogContext.Provider>
  );
};
