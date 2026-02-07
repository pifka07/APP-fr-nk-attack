import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer";
import { Check, ChevronDown } from "lucide-react";

export default function SelectDrawer({ value, onValueChange, options, placeholder, triggerClassName }) {
    const [open, setOpen] = useState(false);
    
    const selectedOption = options.find(opt => opt.value === value);
    
    return (
        <Drawer open={open} onOpenChange={setOpen}>
            <DrawerTrigger asChild>
                <Button 
                    variant="outline" 
                    className={`w-full justify-between select-none ${triggerClassName}`}
                >
                    <span>{selectedOption?.label || placeholder}</span>
                    <ChevronDown className="w-4 h-4 opacity-50" />
                </Button>
            </DrawerTrigger>
            <DrawerContent className="bg-slate-800 border-slate-700">
                <DrawerHeader>
                    <DrawerTitle className="text-white">{placeholder}</DrawerTitle>
                </DrawerHeader>
                <div className="px-4 pb-4 space-y-2 max-h-[60vh] overflow-y-auto">
                    {options.map((option) => (
                        <Button
                            key={option.value}
                            variant={value === option.value ? "default" : "outline"}
                            className={`w-full justify-between select-none ${
                                value === option.value 
                                    ? 'bg-teal-500 text-white hover:bg-teal-600' 
                                    : 'bg-slate-700 text-white hover:bg-slate-600 border-slate-600'
                            }`}
                            onClick={() => {
                                onValueChange(option.value);
                                setOpen(false);
                            }}
                        >
                            <span>{option.label}</span>
                            {value === option.value && <Check className="w-4 h-4" />}
                        </Button>
                    ))}
                </div>
            </DrawerContent>
        </Drawer>
    );
}