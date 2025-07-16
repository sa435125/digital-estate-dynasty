export interface Property {
  id: string;
  name: string;
  price: number;
  rent: number;
  color: string;
  owner?: string | number;
  type: 'property' | 'railroad' | 'utility' | 'special';
  houses?: number;
  mortgage?: boolean;
  description: string;
}

// Custom Fantasy City Properties
export const BOARD_PROPERTIES: Property[] = [
  { 
    id: "start", 
    name: "Nexus Plaza", 
    price: 0, 
    rent: 0, 
    color: "special", 
    type: "special",
    description: "Der zentrale Startpunkt aller Abenteurer"
  },
  { 
    id: "cyan1", 
    name: "Kristallgasse", 
    price: 60, 
    rent: 2, 
    color: "bg-cyan-400", 
    type: "property",
    description: "Eine schimmernde Straße voller Kristallhändler"
  },
  { 
    id: "fortune1", 
    name: "Glücksfeld", 
    price: 0, 
    rent: 0, 
    color: "special", 
    type: "special",
    description: "Hier entscheidet das Schicksal"
  },
  { 
    id: "cyan2", 
    name: "Saphirweg", 
    price: 60, 
    rent: 4, 
    color: "bg-cyan-400", 
    type: "property",
    description: "Edle Edelsteinschleifereien säumen den Weg"
  },
  { 
    id: "tax1", 
    name: "Gildensteuer", 
    price: 0, 
    rent: -200, 
    color: "special", 
    type: "special",
    description: "Die Händlergilde verlangt ihren Tribut"
  },
  { 
    id: "rail1", 
    name: "Nordtunnel", 
    price: 200, 
    rent: 25, 
    color: "bg-gray-600", 
    type: "railroad",
    description: "Schnelle Verbindung zu den nördlichen Landen"
  },
  { 
    id: "orange1", 
    name: "Feuerplatz", 
    price: 100, 
    rent: 6, 
    color: "bg-orange-500", 
    type: "property",
    description: "Hier schmieden die besten Waffenschmiede"
  },
  { 
    id: "destiny1", 
    name: "Schicksalsrad", 
    price: 0, 
    rent: 0, 
    color: "special", 
    type: "special",
    description: "Das Rad des Schicksals dreht sich"
  },
  { 
    id: "orange2", 
    name: "Glutstraße", 
    price: 100, 
    rent: 6, 
    color: "bg-orange-500", 
    type: "property",
    description: "Warme Bäckereien und gemütliche Tavernen"
  },
  { 
    id: "orange3", 
    name: "Phönixallee", 
    price: 120, 
    rent: 8, 
    color: "bg-orange-500", 
    type: "property",
    description: "Majestätische Straße der Feuermagier"
  },
  
  { 
    id: "prison", 
    name: "Drachenverlies", 
    price: 0, 
    rent: 0, 
    color: "special", 
    type: "special",
    description: "Hier warten die Unvorsichtigen auf ihre Befreiung"
  },
  { 
    id: "purple1", 
    name: "Mondscheinweg", 
    price: 140, 
    rent: 10, 
    color: "bg-purple-500", 
    type: "property",
    description: "Geheimnisvolle Straße der Nachtmagier"
  },
  { 
    id: "utility1", 
    name: "Magiequelle", 
    price: 150, 
    rent: 0, 
    color: "bg-blue-600", 
    type: "utility",
    description: "Sprudelnde Quelle magischer Energie"
  },
  { 
    id: "purple2", 
    name: "Sternenplatz", 
    price: 140, 
    rent: 10, 
    color: "bg-purple-500", 
    type: "property",
    description: "Astrologen deuten hier die Sterne"
  },
  { 
    id: "purple3", 
    name: "Nebelallee", 
    price: 160, 
    rent: 12, 
    color: "bg-purple-500", 
    type: "property",
    description: "Mystische Straße der Illusionisten"
  },
  { 
    id: "rail2", 
    name: "Westbrücke", 
    price: 200, 
    rent: 25, 
    color: "bg-gray-600", 
    type: "railroad",
    description: "Majestätische Brücke über den Wolkensee"
  },
  { 
    id: "red1", 
    name: "Rubinstraße", 
    price: 180, 
    rent: 14, 
    color: "bg-red-500", 
    type: "property",
    description: "Luxuriöse Straße der reichen Händler"
  },
  { 
    id: "fortune2", 
    name: "Glücksfeld", 
    price: 0, 
    rent: 0, 
    color: "special", 
    type: "special",
    description: "Erneut entscheidet das Glück"
  },
  { 
    id: "red2", 
    name: "Karminplatz", 
    price: 180, 
    rent: 14, 
    color: "bg-red-500", 
    type: "property",
    description: "Prachtvoll geschmückter Marktplatz"
  },
  { 
    id: "red3", 
    name: "Purpurpalast", 
    price: 200, 
    rent: 16, 
    color: "bg-red-500", 
    type: "property",
    description: "Königliche Residenz der Adligen"
  },
  
  { 
    id: "sanctuary", 
    name: "Freies Refugium", 
    price: 0, 
    rent: 0, 
    color: "special", 
    type: "special",
    description: "Ein sicherer Hafen für alle Reisenden"
  },
  { 
    id: "yellow1", 
    name: "Goldgasse", 
    price: 220, 
    rent: 18, 
    color: "bg-yellow-400", 
    type: "property",
    description: "Glänzende Straße der Goldschmiede"
  },
  { 
    id: "destiny2", 
    name: "Schicksalsrad", 
    price: 0, 
    rent: 0, 
    color: "special", 
    type: "special",
    description: "Das mystische Rad dreht sich erneut"
  },
  { 
    id: "yellow2", 
    name: "Sonnenplatz", 
    price: 220, 
    rent: 18, 
    color: "bg-yellow-400", 
    type: "property",
    description: "Strahlender Platz der Lichtmagier"
  },
  { 
    id: "yellow3", 
    name: "Bernsteinallee", 
    price: 240, 
    rent: 20, 
    color: "bg-yellow-400", 
    type: "property",
    description: "Kostbare Allee der Bernsteinhändler"
  },
  { 
    id: "rail3", 
    name: "Himmelsaufzug", 
    price: 200, 
    rent: 25, 
    color: "bg-gray-600", 
    type: "railroad",
    description: "Magischer Aufzug zu den Himmelsstädten"
  },
  { 
    id: "green1", 
    name: "Smaragdweg", 
    price: 260, 
    rent: 22, 
    color: "bg-green-500", 
    type: "property",
    description: "Prächtige Straße der Naturmagier"
  },
  { 
    id: "green2", 
    name: "Waldplatz", 
    price: 260, 
    rent: 22, 
    color: "bg-green-500", 
    type: "property",
    description: "Grüner Platz umgeben von uralten Bäumen"
  },
  { 
    id: "utility2", 
    name: "Lebensbaum", 
    price: 150, 
    rent: 0, 
    color: "bg-blue-600", 
    type: "utility",
    description: "Heiliger Baum des ewigen Lebens"
  },
  { 
    id: "green3", 
    name: "Jadepalast", 
    price: 280, 
    rent: 24, 
    color: "bg-green-500", 
    type: "property",
    description: "Wunderschöner Palast aus reinem Jade"
  },
  
  { 
    id: "banish", 
    name: "Verbannungstor", 
    price: 0, 
    rent: 0, 
    color: "special", 
    type: "special",
    description: "Von hier werden Unruhestifter verbannt"
  },
  { 
    id: "blue1", 
    name: "Diamantstraße", 
    price: 300, 
    rent: 26, 
    color: "bg-blue-500", 
    type: "property",
    description: "Die teuerste Straße der ganzen Stadt"
  },
  { 
    id: "blue2", 
    name: "Saphirpalast", 
    price: 300, 
    rent: 26, 
    color: "bg-blue-500", 
    type: "property",
    description: "Königlicher Palast aus blauem Saphir"
  },
  { 
    id: "fortune3", 
    name: "Glücksfeld", 
    price: 0, 
    rent: 0, 
    color: "special", 
    type: "special",
    description: "Ein letztes Mal entscheidet das Glück"
  },
  { 
    id: "blue3", 
    name: "Kristallturm", 
    price: 320, 
    rent: 28, 
    color: "bg-blue-500", 
    type: "property",
    description: "Majestätischer Turm aus reinem Kristall"
  },
  { 
    id: "rail4", 
    name: "Portaltor", 
    price: 200, 
    rent: 25, 
    color: "bg-gray-600", 
    type: "railroad",
    description: "Magisches Portal zu fernen Welten"
  },
  { 
    id: "destiny3", 
    name: "Schicksalsrad", 
    price: 0, 
    rent: 0, 
    color: "special", 
    type: "special",
    description: "Das finale Drehen des Schicksalsrads"
  },
  { 
    id: "legendary1", 
    name: "Drachenthron", 
    price: 350, 
    rent: 35, 
    color: "bg-indigo-600", 
    type: "property",
    description: "Der mächtigste Ort im ganzen Reich"
  },
  { 
    id: "tax2", 
    name: "Drachensteuer", 
    price: 0, 
    rent: -100, 
    color: "special", 
    type: "special",
    description: "Selbst Drachen fordern ihren Tribut"
  },
  { 
    id: "legendary2", 
    name: "Himmelspfad", 
    price: 400, 
    rent: 50, 
    color: "bg-indigo-600", 
    type: "property",
    description: "Der legendäre Pfad zu den Göttern"
  },
];