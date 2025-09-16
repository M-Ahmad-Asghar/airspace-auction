"use client";

import { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { getPriceExtensions, addPriceExtension, priceExtensionExists } from '@/services/priceExtensionService';

interface PriceExtensionInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  userId: string;
}

export function PriceExtensionInput({ value, onChange, placeholder = "Select price extension...", userId }: PriceExtensionInputProps) {
  const [priceExtensions, setPriceExtensions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showAddNew, setShowAddNew] = useState(false);
  const [newExtension, setNewExtension] = useState('');

  useEffect(() => {
    loadPriceExtensions();
  }, []);

  const loadPriceExtensions = async () => {
    try {
      const extensions = await getPriceExtensions();
      setPriceExtensions(extensions);
    } catch (error) {
      console.error('Error loading price extensions:', error);
    }
  };

  const handleAddNew = async () => {
    if (!newExtension.trim()) return;

    const trimmedExtension = newExtension.trim();
    
    try {
      setIsLoading(true);
      
      // Check if extension already exists
      const exists = await priceExtensionExists(trimmedExtension);
      if (exists) {
        alert('This price extension already exists');
        setNewExtension('');
        setShowAddNew(false);
        return;
      }

      // Add new extension
      await addPriceExtension(trimmedExtension, userId);
      
      // Update local state
      setPriceExtensions(prev => [...prev, trimmedExtension]);
      
      // Select the new extension
      onChange(trimmedExtension);
      
      // Reset form
      setNewExtension('');
      setShowAddNew(false);
    } catch (error) {
      console.error('Error adding price extension:', error);
      alert('Failed to add price extension');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectChange = (selectedValue: string) => {
    if (selectedValue === 'add-new') {
      setShowAddNew(true);
    } else if (selectedValue === "none") {
      onChange("");
    } else {
      onChange(selectedValue);
    }
  };

  return (
    <div className="space-y-2">
      <Select value={value} onValueChange={handleSelectChange}>
        <SelectTrigger>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">None</SelectItem>
          {priceExtensions.map((extension) => (
            <SelectItem key={extension} value={extension}>
              {extension}
            </SelectItem>
          ))}
          <SelectItem value="add-new">
            <div className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add New
            </div>
          </SelectItem>
        </SelectContent>
      </Select>
      
      {showAddNew && (
        <div className="flex gap-2">
          <Input
            value={newExtension}
            onChange={(e) => setNewExtension(e.target.value)}
            placeholder="Enter new price extension..."
            onKeyPress={(e) => e.key === 'Enter' && handleAddNew()}
          />
          <Button 
            onClick={handleAddNew} 
            disabled={isLoading || !newExtension.trim()}
            size="sm"
          >
            {isLoading ? 'Adding...' : 'Add'}
          </Button>
          <Button 
            onClick={() => {
              setShowAddNew(false);
              setNewExtension('');
            }} 
            variant="outline" 
            size="sm"
          >
            Cancel
          </Button>
        </div>
      )}
    </div>
  );
}
