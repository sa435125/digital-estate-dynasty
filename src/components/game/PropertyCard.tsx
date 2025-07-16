import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { X, Coins, Home, Building, Car, Zap } from "lucide-react";

interface Property {
  id: string;
  name: string;
  price: number;
  rent: number;
  color: string;
  owner?: number;
  type: 'property' | 'railroad' | 'utility' | 'special';
}

interface PropertyCardProps {
  property: Property;
  onClose: () => void;
  onBuy: () => void;
  canBuy: boolean;
}

export function PropertyCard({ property, onClose, onBuy, canBuy }: PropertyCardProps) {
  const getPropertyIcon = () => {
    switch (property.type) {
      case 'railroad':
        return <Car className="h-6 w-6" />;
      case 'utility':
        return <Zap className="h-6 w-6" />;
      default:
        return <Building className="h-6 w-6" />;
    }
  };

  const getPropertyDetails = () => {
    switch (property.type) {
      case 'railroad':
        return {
          description: "Bahnhof - Miete hängt von der Anzahl der Bahnhöfe ab",
          rentDetails: [
            "1 Bahnhof: 25€",
            "2 Bahnhöfe: 50€", 
            "3 Bahnhöfe: 100€",
            "4 Bahnhöfe: 200€"
          ]
        };
      case 'utility':
        return {
          description: "Versorgungsunternehmen - Miete = Würfelzahl × Faktor",
          rentDetails: [
            "1 Werk: Würfel × 4",
            "2 Werke: Würfel × 10"
          ]
        };
      default:
        return {
          description: "Straße - Miete steigt mit Häusern und Hotels",
          rentDetails: [
            `Grundmiete: ${property.rent}€`,
            `Mit 1 Haus: ${property.rent * 5}€`,
            `Mit 2 Häusern: ${property.rent * 15}€`,
            `Mit 3 Häusern: ${property.rent * 45}€`,
            `Mit 4 Häusern: ${property.rent * 80}€`,
            `Mit Hotel: ${property.rent * 110}€`
          ]
        };
    }
  };

  const details = getPropertyDetails();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md bg-card shadow-2xl animate-slide-up">
        <CardHeader className="relative">
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-2 top-2"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
          
          <div className="flex items-center gap-3">
            <div className={cn(
              "flex items-center justify-center w-12 h-12 rounded-lg text-white",
              property.type === 'property' && `bg-${property.color}`,
              property.type === 'railroad' && "bg-gray-700",
              property.type === 'utility' && "bg-amber-500"
            )}>
              {getPropertyIcon()}
            </div>
            <div>
              <CardTitle className="text-xl">{property.name}</CardTitle>
              <Badge variant="outline" className="mt-1">
                {property.type === 'property' && 'Straße'}
                {property.type === 'railroad' && 'Bahnhof'}
                {property.type === 'utility' && 'Werk'}
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Price */}
          <div className="flex items-center justify-between p-4 bg-gradient-money rounded-lg text-white">
            <div className="flex items-center gap-2">
              <Coins className="h-5 w-5" />
              <span className="font-medium">Kaufpreis:</span>
            </div>
            <span className="text-xl font-bold">
              {property.price.toLocaleString('de-DE')} €
            </span>
          </div>

          {/* Description */}
          <div>
            <h4 className="font-semibold mb-2">Beschreibung</h4>
            <p className="text-sm text-muted-foreground">
              {details.description}
            </p>
          </div>

          {/* Rent Details */}
          <div>
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <Home className="h-4 w-4" />
              Mietpreise
            </h4>
            <div className="space-y-1">
              {details.rentDetails.map((rent, index) => (
                <div key={index} className="flex justify-between text-sm p-2 bg-muted/50 rounded">
                  <span>{rent.split(':')[0]}:</span>
                  <span className="font-medium">{rent.split(':')[1]}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Owner Info */}
          {property.owner && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <div className="text-sm font-medium text-destructive">
                Diese Immobilie gehört bereits einem anderen Spieler!
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Schließen
            </Button>
            {canBuy && (
              <Button onClick={onBuy} className="flex-1">
                Kaufen
              </Button>
            )}
          </div>

          {!canBuy && !property.owner && (
            <div className="text-center text-sm text-muted-foreground">
              Nicht genug Geld zum Kauf verfügbar
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}