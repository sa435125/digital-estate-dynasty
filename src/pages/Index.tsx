import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { 
  Play, 
  Users, 
  Trophy, 
  Zap, 
  Settings, 
  Star,
  Crown,
  Gamepad2
} from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  const [selectedMode, setSelectedMode] = useState<string | null>(null);

  const gameModes = [
    {
      id: "classic",
      title: "Klassischer Modus",
      description: "Das originale Monopoly-Erlebnis mit bekannten Regeln",
      icon: Crown,
      players: "2-8 Spieler",
      duration: "60-120 Min",
      difficulty: "Mittel"
    },
    {
      id: "quick",
      title: "Schnellspiel",
      description: "Für kurze Sessions - weniger Runden, schneller Sieg!",
      icon: Zap,
      players: "2-6 Spieler", 
      duration: "30-45 Min",
      difficulty: "Einfach"
    },
    {
      id: "tournament",
      title: "Turniermodus",
      description: "Spiele in Ranglisten-Turnieren gegen Spieler weltweit",
      icon: Trophy,
      players: "8+ Spieler",
      duration: "Variable",
      difficulty: "Schwer"
    },
    {
      id: "coop",
      title: "Koop-Modus",
      description: "Schließe dich mit Freunden zusammen gegen KI-Gegner",
      icon: Users,
      players: "2-4 Teams",
      duration: "45-90 Min", 
      difficulty: "Mittel"
    }
  ];

  const features = [
    {
      icon: Gamepad2,
      title: "Modernes Design",
      description: "Intuitive Benutzeroberfläche mit animierten Spielfeldern"
    },
    {
      icon: Users,
      title: "Multiplayer",
      description: "Spiele mit Freunden oder zufälligen Gegnern online"
    },
    {
      icon: Star,
      title: "Personalisierung",
      description: "Erstelle deinen eigenen Avatar mit coolen Skins"
    },
    {
      icon: Trophy,
      title: "Turniere",
      description: "Nimm an Ranglisten-Turnieren teil und gewinne Belohnungen"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-board">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 py-16 sm:py-24">
          <div className="text-center">
            <div className="mb-8">
              <h1 className="text-6xl font-bold text-foreground mb-4">
                MONOPOLY
                <span className="block text-3xl text-primary font-normal mt-2">
                  Online Edition 2025
                </span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Erlebe Monopoly neu – als modernes, interaktives Webspiel mit intuitivem Design und cleveren Features. 
                Dein digitales Immobilien-Abenteuer wartet!
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                size="lg" 
                className="text-lg px-8 py-6 gap-2"
                onClick={() => navigate("/lobby")}
              >
                <Play className="h-5 w-5" />
                Spiel starten
              </Button>
              <Button variant="outline" size="lg" className="text-lg px-8 py-6 gap-2">
                <Settings className="h-5 w-5" />
                Einstellungen
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Game Modes Section */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-foreground mb-4">Spielmodi</h2>
          <p className="text-lg text-muted-foreground">
            Wähle deinen perfekten Spielmodus für jede Gelegenheit
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {gameModes.map((mode) => {
            const IconComponent = mode.icon;
            return (
              <Card
                key={mode.id}
                className={`cursor-pointer transition-all duration-300 hover:shadow-property hover:scale-105 ${
                  selectedMode === mode.id ? "ring-2 ring-primary ring-offset-2" : ""
                }`}
                onClick={() => setSelectedMode(mode.id)}
              >
                <CardHeader className="text-center">
                  <div className="mx-auto mb-4 w-16 h-16 bg-primary rounded-lg flex items-center justify-center">
                    <IconComponent className="h-8 w-8 text-primary-foreground" />
                  </div>
                  <CardTitle className="text-xl">{mode.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground text-center">
                    {mode.description}
                  </p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Spieler:</span>
                      <Badge variant="outline">{mode.players}</Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Dauer:</span>
                      <Badge variant="outline">{mode.duration}</Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Schwierigkeit:</span>
                      <Badge variant="secondary">{mode.difficulty}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {selectedMode && (
          <div className="mt-8 text-center">
            <Button 
              size="lg" 
              className="text-lg px-8 py-4 gap-2"
              onClick={() => navigate("/lobby")}
            >
              <Play className="h-5 w-5" />
              {gameModes.find(m => m.id === selectedMode)?.title} starten
            </Button>
          </div>
        )}
      </div>

      {/* Features Section */}
      <div className="bg-card/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-foreground mb-4">Besondere Features</h2>
            <p className="text-lg text-muted-foreground">
              Modernste Technologie trifft auf klassisches Spielvergnügen
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <div key={index} className="text-center">
                  <div className="mx-auto mb-4 w-16 h-16 bg-gradient-money rounded-lg flex items-center justify-center shadow-lg">
                    <IconComponent className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="text-4xl font-bold text-foreground mb-4">
          Bereit für dein Immobilien-Abenteuer?
        </h2>
        <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
          Starte jetzt dein erstes Spiel und erlebe Monopoly wie nie zuvor. 
          Sammle Immobilien, baue dein Imperium auf und werde zum Monopoly-Champion!
        </p>
        <Button 
          size="lg" 
          className="text-xl px-12 py-6 gap-3"
          onClick={() => navigate("/lobby")}
        >
          <Play className="h-6 w-6" />
          Jetzt spielen
        </Button>
      </div>
    </div>
  );
};

export default Index;
