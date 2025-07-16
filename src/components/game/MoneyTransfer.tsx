import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Coins, Send, X } from "lucide-react";

interface Player {
  id: number;
  name: string;
  money: number;
  position: number;
  color: string;
  properties: string[];
}

interface MoneyTransferProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlayer: Player;
  allPlayers: Player[];
  onTransfer: (fromPlayerId: number, toPlayerId: number, amount: number) => void;
}

export function MoneyTransfer({ isOpen, onClose, currentPlayer, allPlayers, onTransfer }: MoneyTransferProps) {
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const { toast } = useToast();

  const otherPlayers = allPlayers.filter(p => p.id !== currentPlayer.id && p.money > 0);

  const handleTransfer = () => {
    const transferAmount = parseInt(amount);
    const targetPlayerId = parseInt(selectedPlayerId);

    if (!selectedPlayerId || !amount) {
      toast({
        title: "Ungültige Eingabe",
        description: "Bitte wähle einen Spieler und gib einen Betrag ein",
        variant: "destructive"
      });
      return;
    }

    if (transferAmount <= 0) {
      toast({
        title: "Ungültiger Betrag",
        description: "Der Betrag muss größer als 0 sein",
        variant: "destructive"
      });
      return;
    }

    if (transferAmount > currentPlayer.money) {
      toast({
        title: "Nicht genug Geld",
        description: "Du hast nicht genug Geld für diese Überweisung",
        variant: "destructive"
      });
      return;
    }

    const targetPlayer = allPlayers.find(p => p.id === targetPlayerId);
    if (!targetPlayer) return;

    onTransfer(currentPlayer.id, targetPlayerId, transferAmount);
    
    toast({
      title: "💰 Geld überwiesen!",
      description: `${transferAmount.toLocaleString('de-DE')}€ an ${targetPlayer.name} gesendet`,
    });

    setAmount("");
    setSelectedPlayerId("");
    onClose();
  };

  const quickAmounts = [100, 200, 500, 1000];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-slate-800 border-slate-700 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
              <Send className="h-4 w-4 text-white" />
            </div>
            Geld überweisen
          </DialogTitle>
          <DialogDescription className="text-slate-300">
            Sende Geld an einen anderen Spieler
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current Player Info */}
          <div className="bg-slate-700/50 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Avatar className={`border-2 ${currentPlayer.color}`}>
                <AvatarFallback className={`font-bold text-white ${currentPlayer.color}`}>
                  {currentPlayer.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium">{currentPlayer.name}</div>
                <div className="flex items-center gap-2 text-sm text-slate-300">
                  <Coins className="h-4 w-4" />
                  {currentPlayer.money.toLocaleString('de-DE')}€
                </div>
              </div>
            </div>
          </div>

          {/* Target Player Selection */}
          <div>
            <label className="text-sm font-medium text-slate-300 mb-2 block">
              Empfänger auswählen
            </label>
            <Select value={selectedPlayerId} onValueChange={setSelectedPlayerId}>
              <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                <SelectValue placeholder="Spieler auswählen..." />
              </SelectTrigger>
              <SelectContent className="bg-slate-700 border-slate-600">
                {otherPlayers.map((player) => (
                  <SelectItem key={player.id} value={player.id.toString()}>
                    <div className="flex items-center gap-3">
                      <Avatar className={`w-6 h-6 border ${player.color}`}>
                        <AvatarFallback className={`text-xs font-bold text-white ${player.color}`}>
                          {player.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span>{player.name}</span>
                      <Badge variant="outline" className="ml-auto text-xs">
                        {player.money.toLocaleString('de-DE')}€
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Amount Input */}
          <div>
            <label className="text-sm font-medium text-slate-300 mb-2 block">
              Betrag eingeben
            </label>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
              className="bg-slate-700 border-slate-600 text-white text-right"
              min="1"
              max={currentPlayer.money}
            />
            
            {/* Quick Amount Buttons */}
            <div className="flex gap-2 mt-2">
              {quickAmounts.map((quickAmount) => (
                <Button
                  key={quickAmount}
                  variant="outline"
                  size="sm"
                  onClick={() => setAmount(quickAmount.toString())}
                  disabled={quickAmount > currentPlayer.money}
                  className="border-slate-600 text-slate-300 hover:bg-slate-600"
                >
                  {quickAmount}€
                </Button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button 
              onClick={handleTransfer}
              className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
              disabled={!selectedPlayerId || !amount || parseInt(amount) <= 0}
            >
              <Send className="h-4 w-4 mr-2" />
              Überweisen
            </Button>
            <Button 
              variant="outline" 
              onClick={onClose}
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              <X className="h-4 w-4 mr-2" />
              Abbrechen
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}