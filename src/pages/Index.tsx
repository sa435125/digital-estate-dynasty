import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Shop } from "@/components/game/Shop";
import { 
  Play, 
  Users, 
  Trophy, 
  Zap, 
  Settings, 
  Star,
  Crown,
  Gamepad2,
  LogOut,
  ShoppingCart
} from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  const { user, loading, signOut } = useAuth();
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-16 sm:py-24">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-4 mb-6">
            <Crown className="h-16 w-16 text-yellow-400 animate-pulse" />
            <div>
              <h1 className="text-6xl font-bold bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent mb-2">
                FastEstate
              </h1>
              <p className="text-xl text-slate-300">
                Das ultimative Fantasy-Immobilienspiel
              </p>
            </div>
          </div>
          <div className="max-w-2xl mx-auto">
            <p className="text-lg text-slate-400 leading-relaxed">
              Tauche ein in eine magische Welt voller Kristallgassen und Drachenpaläste. 
              Baue dein Immobilienimperium auf und werde zum reichsten Magier des Reiches!
            </p>
          </div>
          
          {/* User Actions */}
          <div className="flex items-center justify-center gap-4 mt-6">
            {loading ? (
              <div className="text-slate-400">Lade...</div>
            ) : user ? (
              <div className="flex items-center gap-4">
                <span className="text-white">Willkommen, {user.email}</span>
                <Shop userCoins={1500} />
                <Button
                  onClick={signOut}
                  variant="outline"
                  className="border-slate-600 text-slate-300 hover:bg-slate-700"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Abmelden
                </Button>
              </div>
            ) : (
              <Button
                onClick={() => navigate("/auth")}
                className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
              >
                Anmelden / Registrieren
              </Button>
            )}
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
                  className={`cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 bg-slate-800/90 backdrop-blur-sm border-slate-700 ${
                    selectedMode === mode.id ? "ring-2 ring-yellow-400 ring-offset-2 ring-offset-transparent" : ""
                  }`}
                  onClick={() => setSelectedMode(mode.id)}
                >
                <CardHeader className="text-center">
                  <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center shadow-lg">
                    <IconComponent className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-xl text-white">{mode.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-slate-300 text-center">
                    {mode.description}
                  </p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Spieler:</span>
                      <Badge variant="outline" className="border-slate-600 text-slate-300 bg-slate-700">
                        {mode.players}
                      </Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Dauer:</span>
                      <Badge variant="outline" className="border-slate-600 text-slate-300 bg-slate-700">
                        {mode.duration}
                      </Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Schwierigkeit:</span>
                      <Badge variant="secondary" className="bg-slate-600 text-slate-300 border-0">
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
              onClick={() => user ? navigate("/lobby") : navigate("/auth")}
              className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold py-3 px-6 rounded-xl shadow-lg transform transition-all hover:scale-105"
            >
              <Play className="mr-2 h-5 w-5" />
              {user ? "Spiel Starten" : "Jetzt Spielen"}
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
                  <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center shadow-lg">
                    <IconComponent className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2 drop-shadow">
                    {feature.title}
                  </h3>
                  <p className="text-slate-300 drop-shadow">
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
        <p className="text-lg text-slate-300 mb-8 max-w-2xl mx-auto drop-shadow">
          Starte jetzt dein erstes Spiel und erlebe FastEstate wie nie zuvor. 
          Sammle Immobilien, baue dein Imperium auf und werde zum Monopoly-Champion!
        </p>
        <Button 
          onClick={() => user ? navigate("/lobby") : navigate("/auth")}
          className="text-xl px-12 py-6 gap-3 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 transition-all shadow-lg"
        >
          <Play className="h-6 w-6" />
          {user ? "Spiel Starten" : "Jetzt Spielen"}
        </Button>
      </div>
    </div>
  );
};

export default Index;