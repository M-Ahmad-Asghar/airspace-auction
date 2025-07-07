
"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { AIRCRAFT_MANUFACTURERS, AIRCRAFT_MODELS, AIRCRAFT_TYPES } from '@/lib/constants';
import { Filter, Search, X } from 'lucide-react';

export function FilterSort() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Initialize state from URL params
  const [searchTerm, setSearchTerm] = useState(searchParams.get('searchTerm') || '');
  const [type, setType] = useState(searchParams.get('type') || '');
  const [year, setYear] = useState<[number, number]>([
    Number(searchParams.get('yearMin')) || 1990,
    Number(searchParams.get('yearMax')) || new Date().getFullYear(),
  ]);
  const [manufacturer, setManufacturer] = useState(searchParams.get('manufacturer') || '');
  const [model, setModel] = useState(searchParams.get('model') || '');
  const [airframeHr, setAirframeHr] = useState<[number, number]>([
    Number(searchParams.get('airframeHrMin')) || 1,
    Number(searchParams.get('airframeHrMax')) || 72,
  ]);
  const [engineHr, setEngineHr] = useState<[number, number]>([
    Number(searchParams.get('engineHrMin')) || 0,
    Number(searchParams.get('engineHrMax')) || 56,
  ]);
  
  const [open, setOpen] = useState(false);

  // Update state if URL params change externally
  useEffect(() => {
    setSearchTerm(searchParams.get('searchTerm') || '');
    setType(searchParams.get('type') || '');
    setYear([
        Number(searchParams.get('yearMin')) || 1990,
        Number(searchParams.get('yearMax')) || new Date().getFullYear(),
    ]);
    setManufacturer(searchParams.get('manufacturer') || '');
    setModel(searchParams.get('model') || '');
    setAirframeHr([
        Number(searchParams.get('airframeHrMin')) || 1,
        Number(searchParams.get('airframeHrMax')) || 72,
    ]);
    setEngineHr([
        Number(searchParams.get('engineHrMin')) || 0,
        Number(searchParams.get('engineHrMax')) || 56,
    ]);
  }, [searchParams]);

  const handleApplyFilters = () => {
    const params = new URLSearchParams(searchParams);
    
    // Set or remove params based on state
    if (searchTerm) params.set('searchTerm', searchTerm); else params.delete('searchTerm');
    if (type) params.set('type', type); else params.delete('type');
    if (manufacturer) params.set('manufacturer', manufacturer); else params.delete('manufacturer');
    if (model) params.set('model', model); else params.delete('model');
    
    params.set('yearMin', String(year[0]));
    params.set('yearMax', String(year[1]));
    params.set('airframeHrMin', String(airframeHr[0]));
    params.set('airframeHrMax', String(airframeHr[1]));
    params.set('engineHrMin', String(engineHr[0]));
    params.set('engineHrMax', String(engineHr[1]));

    router.push(`/home?${params.toString()}`);
    setOpen(false);
  };
  
  const handleClearFilters = () => {
    router.push('/home');
    setOpen(false);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="mb-6">
          <Filter className="mr-2 h-4 w-4" />
          Filter/Sort
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4" align="start">
        <div className="space-y-4">
          <div>
            <Label htmlFor="search">Search</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input id="search" placeholder="Search..." className="pl-9" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            </div>
          </div>
          <div>
            <Label htmlFor="type">Type</Label>
            <Select value={type} onValueChange={setType}>
                <SelectTrigger id="type"><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>
                    {AIRCRAFT_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Year</Label>
            <div className="flex items-center gap-2">
              <Input type="number" value={year[0]} onChange={e => setYear([Number(e.target.value), year[1]])} placeholder="Min" />
              <Input type="number" value={year[1]} onChange={e => setYear([year[0], Number(e.target.value)])} placeholder="Max" />
            </div>
            <Slider value={year} onValueChange={setYear} min={1900} max={new Date().getFullYear()} step={1} className="mt-2" />
          </div>
          <div>
            <Label htmlFor="manufacturer">Manufacturer(s)</Label>
            <Select value={manufacturer} onValueChange={setManufacturer}>
                <SelectTrigger id="manufacturer"><SelectValue placeholder="Select manufacturer" /></SelectTrigger>
                <SelectContent>
                    {AIRCRAFT_MANUFACTURERS.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="model">Model</Label>
            <Select value={model} onValueChange={setModel}>
                <SelectTrigger id="model"><SelectValue placeholder="Select model" /></SelectTrigger>
                <SelectContent>
                    {AIRCRAFT_MODELS.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                </SelectContent>
            </Select>
          </div>
           <div>
            <Label>Airframe hr</Label>
            <div className="flex items-center gap-2">
              <Input type="number" value={airframeHr[0]} onChange={e => setAirframeHr([Number(e.target.value), airframeHr[1]])} placeholder="Min" />
              <Input type="number" value={airframeHr[1]} onChange={e => setAirframeHr([airframeHr[0], Number(e.target.value)])} placeholder="Max" />
            </div>
            <Slider value={airframeHr} onValueChange={setAirframeHr} min={0} max={100} step={1} className="mt-2" />
          </div>
           <div>
            <Label>Engine hr</Label>
            <div className="flex items-center gap-2">
              <Input type="number" value={engineHr[0]} onChange={e => setEngineHr([Number(e.target.value), engineHr[1]])} placeholder="Min" />
              <Input type="number" value={engineHr[1]} onChange={e => setEngineHr([engineHr[0], Number(e.target.value)])} placeholder="Max" />
            </div>
            <Slider value={engineHr} onValueChange={setEngineHr} min={0} max={100} step={1} className="mt-2" />
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="ghost" onClick={handleClearFilters}>Clear</Button>
              <Button onClick={handleApplyFilters}>Apply</Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
