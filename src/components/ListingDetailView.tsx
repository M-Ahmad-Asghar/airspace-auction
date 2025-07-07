'use client';

import type { DocumentData } from 'firebase/firestore';
import React, { useState } from 'react';
import Image from 'next/image';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { 
  MapPin, 
  Camera, 
  MessageSquare, 
  Heart, 
  Share2, 
  Bookmark,
  GaugeCircle,
  Wrench,
  Factory,
  Puzzle,
  CalendarDays,
  BedDouble,
  Bath,
  Building,
  Plane,
  Tag,
  Users,
  Briefcase
} from 'lucide-react';
import { format } from 'date-fns';

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}

const StatCard = ({ icon, label, value }: StatCardProps) => (
  <div className="flex items-center gap-4 rounded-lg border bg-card p-4 shadow-sm">
    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10 text-accent">
      {icon}
    </div>
    <div>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-xl font-bold text-foreground">{value}</p>
    </div>
  </div>
);


interface DetailRowProps {
  label: string;
  value: string | number | undefined | null;
}
const DetailRow = ({ label, value }: DetailRowProps) => {
  if (!value) return null;
  return (
    <div className="flex justify-between border-b py-3 text-sm">
      <p className="font-medium text-muted-foreground">{label}</p>
      <p className="font-semibold text-foreground">{value}</p>
    </div>
  );
};


interface DetailSectionProps {
  title: string;
  children: React.ReactNode;
}
const DetailSection = ({ title, children }: DetailSectionProps) => {
  const childArray = React.Children.toArray(children).filter(Boolean);
  if (childArray.length === 0) return null;

  return (
    <div className="pt-8">
      <h2 className="text-xl font-bold mb-4 text-foreground">{title}</h2>
      {children}
    </div>
  );
};

