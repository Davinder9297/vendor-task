import { cn } from '@/lib/utils';
import * as React from 'react';

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

export function Dialog({ open, onOpenChange, children }: DialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="fixed inset-0 bg-black/50"
        onClick={() => onOpenChange(false)}
      />
      {children}
    </div>
  );
}

type DialogContentProps = React.HTMLAttributes<HTMLDivElement>;

export function DialogContent({ className, children, ...props }: DialogContentProps) {
  return (
    <div
      className={cn(
        'relative z-50 w-full max-w-lg rounded-lg bg-white p-6 shadow-lg',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

type DialogHeaderProps = React.HTMLAttributes<HTMLDivElement>;

export function DialogHeader({ className, ...props }: DialogHeaderProps) {
  return (
    <div className={cn('flex flex-col space-y-1.5 text-center sm:text-left', className)} {...props} />
  );
}

type DialogTitleProps = React.HTMLAttributes<HTMLHeadingElement>;

export function DialogTitle({ className, ...props }: DialogTitleProps) {
  return (
    <h2 className={cn('text-lg font-semibold leading-none tracking-tight', className)} {...props} />
  );
}

type DialogDescriptionProps = React.HTMLAttributes<HTMLParagraphElement>;

export function DialogDescription({ className, ...props }: DialogDescriptionProps) {
  return (
    <p className={cn('text-sm text-gray-500', className)} {...props} />
  );
}

type DialogFooterProps = React.HTMLAttributes<HTMLDivElement>;

export function DialogFooter({ className, ...props }: DialogFooterProps) {
  return (
    <div
      className={cn('flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2', className)}
      {...props}
    />
  );
}
