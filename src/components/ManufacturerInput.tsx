"use client";

import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Check, Plus, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getManufacturers, searchManufacturers, addManufacturer, manufacturerExists } from '@/services/manufacturerService';
import { useToast } from '@/hooks/use-toast';

interface ManufacturerInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  userId?: string;
}

export function ManufacturerInput({ 
  value, 
  onChange, 
  placeholder = "Search or add manufacturer...", 
  disabled = false,
  userId = ""
}: ManufacturerInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [manufacturers, setManufacturers] = useState<string[]>([]);
  const [filteredManufacturers, setFilteredManufacturers] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [showAddOption, setShowAddOption] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Load manufacturers on component mount
  useEffect(() => {
    loadManufacturers();
  }, []);

  // Filter manufacturers based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredManufacturers(manufacturers);
      setShowAddOption(false);
    } else {
      const filtered = manufacturers.filter(manufacturer =>
        manufacturer.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredManufacturers(filtered);
      
      // Show add option if search term doesn't match any existing manufacturer
      const exactMatch = manufacturers.some(manufacturer =>
        manufacturer.toLowerCase() === searchTerm.toLowerCase()
      );
      setShowAddOption(!exactMatch && searchTerm.trim().length > 0);
    }
  }, [searchTerm, manufacturers]);

  const loadManufacturers = async () => {
    try {
      setIsLoading(true);
      const manufacturerData = await getManufacturers();
      const manufacturerNames = manufacturerData.map(m => m.name);
      setManufacturers(manufacturerNames);
      setFilteredManufacturers(manufacturerNames);
    } catch (error) {
      console.error('Error loading manufacturers:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load manufacturers',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchTerm(newValue);
    onChange(newValue);
    setIsOpen(true);
  };

  const handleManufacturerSelect = (manufacturer: string) => {
    setSearchTerm(manufacturer);
    onChange(manufacturer);
    setIsOpen(false);
  };

  const handleAddManufacturer = async () => {
    if (!searchTerm.trim() || !userId) return;
    
    try {
      setIsAdding(true);
      
      // Check if manufacturer already exists
      const exists = await manufacturerExists(searchTerm.trim());
      if (exists) {
        toast({
          variant: 'destructive',
          title: 'Manufacturer exists',
          description: 'This manufacturer already exists',
        });
        return;
      }

      // Add new manufacturer
      await addManufacturer(searchTerm.trim(), userId);
      
      // Reload manufacturers list
      await loadManufacturers();
      
      // Select the newly added manufacturer
      handleManufacturerSelect(searchTerm.trim());
      
      toast({
        title: 'Success',
        description: 'Manufacturer added successfully',
      });
    } catch (error) {
      console.error('Error adding manufacturer:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to add manufacturer',
      });
    } finally {
      setIsAdding(false);
    }
  };

  const handleInputFocus = () => {
    setIsOpen(true);
  };

  const handleInputBlur = () => {
    // Delay closing to allow clicking on dropdown items
    setTimeout(() => {
      setIsOpen(false);
    }, 200);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && showAddOption && !isAdding) {
      e.preventDefault();
      handleAddManufacturer();
    }
  };

  return (
    <div className="relative">
      <Input
        ref={inputRef}
        value={searchTerm}
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full"
      />
      
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto"
        >
          {isLoading ? (
            <div className="p-3 text-center text-gray-500">
              <Loader2 className="h-4 w-4 animate-spin mx-auto mb-2" />
              Loading manufacturers...
            </div>
          ) : (
            <>
              {filteredManufacturers.length > 0 && (
                <div className="p-1">
                  {filteredManufacturers.map((manufacturer) => (
                    <button
                      key={manufacturer}
                      type="button"
                      className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded-sm flex items-center justify-between"
                      onClick={() => handleManufacturerSelect(manufacturer)}
                    >
                      <span>{manufacturer}</span>
                      {value === manufacturer && (
                        <Check className="h-4 w-4 text-green-600" />
                      )}
                    </button>
                  ))}
                </div>
              )}
              
              {showAddOption && (
                <div className="border-t border-gray-200 p-1">
                  <button
                    type="button"
                    className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded-sm flex items-center justify-between"
                    onClick={handleAddManufacturer}
                    disabled={isAdding}
                  >
                    <span className="flex items-center">
                      <Plus className="h-4 w-4 mr-2 text-blue-600" />
                      Add "{searchTerm}"
                    </span>
                    {isAdding && (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    )}
                  </button>
                </div>
              )}
              
              {filteredManufacturers.length === 0 && !showAddOption && searchTerm && (
                <div className="p-3 text-center text-gray-500">
                  No manufacturers found
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
