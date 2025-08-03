
import React, { useState, useEffect, useMemo } from 'react';
import { Location, Review, AccessibilityFilter } from './types';
import { generateInitialLocations } from './services/geminiService';
import Header from './components/Header';
import LocationCard from './components/LocationCard';
import LocationDetail from './components/LocationDetail';
import AddLocationForm from './components/AddLocationForm';
import FilterPanel from './components/FilterPanel';
import Modal from './components/Modal';

const App: React.FC = () => {
    const [locations, setLocations] = useState<Location[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
    const [isAddLocationModalOpen, setAddLocationModalOpen] = useState(false);
    
    const [activeFilters, setActiveFilters] = useState<AccessibilityFilter[]>([]);

    useEffect(() => {
        const fetchLocations = async () => {
            try {
                setError(null);
                setIsLoading(true);
                const initialLocations = await generateInitialLocations();
                setLocations(initialLocations);
            } catch (e) {
                setError('Failed to load accessibility data. Please refresh the page.');
                console.error(e);
            } finally {
                setIsLoading(false);
            }
        };
        fetchLocations();
    }, []);

    const handleFilterChange = (filter: AccessibilityFilter) => {
        setActiveFilters(prev => 
            prev.includes(filter) 
                ? prev.filter(f => f !== filter) 
                : [...prev, filter]
        );
    };

    const filteredLocations = useMemo(() => {
        if (activeFilters.length === 0) {
            return locations;
        }
        return locations.filter(location => {
            return activeFilters.every(filter => location.features[filter] === 'yes');
        });
    }, [locations, activeFilters]);

    const handleSelectLocation = (location: Location) => {
        setSelectedLocation(location);
    };

    const handleCloseModal = () => {
        setSelectedLocation(null);
    };
    
    const handleAddLocationClick = () => {
        setAddLocationModalOpen(true);
    };

    const handleAddLocation = (newLocation: Location) => {
        setLocations(prev => [newLocation, ...prev]);
        setAddLocationModalOpen(false);
        setSelectedLocation(newLocation);
    };

    const handleAddReview = (locationId: string, review: Omit<Review, 'id'>) => {
        const newReview: Review = { ...review, id: crypto.randomUUID() };
        setLocations(prevLocations => {
            return prevLocations.map(loc => {
                if (loc.id === locationId) {
                    const updatedReviews = [newReview, ...loc.reviews];
                    // Recalculate average rating
                    const totalRating = updatedReviews.reduce((sum, r) => sum + r.rating, 0);
                    const newOverallRating = totalRating / updatedReviews.length;
                    
                    const updatedLocation = {
                         ...loc, 
                         reviews: updatedReviews,
                         overallRating: newOverallRating
                    };
                    setSelectedLocation(updatedLocation); // Update selected location view
                    return updatedLocation;
                }
                return loc;
            });
        });
    };

    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="bg-white rounded-xl shadow-lg animate-pulse">
                            <div className="h-40 bg-gray-300 rounded-t-xl"></div>
                            <div className="p-4">
                                <div className="h-6 bg-gray-300 rounded w-3/4 mb-2"></div>
                                <div className="h-4 bg-gray-300 rounded w-1/2 mb-4"></div>
                                <div className="h-4 bg-gray-300 rounded w-full"></div>
                                <div className="h-4 bg-gray-300 rounded w-5/6 mt-1"></div>
                            </div>
                        </div>
                    ))}
                </div>
            );
        }

        if (error) {
            return <div className="text-center py-10 px-4 bg-red-100 text-red-700 rounded-lg">{error}</div>;
        }

        if (filteredLocations.length === 0) {
            return <div className="text-center py-10 px-4 bg-yellow-100 text-yellow-800 rounded-lg">No locations match the current filters. Try removing some to see more results.</div>;
        }

        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredLocations.map(location => (
                    <LocationCard key={location.id} location={location} onSelect={handleSelectLocation} />
                ))}
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <Header onAddLocationClick={handleAddLocationClick} />
            <main className="container mx-auto p-4 sm:p-6 lg:p-8">
                <FilterPanel activeFilters={activeFilters} onFilterChange={handleFilterChange} />
                {renderContent()}
            </main>
            
            <Modal isOpen={!!selectedLocation} onClose={handleCloseModal} title={selectedLocation?.name || ''}>
                {selectedLocation && <LocationDetail location={selectedLocation} onAddReview={handleAddReview} />}
            </Modal>

            <Modal isOpen={isAddLocationModalOpen} onClose={() => setAddLocationModalOpen(false)} title="Add a New Location">
                <AddLocationForm onAddLocation={handleAddLocation} onClose={() => setAddLocationModalOpen(false)} />
            </Modal>
        </div>
    );
};

export default App;