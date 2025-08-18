import { useState, useEffect } from 'react';

export interface Package {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  duration: string;
  features: string;
  maxStudents: number | null;
  packageType: 'individual' | 'school';
  isActive: boolean;
}

interface PackageSelectorProps {
  packageType: 'individual' | 'school';
  selectedPackageId: string;
  onPackageSelect: (packageId: string) => void;
}

export function PackageSelector({ packageType, selectedPackageId, onPackageSelect }: PackageSelectorProps) {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const response = await fetch('/api/packages');
        if (response.ok) {
          const allPackages = await response.json();
          const filteredPackages = allPackages.filter((pkg: Package) => 
            pkg.packageType === packageType && pkg.isActive
          );
          setPackages(filteredPackages);
        }
      } catch (error) {
        console.error('Error fetching packages:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPackages();
  }, [packageType]);

  if (loading) {
    return <div className="text-center py-4">Loading packages...</div>;
  }

  if (packages.length === 0) {
    return <div className="text-center py-4">No packages available</div>;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold mb-4">
        Choose Your {packageType === 'individual' ? 'Learning' : 'School'} Package
      </h3>
      
      <div className="grid gap-4">
        {packages.map((pkg) => {
          const features = pkg.features ? pkg.features.split(',').map(f => f.trim()) : [];
          
          return (
            <div
              key={pkg.id}
              className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                selectedPackageId === pkg.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => onPackageSelect(pkg.id)}
              data-testid={`package-option-${pkg.id}`}
            >
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-semibold text-lg">{pkg.name}</h4>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-600">
                    ${pkg.price}
                  </div>
                  <div className="text-sm text-gray-500">
                    per {pkg.duration}
                  </div>
                </div>
              </div>
              
              {pkg.description && (
                <p className="text-gray-600 mb-3">{pkg.description}</p>
              )}
              
              {pkg.maxStudents && (
                <p className="text-sm text-gray-500 mb-2">
                  Up to {pkg.maxStudents} students
                </p>
              )}
              
              {features.length > 0 && (
                <ul className="text-sm space-y-1">
                  {features.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <span className="text-green-500 mr-2">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              )}
              
              <div className="mt-3">
                <input
                  type="radio"
                  name="package"
                  value={pkg.id}
                  checked={selectedPackageId === pkg.id}
                  onChange={() => onPackageSelect(pkg.id)}
                  className="mr-2"
                  data-testid={`radio-package-${pkg.id}`}
                />
                <label className="text-sm font-medium">
                  Select {pkg.name}
                </label>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}