export function ListingDetailView({ listing }: { listing: DocumentData }) {
  const [mainImage, setMainImage] = useState(listing.imageUrls?.[0] || 'https://placehold.co/1200x800.png');
  
  const getInitials = (name: string | null | undefined) => {
    if (!name) return "U";
    return name.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase();
  };
  
  const renderAircraftDetails = () => (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 my-8">
        {listing.totalAirframeTime && <StatCard icon={<GaugeCircle size={28} />} label="Airframe Hours" value={listing.totalAirframeTime} />}
        {listing.engineTimeMin && <StatCard icon={<Wrench size={28} />} label="Engine hours" value={listing.engineTimeMin} />}
        {listing.manufacturer && <StatCard icon={<Factory size={28} />} label="Manufacturer" value={listing.manufacturer} />}
        {listing.model && <StatCard icon={<Puzzle size={28} />} label="Model" value={listing.model} />}
        {listing.year && <StatCard icon={<CalendarDays size={28} />} label="Year" value={listing.year} />}
      </div>
      <DetailSection title="Aircraft Information">
        <DetailRow label="Registration" value={listing.registration} />
        <DetailRow label="Serial Number" value={listing.propellerSerials} />
        <DetailRow label="Total Airframe Time" value={listing.totalAirframeTime ? `${listing.totalAirframeTime} hrs` : null} />
        <DetailRow label="Additional Equipment" value={listing.additional} />
      </DetailSection>
      <DetailSection title="Avionics">
        <DetailRow label="Avionics/Radios" value={listing.avionics} />
      </DetailSection>
      <DetailSection title="Engine Details">
          <DetailRow label="Engine" value={listing.engineDetails} />
          <DetailRow label="Engine Time" value={listing.engineTimeMin ? `${listing.engineTimeMin} hrs` : null} />
      </DetailSection>
      <DetailSection title="Propellers">
          <DetailRow label="Propeller" value={listing.propellerDetails} />
          <DetailRow label="Propeller Time" value={listing.propellerTimeMin ? `${listing.propellerTimeMin} hrs` : null} />
      </DetailSection>
       <DetailSection title="Exterior">
         <p className="text-sm text-foreground">{listing.exteriorDetails || '-'}</p>
      </DetailSection>
      <DetailSection title="Interior">
         <p className="text-sm text-foreground">{listing.interiorDetails || '-'}</p>
      </DetailSection>
       <DetailSection title="Inspection Status">
         <p className="text-sm text-foreground">{listing.inspectionStatus || '-'}</p>
      </DetailSection>
    </>
  );

  const renderPartDetails = () => (
     <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 my-8">
        {listing.price && <StatCard icon={<Tag size={28} />} label="Price" value={`$${listing.price.toLocaleString()}`} />}
        {listing.hours && <StatCard icon={<Wrench size={28} />} label="Hours" value={listing.hours} />}
        {listing.manufacturer && <StatCard icon={<Factory size={28} />} label="Manufacturer" value={listing.manufacturer} />}
        {listing.year && <StatCard icon={<CalendarDays size={28} />} label="Year" value={listing.year} />}
      </div>
      <DetailSection title="Part Information">
        <DetailRow label="Location" value={listing.location} />
        <DetailRow label="Manufacturer" value={listing.manufacturer} />
        <DetailRow label="Year" value={listing.year} />
        <DetailRow label="Hours" value={listing.hours} />
      </DetailSection>
    </>
  );

  const renderEventDetails = () => (
     <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 my-8">
        {listing.price && <StatCard icon={<Tag size={28} />} label="Price" value={`$${listing.price.toLocaleString()}`} />}
        {listing.date && <StatCard icon={<CalendarDays size={28} />} label="Date" value={format(new Date(listing.date), 'MMM dd, yyyy')} />}
        {listing.location && <StatCard icon={<MapPin size={28} />} label="Location" value={listing.location} />}
      </div>
    </>
  );

  const renderRealEstateDetails = () => (
     <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 my-8">
        {listing.price && <StatCard icon={<Tag size={28} />} label="Price" value={`$${listing.price.toLocaleString()}`} />}
        {listing.beds && <StatCard icon={<BedDouble size={28} />} label="Beds" value={listing.beds} />}
        {listing.baths && <StatCard icon={<Bath size={28} />} label="Baths" value={listing.baths} />}
        {listing.hangerIncluded && <StatCard icon={<Plane size={28} />} label="Hangar" value={listing.hangerIncluded} />}
      </div>
      <DetailSection title="Property Information">
        <DetailRow label="Location" value={listing.location} />
        <DetailRow label="Beds" value={listing.beds} />
        <DetailRow label="Baths" value={listing.baths} />
        <DetailRow label="Hangar Included" value={listing.hangerIncluded} />
      </DetailSection>
    </>
  );

  const renderPlaceDetails = () => (
     <>
      <div className="grid grid-cols-1 gap-4 my-8">
        {listing.location && <StatCard icon={<MapPin size={28} />} label="Location" value={listing.location} />}
      </div>
    </>
  );

  const renderServiceDetails = () => (
     <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 my-8">
        {listing.price && <StatCard icon={<Tag size={28} />} label="Price" value={`$${listing.price.toLocaleString()}`} />}
        {listing.location && <StatCard icon={<MapPin size={28} />} label="Location" value={listing.location} />}
      </div>
    </>
  );

  const renderDetails = () => {
    switch(listing.category) {
      case 'Aircraft': return renderAircraftDetails();
      case 'Parts': return renderPartDetails();
      case 'Events': return renderEventDetails();
      case 'Real Estate': return renderRealEstateDetails();
      case 'Places': return renderPlaceDetails();
      case 'Services': return renderServiceDetails();
      default: return null;
    }
  }

  const title = listing.category === 'Aircraft' 
    ? `${listing.year} ${listing.manufacturer} ${listing.model}` 
    : listing.title;


  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-4xl font-bold text-foreground">{title}</h1>
          <div className="flex items-center gap-4 text-muted-foreground mt-2">
            <div className="flex items-center gap-1.5">
              <MapPin size={16} />
              <span>{listing.location || '-'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Camera size={16} />
              <span>{listing.imageUrls?.length || 0} Images</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4 mt-4 md:mt-0">
          <div>
            <p className="text-3xl font-bold text-foreground">${listing.price ? Number(listing.price).toLocaleString() : 'N/A'}</p>
          </div>
          <div className="flex items-center gap-2">
            <Avatar>
              <AvatarImage src={listing.userAvatarUrl} data-ai-hint="person portrait"/>
              <AvatarFallback>{getInitials(listing.userName)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-foreground">Joe Seller</p>
              <p className="text-sm text-muted-foreground">5.0 (145)</p>
            </div>
          </div>
          <Button variant="ghost" size="icon">
            <MessageSquare />
          </Button>
        </div>
      </div>

      {/* Image Gallery */}
      <div className="grid grid-cols-1 gap-2">
        <div className="relative aspect-[16/10] w-full overflow-hidden rounded-lg">
          <Image src={mainImage} alt="Main listing image" layout="fill" objectFit="cover" className="bg-muted"/>
        </div>
        <div className="grid grid-cols-5 gap-2">
          {listing.imageUrls?.map((url: string, index: number) => (
            <div
              key={index}
              className={`relative aspect-video w-full cursor-pointer overflow-hidden rounded-md transition-opacity hover:opacity-80 ${mainImage === url ? 'ring-2 ring-primary ring-offset-2' : ''}`}
              onClick={() => setMainImage(url)}
            >
              <Image src={url} alt={`Thumbnail ${index + 1}`} layout="fill" objectFit="cover" className="bg-muted"/>
            </div>
          ))}
        </div>
      </div>

      {/* Actions and Description */}
      <div className="flex justify-between items-center mt-6 py-4 border-b">
         <p className="text-sm text-foreground max-w-4xl">{listing.description || '-'}</p>
         <div className="flex items-center gap-2">
            <Button variant="outline" size="icon"><Heart /></Button>
            <Button variant="outline" size="icon"><Share2 /></Button>
            <Button variant="outline" size="icon"><Bookmark /></Button>
         </div>
      </div>
      
      {/* Dynamic Details */}
      {renderDetails()}
    </div>
  );
}
