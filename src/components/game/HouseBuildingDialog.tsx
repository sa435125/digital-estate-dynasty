import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Home, Plus, Minus, Building } from "lucide-react";
import { Property } from "@/data/properties";

interface Player {
  id: string;
  name: string;
  money: number;
  properties: string[];
}

interface HouseBuildingDialogProps {
  player: Player;
  properties: Property[];
  onBuildHouse: (propertyId: string, houses: number) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function HouseBuildingDialog({ 
  player, 
  properties, 
  onBuildHouse, 
  isOpen,
  onClose 
}: HouseBuildingDialogProps) {
  const [selectedProperty, setSelectedProperty] = useState<string>("");
  const [housesToBuild, setHousesToBuild] = useState(0);

  // Get monopolies
  const getMonopolyProperties = () => {
    const ownedProps = properties.filter(p => 
      player.properties.includes(p.id) && 
      p.owner === parseInt(player.id) && 
      p.type === 'property'
    );

    const colorGroups: Record<string, Property[]> = {};
    ownedProps.forEach(prop => {
      if (!colorGroups[prop.color]) {
        colorGroups[prop.color] = [];
      }
      colorGroups[prop.color].push(prop);
    });

    const monopolies: Property[] = [];
    Object.entries(colorGroups).forEach(([color, props]) => {
      const totalInColor = properties.filter(p => p.color === color && p.type === 'property').length;
      if (props.length === totalInColor) {
        monopolies.push(...props);
      }
    });

    return monopolies;
  };

  const monopolyProperties = getMonopolyProperties();
  
  const selectedProp = properties.find(p => p.id === selectedProperty);
  const houseCost = selectedProp ? Math.floor(selectedProp.price * 0.5) : 0;
  const totalCost = houseCost * housesToBuild;
  const currentHouses = selectedProp?.houses || 0;
  const maxHouses = 5 - currentHouses; // 4 houses + 1 hotel

  const handleBuild = () => {
    if (selectedProperty && housesToBuild > 0) {
      onBuildHouse(selectedProperty, housesToBuild);
      setSelectedProperty("");
      setHousesToBuild(0);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Häuser bauen
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {monopolyProperties.length === 0 ? (
            <div className="p-4 bg-muted/50 rounded-lg text-center">
              <p className="text-sm text-muted-foreground">
                Du benötigst ein Monopol (alle Straßen einer Farbe), um Häuser zu bauen.
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <h4 className="font-medium">Monopole verfügbar:</h4>
                {monopolyProperties.map(property => (
                  <Card 
                    key={property.id}
                    className={`cursor-pointer transition-all ${
                      selectedProperty === property.id 
                        ? 'ring-2 ring-primary bg-primary/5' 
                        : 'hover:bg-muted/50'
                    }`}
                    onClick={() => {
                      setSelectedProperty(property.id);
                      setHousesToBuild(0);
                    }}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-sm">{property.name}</div>
                          <div className="flex items-center gap-2 mt-1">
                            <div className={`w-3 h-3 rounded ${property.color}`} />
                            <Badge variant="outline" className="text-xs">
                              {(property.houses || 0)} {(property.houses || 0) === 1 ? 'Haus' : 'Häuser'}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-bold">
                            {Math.floor(property.price * 0.5).toLocaleString('de-DE')} €
                          </div>
                          <div className="text-xs text-muted-foreground">
                            pro Haus
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {selectedProperty && (
                <div className="space-y-3 p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Anzahl Häuser:</span>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setHousesToBuild(Math.max(0, housesToBuild - 1))}
                        disabled={housesToBuild <= 0}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="min-w-8 text-center">{housesToBuild}</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setHousesToBuild(Math.min(maxHouses, housesToBuild + 1))}
                        disabled={housesToBuild >= maxHouses}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  <div className="text-sm text-muted-foreground">
                    Max. {maxHouses} weitere Häuser möglich
                  </div>

                  <div className="flex items-center justify-between p-2 bg-background rounded border">
                    <span>Gesamtkosten:</span>
                    <span className="font-bold">
                      {totalCost.toLocaleString('de-DE')} €
                    </span>
                  </div>

                  <Button
                    onClick={handleBuild}
                    disabled={housesToBuild <= 0 || totalCost > player.money}
                    className="w-full"
                  >
                    <Home className="h-4 w-4 mr-2" />
                    {housesToBuild} {housesToBuild === 1 ? 'Haus' : 'Häuser'} bauen
                  </Button>

                  {totalCost > player.money && (
                    <p className="text-xs text-destructive text-center">
                      Nicht genug Geld verfügbar
                    </p>
                  )}
                </div>
              )}
            </>
          )}

          <Button variant="outline" onClick={onClose} className="w-full">
            Schließen
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}