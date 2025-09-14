import React, { useState, useEffect } from "react";
import { Feeding } from "@/api/entities";
import { FeedingSchedule } from "@/api/entities";
import { Pet } from "@/api/entities";
import { User } from "@/api/entities";
import { format, startOfDay, endOfDay } from "date-fns";
import {
  UtensilsCrossed,
  Plus,
  Search,
  Clock,
  Settings,
  CheckCircle2,
  Circle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";

export default function FeedingPage() {
  const [feedingSchedules, setFeedingSchedules] = useState([]);
  const [todaysFeedings, setTodaysFeedings] = useState([]);
  const [pets, setPets] = useState([]);
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    petId: "",
    times: ["08:00", "18:00"],
    foodBrand: "",
    foodType: "dry",
    amount: "",
    unit: "cups",
    notes: "",
    isActive: true
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const user = await User.me();
      const [feedingData, petData] = await Promise.all([
        Feeding.filter({ created_by: user.email }, '-created_date'),
        Pet.filter({ created_by: user.email, archived: false }, '-created_date')
      ]);
      setFeedingSchedules(feedingData);
      setPets(petData);
      
      // Load today's feeding schedule entries
      const today = new Date();
      const dayStart = startOfDay(today);
      const dayEnd = endOfDay(today);
      
      const todaysFeedingSchedule = await FeedingSchedule.filter({
        created_by: user.email
      }, '-scheduledDateTime');
      
      const todaysEntries = todaysFeedingSchedule.filter(feeding => {
        const scheduleDate = new Date(feeding.scheduledDateTime);
        return scheduleDate >= dayStart && scheduleDate <= dayEnd;
      });
      
      setTodaysFeedings(todaysEntries);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await Feeding.create(formData);
      await loadData();
      resetForm();
    } catch (error) {
      console.error("Error saving feeding schedule:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      petId: "",
      times: ["08:00", "18:00"],
      foodBrand: "",
      foodType: "dry",
      amount: "",
      unit: "cups",
      notes: "",
      isActive: true
    });
    setShowScheduleDialog(false);
  };

  const handleTimeChange = (index, time) => {
    const newTimes = [...formData.times];
    newTimes[index] = time;
    setFormData(prev => ({ ...prev, times: newTimes }));
  };

  const addFeedingTime = () => {
    setFormData(prev => ({ 
      ...prev, 
      times: [...prev.times, "12:00"] 
    }));
  };

  const removeFeedingTime = (index) => {
    if (formData.times.length > 1) {
      const newTimes = formData.times.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, times: newTimes }));
    }
  };

  const toggleFeedingStatus = async (feeding) => {
    try {
      const newStatus = feeding.status === 'completed' ? 'pending' : 'completed';
      const updateData = {
        ...feeding,
        status: newStatus,
        actualDateTime: newStatus === 'completed' ? new Date().toISOString() : null
      };
      
      await FeedingSchedule.update(feeding.id, updateData);
      await loadData();
    } catch (error) {
      console.error("Error updating feeding status:", error);
    }
  };

  const toggleScheduleActive = async (schedule) => {
    try {
      await Feeding.update(schedule.id, { 
        ...schedule, 
        isActive: !schedule.isActive 
      });
      await loadData();
    } catch (error) {
      console.error("Error updating feeding schedule:", error);
    }
  };

  if (loading) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-48"></div>
          <div className="space-y-4">
            {Array(5).fill(0).map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 bg-gradient-to-br from-orange-50 to-pink-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Feeding</h1>
            <p className="text-gray-600 mt-1">Manage your pets' feeding schedules</p>
          </div>
          <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
            <DialogTrigger asChild>
              <Button 
                disabled={pets.length === 0}
                className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
              >
                <Plus className="w-4 h-4 mr-2" />
                Set Feeding Schedule
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl">
              <DialogHeader>
                <DialogTitle>Set Feeding Schedule</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="petId">Pet *</Label>
                  <Select
                    value={formData.petId}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, petId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select pet" />
                    </SelectTrigger>
                    <SelectContent>
                      {pets.map((pet) => (
                        <SelectItem key={pet.id} value={pet.id}>
                          {pet.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Feeding Times</Label>
                  <div className="space-y-2">
                    {formData.times.map((time, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          type="time"
                          value={time}
                          onChange={(e) => handleTimeChange(index, e.target.value)}
                          className="flex-1"
                        />
                        {formData.times.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeFeedingTime(index)}
                          >
                            Remove
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addFeedingTime}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add Time
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="foodBrand">Food Brand</Label>
                    <Input
                      id="foodBrand"
                      value={formData.foodBrand}
                      onChange={(e) => setFormData(prev => ({ ...prev, foodBrand: e.target.value }))}
                      placeholder="e.g., Royal Canin"
                    />
                  </div>

                  <div>
                    <Label htmlFor="foodType">Food Type</Label>
                    <Select
                      value={formData.foodType}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, foodType: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dry">Dry Food</SelectItem>
                        <SelectItem value="wet">Wet Food</SelectItem>
                        <SelectItem value="raw">Raw Diet</SelectItem>
                        <SelectItem value="mixed">Mixed</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="amount">Amount per Feeding</Label>
                    <Input
                      id="amount"
                      value={formData.amount}
                      onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                      placeholder="e.g., 1, 1/2, 200"
                    />
                  </div>

                  <div>
                    <Label htmlFor="unit">Unit</Label>
                    <Select
                      value={formData.unit}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, unit: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cups">Cups</SelectItem>
                        <SelectItem value="oz">Ounces</SelectItem>
                        <SelectItem value="grams">Grams</SelectItem>
                        <SelectItem value="pounds">Pounds</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Special feeding instructions..."
                    rows={3}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={resetForm} className="flex-1">
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500">
                    Set Schedule
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {pets.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <UtensilsCrossed className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No pets found</h3>
              <p className="text-gray-600 mb-4">Add a pet first to set up feeding schedules</p>
              <Button variant="outline">
                Go to Pets
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Today's Feeding Checklist */}
            {todaysFeedings.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    Today's Feeding Checklist
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {todaysFeedings.map((feeding) => {
                    const pet = pets.find(p => p.id === feeding.petId);
                    return (
                      <div
                        key={feeding.id}
                        className={`flex items-center justify-between p-3 rounded-lg border ${
                          feeding.status === 'completed' ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={pet?.photoUrl} />
                            <AvatarFallback className="text-xs">
                              {pet?.name?.[0] || 'P'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{pet?.name || 'Unknown Pet'}</p>
                            <p className="text-sm text-gray-600">
                              {format(new Date(feeding.scheduledDateTime), 'h:mm a')}
                              {feeding.amount && ` - ${feeding.amount}`}
                            </p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant={feeding.status === 'completed' ? 'default' : 'outline'}
                          onClick={() => toggleFeedingStatus(feeding)}
                          className={feeding.status === 'completed' ? 'bg-green-600 hover:bg-green-700' : ''}
                        >
                          {feeding.status === 'completed' ? (
                            <>
                              <CheckCircle2 className="w-4 h-4 mr-1" />
                              Fed
                            </>
                          ) : (
                            <>
                              <Circle className="w-4 h-4 mr-1" />
                              Mark Fed
                            </>
                          )}
                        </Button>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            )}

            {/* Feeding Schedules */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-orange-500" />
                  Feeding Schedules
                </CardTitle>
              </CardHeader>
              <CardContent>
                {feedingSchedules.length === 0 ? (
                  <div className="text-center py-8">
                    <UtensilsCrossed className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No feeding schedules set</h3>
                    <p className="text-gray-600 mb-4">Set up feeding schedules for your pets</p>
                    <Button 
                      onClick={() => setShowScheduleDialog(true)}
                      className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Set First Schedule
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {feedingSchedules.map((schedule) => {
                      const pet = pets.find(p => p.id === schedule.petId);
                      return (
                        <div
                          key={schedule.id}
                          className={`border rounded-lg p-4 ${schedule.isActive ? '' : 'opacity-60 bg-gray-50'}`}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <Avatar className="w-12 h-12">
                                <AvatarImage src={pet?.photoUrl} />
                                <AvatarFallback>{pet?.name?.[0] || 'P'}</AvatarFallback>
                              </Avatar>
                              <div>
                                <h3 className="font-semibold">{pet?.name || 'Unknown Pet'}</h3>
                                <p className="text-sm text-gray-600">
                                  {schedule.times.length} feeding{schedule.times.length !== 1 ? 's' : ''} daily
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={schedule.isActive}
                                onCheckedChange={() => toggleScheduleActive(schedule)}
                              />
                              <span className="text-sm text-gray-600">
                                {schedule.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <strong>Times:</strong>
                              <div className="flex gap-1 mt-1 flex-wrap">
                                {schedule.times.map((time, index) => (
                                  <Badge key={index} variant="outline">
                                    <Clock className="w-3 h-3 mr-1" />
                                    {format(new Date(`2000-01-01T${time}`), 'h:mm a')}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            <div>
                              <strong>Amount:</strong>
                              <p>{schedule.amount} {schedule.unit} per feeding</p>
                            </div>
                            {schedule.foodBrand && (
                              <div>
                                <strong>Food:</strong>
                                <p>{schedule.foodBrand} ({schedule.foodType})</p>
                              </div>
                            )}
                          </div>

                          {schedule.notes && (
                            <div className="mt-3 p-2 bg-gray-50 rounded">
                              <strong className="text-sm">Notes:</strong>
                              <p className="text-sm text-gray-700">{schedule.notes}</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}