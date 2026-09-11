import React, { useState } from 'react';
import { 
  X, 
  Bell, 
  Sparkles, 
  Send, 
  CheckCheck, 
  ShieldCheck, 
  Clock,
  Radio,
  Check,
  Zap,
  Volume2,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { PushNotification } from '../types';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({ isOpen, onClose }) => {
  const { 
    notifications, 
    markNotificationsAsRead, 
    pushEnabled,
    togglePushNotifications,
    simulateBrowserPushNotification 
  } = useAuth();

  const [toggling, setToggling] = useState(false);
  const [tested, setTested] = useState(false);

  if (!isOpen) return null;

  const handleTogglePush = async () => {
    setToggling(true);
    try {
      await togglePushNotifications();
    } catch (err) {
      console.warn('Erro ao alternar push:', err);
    } finally {
      setToggling(false);
    }
  };

  const handleSendTestNotification = () => {
    simulateBrowserPushNotification(
      '🎯 Nova Vaga Compatível Encontrada!',
      'Senior Full Stack Engineer na Stone (LinkedIn) - 95% de compatibilidade com sua faixa salarial (R$ 15.000 - R$ 18.000).'
    );
    setTested(true);
    setTimeout(() => setTested(false), 3000);
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case 'job_match':
        return <Sparkles className="w-4 h-4 text-cyan-400" />;
      case 'application_update':
        return <Send className="w-4 h-4 text-emerald-400" />;
      case 'ats_alert':
        return <Radio className="w-4 h-4 text-purple-400" />;
      default:
        return <Bell className="w-4 h-4 text-indigo-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-indigo-950/40 via-slate-900 to-slate-900">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-600/30 border border-indigo-500/40 text-indigo-300">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Notificações em Tempo Real</h3>
              <p className="text-xs text-slate-400">Alertas de vagas compatíveis e evolução de candidaturas</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Primary Interactive Push Activation Card */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className={`p-2 rounded-xl border ${
                pushEnabled ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-400' : 'bg-slate-900 border-slate-800 text-slate-400'
              }`}>
                <Radio className={`w-4 h-4 ${pushEnabled ? 'animate-pulse text-emerald-400' : ''}`} />
              </div>
              <div>
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  Alertas Push em Tempo Real
                  {pushEnabled && (
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      ATIVO
                    </span>
                  )}
                </span>
                <p className="text-[11px] text-slate-400">
                  {pushEnabled
                    ? 'Recebendo alertas instantâneos de vagas e processos'
                    : 'Ative para ser alertado assim que uma vaga compatível surgir'}
                </p>
              </div>
            </div>

            {/* Toggle Switch */}
            <button
              onClick={handleTogglePush}
              disabled={toggling}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                pushEnabled ? 'bg-emerald-500' : 'bg-slate-800'
              }`}
              role="switch"
              aria-checked={pushEnabled}
            >
              <span
                aria-hidden="true"
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                  pushEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Action Button & Test Notification */}
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={handleTogglePush}
              disabled={toggling}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 active:scale-95 shadow-md ${
                pushEnabled
                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                  : 'bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white shadow-indigo-500/20'
              }`}
            >
              {pushEnabled ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Push Ativado (Clique p/ Desativar)</span>
                </>
              ) : (
                <>
                  <Radio className="w-3.5 h-3.5" />
                  <span>Ativar Notificações Push Agora</span>
                </>
              )}
            </button>

            <button
              onClick={handleSendTestNotification}
              className="py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              title="Disparar um alerta de teste para verificar o funcionamento"
            >
              <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>{tested ? 'Alerta Enviado!' : 'Testar Alerta'}</span>
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="p-4 space-y-2.5 max-h-[50vh] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400 space-y-1">
              <Bell className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p className="font-semibold text-slate-300">Nenhuma notificação no histórico.</p>
              <p className="text-[11px] text-slate-500">
                Você receberá alertas quando novas vagas forem rastreadas ou você enviar uma candidatura.
              </p>
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                className={`p-3.5 rounded-2xl border transition-all flex items-start gap-3 ${
                  n.is_read
                    ? 'bg-slate-950/40 border-slate-800/60 opacity-80'
                    : 'bg-indigo-950/30 border-indigo-800/60 shadow-sm'
                }`}
              >
                <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 shrink-0 mt-0.5">
                  {getIconForType(n.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-xs font-bold text-white truncate">{n.title}</h4>
                    <span className="text-[10px] text-slate-500 flex items-center gap-1 shrink-0">
                      <Clock className="w-3 h-3" />
                      {new Date(n.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">{n.message}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer actions */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={markNotificationsAsRead}
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
          >
            <CheckCheck className="w-4 h-4" />
            <span>Marcar todas como lidas</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
};
