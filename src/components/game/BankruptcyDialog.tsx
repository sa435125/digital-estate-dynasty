import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertTriangle, Home, DollarSign } from "lucide-react";
import { Property } from "@/data/properties";

interface Player {
  id: string;
  name: string;
  money: number;
  properties: string[];
}

interface BankruptcyDialogProps {
  player: Player;
  properties: Property[];
  onSellProperty: (propertyId: string) => void;
  onGiveUp: () => void;
  isOpen: boolean;
}

export function BankruptcyDialog({ 
  player, 
  properties, 
  onSellProperty, 
  onGiveUp, 
  isOpen 
}: BankruptcyDialogProps) {
  const [selectedProperty, setSelectedProperty] = useState<string>("");

  const ownedProperties = properties.filter(p => 
    player.properties.includes(p.id) && p.owner === parseInt(player.id)
  );

  const handleSell = () => {
    if (selectedProperty) {
      onSellProperty(selectedProperty);
      setSelectedProperty("");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Geldnot!
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-sm">
              <strong>{player.name}</strong> hat nicht genug Geld! 
              Du kannst Immobilien verkaufen oder aufgeben.
            </p>
            <div className="mt-2 flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              <span className="text-sm font-medium">
                Aktuelles Geld: {player.money.toLocaleString('de-DE')} €
              </span>
            </div>
          </div>

          {ownedProperties.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <Home className="h-4 w-4" />
                Verkaufbare Immobilien:
              </h4>
              
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {ownedProperties.map(property => (
                  <Card 
                    key={property.id}
                    className={`cursor-pointer transition-all ${
                      selectedProperty === property.id 
                        ? 'ring-2 ring-primary bg-primary/5' 
                        : 'hover:bg-muted/50'
                    }`}
                    onClick={() => setSelectedProperty(property.id)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-sm">{property.name}</div>
                          <Badge variant="outline" className="text-xs mt-1">
                            {property.type === 'property' && 'Straße'}
                            {property.type === 'railroad' && 'Bahnhof'}
                            {property.type === 'utility' && 'Werk'}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-bold text-green-600">
                            {Math.floor(property.price * 0.5).toLocaleString('de-DE')} €
                          </div>
                          <div className="text-xs text-muted-foreground">
                            50% Verkaufswert
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Button 
                onClick={handleSell}
                disabled={!selectedProperty}
                className="w-full"
                variant="default"
              >
                Ausgewählte Immobilie verkaufen
              </Button>
            </div>
          )}

          <div className="pt-2 border-t">
            <Button 
              onClick={onGiveUp}
              variant="destructive"
              className="w-full"
            >
              Spiel aufgeben
            </Button>
            <p className="text-xs text-muted-foreground text-center mt-2">
              Alle deine Immobilien werden wieder frei verfügbar
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}