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
    <div className="min-h-screen bg-gradient-hero">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-16 sm:py-24">
          <div className="text-center">
            <div className="mb-8 animate-bounce-in">
              <div className="mx-auto w-24 h-24 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-6 shadow-game">
                <Crown className="h-12 w-12 text-yellow-400" />
              </div>
              <h1 className="text-6xl font-bold text-white mb-4 drop-shadow-lg">
                MYSTISCHES
                <span className="block text-3xl text-yellow-400 font-normal mt-2">
                  MONOPOLY REICH
                </span>
              </h1>
              <p className="text-xl text-white/90 max-w-3xl mx-auto leading-relaxed drop-shadow">
                Erlebe Monopoly neu – als modernes, interaktives Fantasy-Spiel mit intuitivem Design. 
                Dein digitales Immobilien-Abenteuer in mystischen Landen wartet!
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                size="lg" 
                className="text-lg px-8 py-6 gap-2 bg-gradient-success hover:scale-105 transition-all shadow-property animate-pulse-glow"
                onClick={() => {
                  localStorage.removeItem('monopoly-game-data');
                  navigate("/lobby");
                }}
              >
                <Play className="h-5 w-5" />
                Abenteuer starten
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="text-lg px-8 py-6 gap-2 border-white/30 text-white hover:bg-white/10 backdrop-blur-sm"
              >
                <Settings className="h-5 w-5" />
                Einstellungen
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Game Modes Section */}
      <div className="bg-white/5 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4 drop-shadow-lg">Spielmodi</h2>
            <p className="text-lg text-white/80 drop-shadow">
              Wähle deinen perfekten Spielmodus für jede Gelegenheit
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {gameModes.map((mode) => {
              const IconComponent = mode.icon;
              return (
                <Card
                  key={mode.id}
                  className={`cursor-pointer transition-all duration-300 hover:shadow-property hover:scale-105 bg-white/10 backdrop-blur-sm border-white/20 ${
                    selectedMode === mode.id ? "ring-2 ring-yellow-400 ring-offset-2 ring-offset-transparent" : ""
                  }`}
                  onClick={() => setSelectedMode(mode.id)}
                >
                <CardHeader className="text-center">
                  <div className="mx-auto mb-4 w-16 h-16 bg-gradient-success rounded-lg flex items-center justify-center shadow-property">
                    <IconComponent className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-xl text-white">{mode.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-white/70 text-center">
                    {mode.description}
                  </p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-white/80">Spieler:</span>
                      <Badge variant="outline" className="border-white/30 text-white/90 bg-white/10">
                        {mode.players}
                      </Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-white/80">Dauer:</span>
                      <Badge variant="outline" className="border-white/30 text-white/90 bg-white/10">
                        {mode.duration}
                      </Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-white/80">Schwierigkeit:</span>
                      <Badge variant="secondary" className="bg-white/20 text-white border-0">
                        {mode.difficulty}
                      </Badge>
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
              className="text-lg px-8 py-4 gap-2 bg-gradient-success hover:scale-105 transition-all"
              onClick={() => navigate("/lobby")}
            >
              <Play className="h-5 w-5" />
              {gameModes.find(m => m.id === selectedMode)?.title} starten
            </Button>
          </div>
        )}
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-black/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4 drop-shadow-lg">Besondere Features</h2>
            <p className="text-lg text-white/80 drop-shadow">
              Modernste Technologie trifft auf klassisches Spielvergnügen
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <div key={index} className="text-center">
                  <div className="mx-auto mb-4 w-16 h-16 bg-gradient-money rounded-lg flex items-center justify-center shadow-property">
                    <IconComponent className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2 drop-shadow">
                    {feature.title}
                  </h3>
                  <p className="text-white/70 drop-shadow">
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
        <h2 className="text-4xl font-bold text-white mb-4 drop-shadow-lg">
          Bereit für dein Immobilien-Abenteuer?
        </h2>
        <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto drop-shadow">
          Starte jetzt dein erstes Spiel und erlebe Monopoly wie nie zuvor. 
          Sammle Immobilien, baue dein Imperium auf und werde zum Monopoly-Champion!
        </p>
        <Button 
          size="lg" 
          className="text-xl px-12 py-6 gap-3 bg-gradient-success hover:scale-105 transition-all shadow-property"
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
