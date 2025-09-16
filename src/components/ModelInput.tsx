"use client";

import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Check, Plus, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getModels, searchModels, addModel, modelExists } from '@/services/modelService';
import { useToast } from '@/hooks/use-toast';

interface ModelInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  userId?: string;
}

export function ModelInput({ 
  value, 
  onChange, 
  placeholder = "Search or add model...", 
  disabled = false,
  userId = ""
}: ModelInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [models, setModels] = useState<string[]>([]);
  const [filteredModels, setFilteredModels] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [showAddOption, setShowAddOption] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Load models on component mount
  useEffect(() => {
    loadModels();
  }, []);

  // Filter models based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredModels(models);
      setShowAddOption(false);
    } else {
      const filtered = models.filter(model =>
        model.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredModels(filtered);
      
      // Show add option if search term doesn't match any existing model
      const exactMatch = models.some(model =>
        model.toLowerCase() === searchTerm.toLowerCase()
      );
      setShowAddOption(!exactMatch && searchTerm.trim().length > 0);
    }
  }, [searchTerm, models]);

  const loadModels = async () => {
    try {
      setIsLoading(true);
      const modelData = await getModels();
      const modelNames = modelData.map(m => m.name);
      setModels(modelNames);
      setFilteredModels(modelNames);
    } catch (error) {
      console.error('Error loading models:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load models',
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

  const handleModelSelect = (model: string) => {
    setSearchTerm(model);
    onChange(model);
    setIsOpen(false);
  };

  const handleAddModel = async () => {
    if (!searchTerm.trim() || !userId) return;
    
    try {
      setIsAdding(true);
      
      // Check if model already exists
      const exists = await modelExists(searchTerm.trim());
      if (exists) {
        toast({
          variant: 'destructive',
          title: 'Model exists',
          description: 'This model already exists',
        });
        return;
      }

      // Add new model
      await addModel(searchTerm.trim(), userId);
      
      // Reload models list
      await loadModels();
      
      // Select the newly added model
      handleModelSelect(searchTerm.trim());
      
      toast({
        title: 'Success',
        description: 'Model added successfully',
      });
    } catch (error) {
      console.error('Error adding model:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to add model',
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
      handleAddModel();
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
              Loading models...
            </div>
          ) : (
            <>
              {filteredModels.length > 0 && (
                <div className="p-1">
                  {filteredModels.map((model) => (
                    <button
                      key={model}
                      type="button"
                      className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded-sm flex items-center justify-between"
                      onClick={() => handleModelSelect(model)}
                    >
                      <span>{model}</span>
                      {value === model && (
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
                    onClick={handleAddModel}
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
              
              {filteredModels.length === 0 && !showAddOption && searchTerm && (
                <div className="p-3 text-center text-gray-500">
                  No models found
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
