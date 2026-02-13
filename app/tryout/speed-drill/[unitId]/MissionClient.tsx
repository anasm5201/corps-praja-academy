'use client';

import { useState, useEffect } from 'react';
import { Heart, Timer, ArrowRight, XCircle, CheckCircle, ShieldAlert, RotateCcw, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { submitMissionResult } from '@/app/actions/speedDrill';

type MissionClientProps = {
  unitData: {
    unitNumber: number;
    questions: any[];
  }
};

export default function MissionClient({ unitData }: MissionClientProps) {
  const router = useRouter();
  const [currentIdx, setCurrentIdx] = useState(0);
  const [hearts, setHearts] = useState(5);
  const [timeLeft, setTimeLeft] = useState(30);
  const [selectedCode, setSelectedCode] = useState<string | null>(null); // UBAH JADI 'CODE'
  const [isAnswered, setIsAnswered] = useState(false);
  const [status, setStatus] = useState<'PLAYING' | 'VICTORY' | 'DEFEAT' | 'SUBMITTING'>('PLAYING');
  const [score, setScore] = useState(0);

  const question = unitData.questions[currentIdx];
  const progress = ((currentIdx) / unitData.questions.length) * 100;

  useEffect(() => {
    if (status !== 'PLAYING' || isAnswered) return;
    if (timeLeft <= 0) {
      handleTimeOut();
      return;
    }
    const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, status, isAnswered]);

  const getFeedbackStatus = (pts: number) => {
    if (pts === 5) return 'PERFECT';
    if (pts > 0) return 'PARTIAL';
    return 'WRONG';
  };

  const handleAnswer = (option: any) => {
    if (isAnswered) return;
    
    // HYBRID LOGIC: Ambil code atau key
    const code = option.code || option.key;
    setSelectedCode(code);
    setIsAnswered(true);

    const feedback = getFeedbackStatus(option.score);
    if (feedback === 'PERFECT') setScore(s => s + option.score + 5);
    else if (feedback === 'PARTIAL') setScore(s => s + option.score);
    else {
       setHearts(h => {
         const newHearts = h - 1;
         if (newHearts <= 0) setStatus('DEFEAT');
         return newHearts;
       });
    }
  };

  const handleTimeOut = () => {
    setIsAnswered(true);
    setHearts(h => {
      const newHearts = h - 1;
      if (newHearts <= 0) setStatus('DEFEAT');
      return newHearts;
    });
  };

  const handleNext = async () => {
    if (currentIdx < unitData.questions.length - 1) {
      setCurrentIdx(prev => prev + 1);
      setTimeLeft(30); 
      setIsAnswered(false);
      setSelectedCode(null);
    } else {
      setStatus('SUBMITTING');
      const maxPossible = unitData.questions.length * 10;
      const percentage = (score / maxPossible) * 100;
      let stars = 1;
      if (percentage > 80) stars = 3;
      else if (percentage > 50) stars = 2;

      await submitMissionResult(unitData.unitNumber, score, stars);
      setStatus('VICTORY');
    }
  };

  if (status === 'DEFEAT') {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center">
        <ShieldAlert className="w-24 h-24 text-red-600 mb-6 animate-pulse" />
        <h1 className="text-4xl font-black text-red-600 mb-2 tracking-tighter">MISI GAGAL</h1>
        <p className="text-gray-400 mb-8">Anda gugur di medan tugas. Evaluasi dan coba lagi.</p>
        <button onClick={() => window.location.reload()} className="px-6 py-3 bg-gray-800 rounded-lg font-bold hover:bg-gray-700 flex items-center gap-2 mx-auto">
            <RotateCcw className="w-4 h-4" /> Ulangi Misi
        </button>
        <Link href="/tryout/speed-drill" className="block mt-4 text-gray-500 hover:text-white">Kembali ke Markas</Link>
      </div>
    );
  }

  if (status === 'VICTORY' || status === 'SUBMITTING') {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-24 h-24 bg-yellow-500 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(234,179,8,0.5)]">
            <CheckCircle className="w-12 h-12 text-black" />
        </div>
        <h1 className="text-4xl font-black text-yellow-500 mb-2 tracking-tighter">MISI SUKSES</h1>
        <p className="text-gray-400 mb-8">Laporan telah dikirim ke Markas Pusat.</p>
        
        <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 mb-8 w-full max-w-sm mx-auto">
            <div className="flex justify-between mb-2">
                <span className="text-gray-500">Total XP</span>
                <span className="font-bold text-xl text-green-400">+{score} XP</span>
            </div>
            <div className="flex justify-between">
                <span className="text-gray-500">Sisa Nyawa</span>
                <div className="flex text-red-500">
                    {[...Array(hearts)].map((_, i) => <Heart key={i} className="w-5 h-5 fill-current" />)}
                </div>
            </div>
        </div>

        <button 
            onClick={() => router.push('/tryout/speed-drill')}
            className="px-10 py-4 bg-orange-600 rounded-full font-black text-white hover:bg-orange-500 transition shadow-lg shadow-orange-900/20"
        >
            {status === 'SUBMITTING' ? 'MENYIMPAN...' : 'LANJUTKAN OPERASI'}
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col max-w-md mx-auto relative border-x border-gray-900">
      
      {/* TOP BAR */}
      <div className="p-4 flex items-center gap-4">
        <Link href="/tryout/speed-drill">
            <XCircle className="w-6 h-6 text-gray-500 hover:text-white transition" />
        </Link>
        <div className="flex-1 h-3 bg-gray-800 rounded-full overflow-hidden relative">
            <div className="h-full bg-orange-500 transition-all duration-500 ease-out" style={{ width: `${progress}%` }} />
        </div>
        <div className="flex items-center gap-1 text-red-500 font-bold">
            <Heart className={`w-6 h-6 fill-current ${hearts === 1 ? 'animate-ping' : ''}`} />
            <span>{hearts}</span>
        </div>
      </div>

      {/* QUESTION AREA */}
      <div className="flex-1 p-6 flex flex-col justify-center">
        <div className="flex justify-between items-start mb-4">
             <span className="px-3 py-1 bg-gray-800 rounded text-xs font-bold text-gray-400 uppercase tracking-wider">{question.type}</span>
             <div className={`flex items-center gap-2 font-mono font-bold ${timeLeft <= 5 ? 'text-red-500 animate-pulse' : 'text-gray-400'}`}>
                <Timer className="w-4 h-4" />
                <span>00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}</span>
            </div>
        </div>

        <h2 className="text-lg font-bold leading-relaxed mb-8">{question.text}</h2>
        
        {question.image && (
             <div className="mb-6 p-4 bg-white rounded-lg flex justify-center" dangerouslySetInnerHTML={{ __html: question.image }} />
        )}

        <div className="flex flex-col gap-3">
            {question.options.map((opt: any) => {
                const optCode = opt.code || opt.key; // HYBRID CHECK
                let stateClass = "border-gray-800 bg-gray-900/50 hover:bg-gray-800"; 
                
                if (isAnswered) {
                    const st = getFeedbackStatus(opt.score);
                    
                    if (optCode === selectedCode) {
                        if (st === 'PERFECT') stateClass = "border-green-500 bg-green-900/20 text-green-400";
                        else if (st === 'PARTIAL') stateClass = "border-yellow-500 bg-yellow-900/20 text-yellow-400";
                        else stateClass = "border-red-500 bg-red-900/20 text-red-400";
                    } else if (st === 'PERFECT') {
                        stateClass = "border-green-500/50 bg-green-900/10 text-green-500/70"; 
                    } else {
                        stateClass = "border-gray-800 opacity-40 grayscale";
                    }
                }

                return (
                    <button 
                        key={opt.id} 
                        disabled={isAnswered} 
                        onClick={() => handleAnswer(opt)} 
                        className={`
                            w-full p-4 rounded-xl border-2 text-left transition-all duration-200 flex items-center justify-between group
                            ${stateClass}
                        `}
                    >
                        <div className="flex items-center gap-4">
                             <span className={`
                                w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm border shrink-0
                                ${!isAnswered ? 'border-gray-700 text-gray-500' : 
                                  getFeedbackStatus(opt.score) === 'PERFECT' ? 'border-green-500 text-green-500' : 
                                  getFeedbackStatus(opt.score) === 'PARTIAL' ? 'border-yellow-500 text-yellow-500' : 
                                  'border-red-900 text-red-700'}
                             `}>
                                {optCode}
                             </span>
                             <span className="font-medium text-sm leading-snug">{opt.text}</span>
                        </div>

                        {isAnswered && (
                            <span className={`
                                text-xs font-black px-2 py-1 rounded ml-2 shrink-0
                                ${getFeedbackStatus(opt.score) === 'PERFECT' ? 'bg-green-500 text-black' : 
                                  getFeedbackStatus(opt.score) === 'PARTIAL' ? 'bg-yellow-500 text-black' : 
                                  'bg-gray-800 text-gray-500'}
                            `}>
                                {opt.score} Pts
                            </span>
                        )}
                    </button>
                )
            })}
        </div>
      </div>

      {/* FEEDBACK SHEET */}
      <div className={`fixed bottom-0 w-full max-w-md bg-[#111] border-t border-gray-800 p-6 transform transition-transform duration-300 z-50 ${isAnswered ? 'translate-y-0' : 'translate-y-full'}`}>
        <div className="flex flex-col gap-4">
            {(() => {
                if (!selectedCode) return null;
                // CARI OPSI BERDASARKAN CODE ATAU KEY
                const chosenOpt = question.options.find((o:any) => (o.code || o.key) === selectedCode);
                
                if (!chosenOpt) return null; // Safety check

                const st = getFeedbackStatus(chosenOpt.score || 0);
                return (
                    <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-full shrink-0 ${st === 'PERFECT' ? 'bg-green-900/30 text-green-500' : st === 'PARTIAL' ? 'bg-yellow-900/30 text-yellow-500' : 'bg-red-900/30 text-red-500'}`}>
                            {st === 'PERFECT' && <CheckCircle />}
                            {st === 'PARTIAL' && <AlertTriangle />}
                            {st === 'WRONG' && <XCircle />}
                        </div>
                        <div>
                            <h4 className={`font-bold uppercase tracking-wide ${st === 'PERFECT' ? 'text-green-500' : st === 'PARTIAL' ? 'text-yellow-500' : 'text-red-500'}`}>
                                {st === 'PERFECT' ? 'Sempurna!' : st === 'PARTIAL' ? 'Kurang Taktis!' : 'Salah Fatal!'}
                            </h4>
                            <p className="text-sm text-gray-400 mt-1 leading-relaxed">{question.explanation}</p>
                        </div>
                    </div>
                );
            })()}
            
            <button onClick={handleNext} className={`
                w-full py-4 rounded-xl font-black uppercase tracking-wider transition-all
                ${selectedCode && getFeedbackStatus(question.options.find((o:any) => (o.code || o.key) === selectedCode)?.score || 0) !== 'WRONG' 
                    ? 'bg-green-600 hover:bg-green-500 text-white shadow-lg shadow-green-900/20' 
                    : 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-900/20'}
            `}>
                LANJUT <ArrowRight className="inline ml-2 w-5 h-5" />
            </button>
        </div>
      </div>
    </div>
  );
}