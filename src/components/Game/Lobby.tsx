import React, { useState } from 'react';
import { GameSession, LeaderboardEntry } from '@/src/types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Play, Trash2, Calendar, LayoutGrid, Clock, Trophy, Medal, User, Edit2, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';

interface LobbyProps {
  sessions: GameSession[];
  leaderboard: LeaderboardEntry[];
  playerName: string;
  onUpdatePlayerName: (name: string) => void;
  onStartNew: () => void;
  onJoinSession: (id: string) => void;
  onDeleteSession: (id: string) => void;
}

export const Lobby: React.FC<LobbyProps> = ({ 
  sessions, 
  leaderboard,
  playerName,
  onUpdatePlayerName,
  onStartNew, 
  onJoinSession, 
  onDeleteSession 
}) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(playerName);

  const activeSessions = sessions.filter(s => !s.isGameOver);
  const sortedSessions = [...activeSessions].sort((a, b) => b.lastPlayed - a.lastPlayed);

  const handleSaveName = () => {
    onUpdatePlayerName(tempName || "Architect");
    setIsEditingName(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-12 flex flex-col items-center">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl w-full"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-white mb-2">
              CITY <span className="text-slate-500">CARDS</span>
            </h1>
            <div className="flex items-center gap-3">
              {isEditingName ? (
                <div className="flex items-center gap-2">
                  <Input 
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    className="h-8 w-40 bg-slate-900 border-slate-700 text-slate-200 text-sm focus-visible:ring-emerald-500"
                    placeholder="Enter name..."
                    autoFocus
                    onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                  />
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-emerald-500 hover:text-emerald-400 hover:bg-emerald-500/10" onClick={handleSaveName}>
                    <Check className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2 group cursor-pointer" onClick={() => setIsEditingName(true)}>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-900 border border-slate-800 rounded-lg">
                    <User className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-sm font-bold text-slate-300">{playerName}</span>
                  </div>
                  <Edit2 className="w-3.5 h-3.5 text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              )}
              <span className="text-slate-600 text-sm font-medium">| Select a project or start fresh.</span>
            </div>
          </div>
          
          <Button 
            onClick={onStartNew}
            size="lg"
            className="bg-emerald-600 hover:bg-emerald-500 text-white gap-2 shadow-lg shadow-emerald-900/20"
          >
            <Plus className="w-5 h-5" /> Start New City
          </Button>
        </div>

        {sortedSessions.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-slate-900/40 border-2 border-dashed border-slate-800 rounded-3xl p-16 text-center"
          >
            <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <LayoutGrid className="w-8 h-8 text-slate-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-300 mb-2">No active projects</h3>
            <p className="text-slate-500 mb-8 max-w-xs mx-auto">Create your first city plan to begin your strategic building journey.</p>
            <Button onClick={onStartNew} variant="outline" className="border-slate-700 hover:bg-slate-800 text-slate-300">
              Get Started
            </Button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {sortedSessions.map((session, index) => (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="bg-slate-900 border-slate-800 hover:border-slate-700 transition-all hover:shadow-xl hover:shadow-black/50 group overflow-hidden">
                  <CardHeader className="pb-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl font-bold text-white group-hover:text-emerald-400 transition-colors">
                          {session.name}
                        </CardTitle>
                        <CardDescription className="text-slate-500 flex items-center gap-1.5 mt-1">
                          <Calendar className="w-3 h-3" />
                          Last modified {new Date(session.lastPlayed).toLocaleDateString()}
                        </CardDescription>
                      </div>
                      <div className="px-3 py-1 bg-slate-800 rounded-full text-[10px] font-black tracking-widest text-slate-400 uppercase">
                        Phase {session.state.stats.phase}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] text-slate-500 uppercase font-black tracking-wider">Round</span>
                        <span className="text-lg font-bold text-slate-200">{session.state.stats.round}/3</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] text-slate-500 uppercase font-black tracking-wider">Turns</span>
                        <span className="text-lg font-bold text-slate-200">{session.state.stats.turn}/4</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] text-slate-500 uppercase font-black tracking-wider">Points</span>
                        <span className="text-lg font-bold text-emerald-500">{session.state.stats.cityProduction.points}</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="bg-slate-800/30 p-4 flex gap-3">
                    <Button 
                      onClick={() => onJoinSession(session.id)}
                      className="flex-1 bg-slate-800 hover:bg-slate-700 text-white gap-2 border border-slate-700"
                    >
                      <Play className="w-4 h-4" /> Resume Build
                    </Button>
                    <Button 
                      onClick={() => onDeleteSession(session.id)}
                      variant="ghost" 
                      size="icon"
                      className="text-slate-500 hover:text-red-400 hover:bg-red-950/30"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        <div className="mt-16 text-center">
            <p className="text-slate-600 text-sm flex items-center justify-center gap-2">
                <Clock className="w-4 h-4" /> All changes are saved automatically to your local storage.
            </p>
        </div>

        {leaderboard.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-20 w-full"
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-yellow-500/10 rounded-xl flex items-center justify-center">
                <Trophy className="w-6 h-6 text-yellow-500" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-white tracking-tight">HALL OF RECORDS</h2>
                <p className="text-slate-500 text-xs font-mono uppercase tracking-widest">Global Performance Rankings</p>
              </div>
            </div>

            <div className="bg-slate-900/50 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-800/20">
                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Rank</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Architect</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">City Project</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Date</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Points</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map((entry, index) => (
                    <tr key={entry.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {index < 3 ? (
                            <Medal className={cn(
                              "w-5 h-5",
                              index === 0 ? "text-yellow-400" : index === 1 ? "text-slate-300" : "text-amber-600"
                            )} />
                          ) : (
                            <span className="text-slate-600 font-mono text-sm pl-1">#{index + 1}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-slate-400 font-medium text-sm italic">{entry.playerName || "Unknown"}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-slate-200 font-bold group-hover:text-emerald-400 transition-colors uppercase tracking-tight">{entry.cityName}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-slate-500 text-xs font-mono">{new Date(entry.date).toLocaleDateString()}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-xl font-black text-emerald-500 tracking-tighter drop-shadow-[0_0_10px_rgba(16,185,129,0.3)]">
                          {entry.score}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};
