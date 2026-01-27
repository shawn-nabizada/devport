'use client';

import { useState, useCallback } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ConfirmDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description: string;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: 'default' | 'destructive';
    onConfirm: () => void;
    /** If provided, user must type this text to confirm (for dangerous actions) */
    confirmationText?: string;
    /** Placeholder text for confirmation input */
    confirmationPlaceholder?: string;
}

export function ConfirmDialog({
    open,
    onOpenChange,
    title,
    description,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    variant = 'default',
    onConfirm,
    confirmationText,
    confirmationPlaceholder = 'Type to confirm',
}: ConfirmDialogProps) {
    const [inputValue, setInputValue] = useState('');

    const isConfirmDisabled = confirmationText
        ? inputValue !== confirmationText
        : false;

    const handleConfirm = useCallback(() => {
        onConfirm();
        setInputValue('');
        onOpenChange(false);
    }, [onConfirm, onOpenChange]);

    const handleCancel = useCallback(() => {
        setInputValue('');
        onOpenChange(false);
    }, [onOpenChange]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>
                {confirmationText && (
                    <div className="space-y-2 py-4">
                        <Label htmlFor="confirmation">
                            Type <span className="font-mono font-bold">{confirmationText}</span> to confirm
                        </Label>
                        <Input
                            id="confirmation"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder={confirmationPlaceholder}
                            autoComplete="off"
                        />
                    </div>
                )}
                <DialogFooter>
                    <Button variant="outline" onClick={handleCancel}>
                        {cancelLabel}
                    </Button>
                    <Button
                        variant={variant === 'destructive' ? 'destructive' : 'default'}
                        onClick={handleConfirm}
                        disabled={isConfirmDisabled}
                    >
                        {confirmLabel}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// Hook for easier usage
export function useConfirmDialog() {
    const [isOpen, setIsOpen] = useState(false);

    const openDialog = useCallback(() => setIsOpen(true), []);
    const closeDialog = useCallback(() => setIsOpen(false), []);

    return {
        isOpen,
        setIsOpen,
        openDialog,
        closeDialog,
    };
}
