'use client';

import type { DocumentData } from 'firebase/firestore';
import React, { useState } from 'react';
import Image from 'next/image';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { 
  MapPin, 
  Camera, 
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
import { MessageButton } from './MessageButton';

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
        <DetailRow label="Engine Time" value={listing.engineTimeMin ? `${listing.engineTimeMin} hrs` : null} />
        <DetailRow label="Propeller Time" value={listing.propellerTimeMin ? `${listing.propellerTimeMin} hrs` : null} />
        <DetailRow label="Inspection Status" value={listing.inspectionStatus} />
        <DetailRow label="IFR Certified" value={listing.ifr ? 'Yes' : 'No'} />
      </DetailSection>
      <DetailSection title="Engine Details">
        <DetailRow label="Engine Type" value={listing.engineDetails} />
        <DetailRow label="Propeller Type" value={listing.propellerType} />
        <DetailRow label="Propeller Serial" value={listing.propellerSerials} />
      </DetailSection>
      <DetailSection title="Avionics">
        <DetailRow label="Avionics Package" value={listing.avionics} />
      </DetailSection>
      <DetailSection title="Additional Information">
        <DetailRow label="Exterior Details" value={listing.exteriorDetails} />
        <DetailRow label="Interior Details" value={listing.interiorDetails} />
        <DetailRow label="Additional Features" value={listing.additional} />
        <DetailRow label="YouTube Link" value={listing.youtubeLink ? 'Available' : null} />
      </DetailSection>
    </>
  );

  const renderEventDetails = () => (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 my-8">
        {listing.date && <StatCard icon={<CalendarDays size={28} />} label="Event Date" value={format(new Date(listing.date), 'MMM dd, yyyy')} />}
        {listing.location && <StatCard icon={<MapPin size={28} />} label="Location" value={listing.location} />}
      </div>
      <DetailSection title="Event Information">
        <DetailRow label="Event Date" value={listing.date ? format(new Date(listing.date), 'MMMM dd, yyyy') : null} />
        <DetailRow label="Location" value={listing.location} />
        <DetailRow label="Event Type" value={listing.type} />
      </DetailSection>
    </>
  );

  const renderRealEstateDetails = () => (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-8">
        {listing.beds && <StatCard icon={<BedDouble size={28} />} label="Bedrooms" value={listing.beds} />}
        {listing.baths && <StatCard icon={<Bath size={28} />} label="Bathrooms" value={listing.baths} />}
        {listing.hangerIncluded && <StatCard icon={<Building size={28} />} label="Hangar" value="Included" />}
      </div>
      <DetailSection title="Property Information">
        <DetailRow label="Bedrooms" value={listing.beds} />
        <DetailRow label="Bathrooms" value={listing.baths} />
        <DetailRow label="Hangar Included" value={listing.hangerIncluded ? 'Yes' : 'No'} />
      </DetailSection>
    </>
  );

  const renderPlaceDetails = () => (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 my-8">
        {listing.location && <StatCard icon={<MapPin size={28} />} label="Location" value={listing.location} />}
      </div>
      <DetailSection title="Place Information">
        <DetailRow label="Location" value={listing.location} />
        <DetailRow label="Place Type" value={listing.type} />
      </DetailSection>
    </>
  );

  const renderServiceDetails = () => (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 my-8">
        {listing.location && <StatCard icon={<MapPin size={28} />} label="Service Area" value={listing.location} />}
        {listing.type && <StatCard icon={<Briefcase size={28} />} label="Service Type" value={listing.type} />}
      </div>
      <DetailSection title="Service Information">
        <DetailRow label="Service Type" value={listing.type} />
        <DetailRow label="Service Area" value={listing.location} />
      </DetailSection>
    </>
  );

  const renderPartsDetails = () => (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 my-8">
        {listing.manufacturer && <StatCard icon={<Factory size={28} />} label="Manufacturer" value={listing.manufacturer} />}
        {listing.model && <StatCard icon={<Puzzle size={28} />} label="Model" value={listing.model} />}
        {listing.year && <StatCard icon={<CalendarDays size={28} />} label="Year" value={listing.year} />}
      </div>
      <DetailSection title="Parts Information">
        <DetailRow label="Manufacturer" value={listing.manufacturer} />
        <DetailRow label="Model" value={listing.model} />
        <DetailRow label="Year" value={listing.year} />
        <DetailRow label="Part Type" value={listing.type} />
        <DetailRow label="Condition" value={listing.condition} />
      </DetailSection>
    </>
  );

  const renderDetails = () => {
    switch (listing.category) {
      case 'Aircraft': return renderAircraftDetails();
      case 'Events': return renderEventDetails();
      case 'Real Estate': return renderRealEstateDetails();
      case 'Places': return renderPlaceDetails();
      case 'Services': return renderServiceDetails();
      case 'Parts': return renderPartsDetails();
      default: return null;
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">{listing.title || 'Untitled Listing'}</h1>
        <div className="flex items-center gap-4 text-muted-foreground">
          <div className="flex items-center gap-1">
            <MapPin size={16} />
            <span>{listing.location || 'Location not specified'}</span>
          </div>
          <div className="flex items-center gap-1">
            <Camera size={16} />
            <span>{listing.imageUrls?.length || 0} Images</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Image Gallery */}
          <div className="grid grid-cols-1 gap-2">
            <div className="relative aspect-[16/10] w-full overflow-hidden rounded-lg">
              <Image 
                src={mainImage} 
                alt="Main listing image" 
                fill
                className="object-cover bg-muted"
              />
            </div>
            <div className="grid grid-cols-5 gap-2">
              {listing.imageUrls?.map((url: string, index: number) => (
                <div
                  key={index}
                  className={`relative aspect-video w-full cursor-pointer overflow-hidden rounded-md transition-opacity hover:opacity-80 ${mainImage === url ? 'ring-2 ring-primary ring-offset-2' : ''}`}
                  onClick={() => setMainImage(url)}
                >
                  <Image 
                    src={url} 
                    alt={`Thumbnail ${index + 1}`} 
                    fill
                    className="object-cover bg-muted"
                  />
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

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Price and Seller Info */}
          <div className="bg-card border rounded-lg p-6">
            <div className="text-center mb-6">
              <div className="text-3xl font-bold text-foreground mb-2">
                ${listing.price ? (listing.price / 1000000).toFixed(1) + 'M' : 'Price not specified'}
              </div>
              <div className="text-sm text-muted-foreground">
                {listing.category} • {listing.year || 'Year not specified'}
              </div>
            </div>

            {/* Seller Information */}
            <div className="border-t pt-6">
              <div className="flex items-center gap-3 mb-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src="https://placehold.co/48x48.png" alt="Seller avatar" />
                  <AvatarFallback>{getInitials('Joe Seller')}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-foreground">Joe Seller</h3>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <span>5.0</span>
                    <span>(145 reviews)</span>
                  </div>
                </div>
              </div>

              {/* Message Button */}
              <MessageButton 
                listingId={listing.id}
                adOwnerId={listing.userId}
                listingData={listing}
              />
            </div>
          </div>

          {/* Additional Info */}
          <div className="bg-card border rounded-lg p-6">
            <h3 className="font-semibold text-foreground mb-4">Listing Information</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Posted</span>
                <span className="text-foreground">
                  {listing.createdAt ? format(new Date(listing.createdAt), 'MMM dd, yyyy') : 'Unknown'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Category</span>
                <span className="text-foreground">{listing.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Location</span>
                <span className="text-foreground">{listing.location}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
