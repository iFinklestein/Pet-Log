
import React, { useState, useEffect, useCallback } from "react";
import { useLocation, Link } from "react-router-dom";
import { Pet } from "@/api/entities";
import { VetVisit } from "@/api/entities";
import { Medication } from "@/api/entities";
import { Grooming } from "@/api/entities";
import { format, differenceInYears } from "date-fns";
import {
  Heart,
  Cake,
  Stethoscope,
  Pill,
  Scissors,
  ArrowLeft,
  Edit,
  Download,
  FileText
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// Badge import is removed as it's no longer used
import { createPageUrl } from "@/utils";
import { exportPetReportAsPDF } from "../components/utils/exportData";
// TodaysDashboard import is removed as it's no longer used

export default function PetDetailPage() {
  const location = useLocation();
  const [pet, setPet] = useState(null);
  const [vetVisits, setVetVisits] = useState([]);
  const [medications, setMedications] = useState([]);
  const [grooming, setGrooming] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false); // State for export button

  const getPetId = useCallback(() => {
    const params = new URLSearchParams(location.search);
    return params.get("petId");
  }, [location.search]);

  const loadData = useCallback(async (petId) => {
    setLoading(true);
    try {
      const [petData, vetData, medData, groomingData] = await Promise.all([
        Pet.get(petId),
        VetVisit.filter({ petId }, '-date', 5),
        Medication.filter({ petId, isActive: true }, '-startDate', 5),
        Grooming.filter({ petId }, '-date', 5),
      ]);
      setPet(petData);
      setVetVisits(vetData);
      setMedications(medData);
      setGrooming(groomingData);
    } catch (error) {
      console.error("Error loading pet details:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const petId = getPetId();
    if (petId) {
      loadData(petId);
    }
  }, [getPetId, loadData]);
  
  const handleExportReport = async () => {
    if (!pet) return;
    setExporting(true);
    try {
      const result = await exportPetReportAsPDF(pet.id);
      if (result.success) {
        alert(`✅ ${result.message}`);
      } else {
        alert(`❌ ${result.message}`);
      }
    } catch (error) {
      alert("❌ Failed to generate report.");
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 max-w-5xl mx-auto animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-48 mb-8"></div>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-1 space-y-4">
            <div className="h-48 bg-gray-200 rounded-lg"></div>
            <div className="h-32 bg-gray-200 rounded-lg"></div>
          </div>
          <div className="md:col-span-2 space-y-4">
            <div className="h-64 bg-gray-200 rounded-lg"></div>
            <div className="h-64 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!pet) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl">Pet not found.</h2>
        <Link to={createPageUrl("Pets")}>
          <Button variant="link">Go back to My Pets</Button>
        </Link>
      </div>
    );
  }

  const age = pet.dob ? `${differenceInYears(new Date(), new Date(pet.dob))} years old` : "Unknown age";

  return (
    <div className="p-4 md:p-8 bg-gradient-to-br from-orange-50 to-pink-50 min-h-screen">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <Link to={createPageUrl("Pets")} className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-4 h-4" />
            Back to My Pets
          </Link>
          <Button onClick={handleExportReport} disabled={exporting}>
            <Download className="w-4 h-4 mr-2" />
            {exporting ? 'Generating Report...' : 'Export Health Report'}
          </Button>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Left Column: Pet Info */}
          <div className="md:col-span-1 space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col items-center">
                  <Avatar className="w-24 h-24 mb-4 border-4 border-white shadow-md">
                    <AvatarImage src={pet.photoUrl} alt={pet.name} />
                    <AvatarFallback className="bg-orange-200 text-orange-700 text-3xl">
                      {pet.name[0]}
                    </AvatarFallback>
                  </Avatar>
                  <h1 className="text-2xl font-bold">{pet.name}</h1>
                  <p className="text-gray-600 capitalize">{pet.breed || pet.species}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">About</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-3">
                <div className="flex items-center gap-3">
                  <Heart className="w-4 h-4 text-gray-500" />
                  <span className="capitalize">{pet.sex}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Cake className="w-4 h-4 text-gray-500" />
                  <span>{age} ({format(new Date(pet.dob), 'MMM d, yyyy')})</span>
                </div>
                {pet.notes && (
                  <div className="flex items-start gap-3 pt-2 border-t">
                    <FileText className="w-4 h-4 text-gray-500 mt-0.5" />
                    <p className="text-gray-700">{pet.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Recent Activity */}
          <div className="md:col-span-2 space-y-6">
            {/* TodaysDashboard component was removed from here */}
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Stethoscope className="w-5 h-5 text-blue-500" />
                  Recent Vet Visits
                </CardTitle>
              </CardHeader>
              <CardContent>
                {vetVisits.length > 0 ? (
                  <ul className="space-y-3">
                    {vetVisits.map(visit => (
                      <li key={visit.id} className="text-sm">
                        <p className="font-medium">{visit.reason}</p>
                        <p className="text-gray-600">{visit.clinicName} - {format(new Date(visit.date), 'MMM d, yyyy')}</p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500">No recent vet visits recorded.</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Pill className="w-5 h-5 text-purple-500" />
                  Active Medications
                </CardTitle>
              </CardHeader>
              <CardContent>
                {medications.length > 0 ? (
                  <ul className="space-y-3">
                    {medications.map(med => (
                      <li key={med.id} className="text-sm">
                        <p className="font-medium">{med.name} ({med.dose} {med.unit})</p>
                        <p className="text-gray-600 capitalize">{med.frequency.replace(/_/g, ' ')}</p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500">No active medications.</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Scissors className="w-5 h-5 text-pink-500" />
                  Recent Grooming
                </CardTitle>
              </CardHeader>
              <CardContent>
                {grooming.length > 0 ? (
                  <ul className="space-y-3">
                    {grooming.map(g => (
                      <li key={g.id} className="text-sm">
                        <p className="font-medium capitalize">{g.type.replace(/_/g, ' ')}</p>
                        <p className="text-gray-600">{format(new Date(g.date), 'MMM d, yyyy')}</p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500">No recent grooming sessions.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
